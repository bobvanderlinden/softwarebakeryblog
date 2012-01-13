/*
Copyright (c) 2010 Tim Caswell <tim@creationix.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

require('proto');
var Url = require('url'),
    Git = require('git-fs'),
    Renderers = require('./renderers'),
    Path = require('path'),
    Data = require('./data'),
    spawn = require('child_process').spawn;

var routes = [];

function split() {
  var functions = arguments;
  return function() {
    var args = arguments;
    var result = undefined;
    functions.forEach(function(f) {
      result = f.apply(null, args);
    });
    return result;
  }
}

function logArgs(message, f) {
  return split(function() {
    console.log(message, arguments);
  }, f);
}

function dbg() {
  var name, f;
  if (typeof arguments[0] === 'string') {
	name = arguments[0];
	f = arguments[1];
  } else {
	name = undefined;
	f = arguments[0];
  }
  return function() {
	if (name) {
	  console.log('Name:', name);
	}
	console.log('Function:', f.toString().split('\n')[0]);
	var args = [];
	for(var i = 0; i < arguments.length; i++) { args.push(arguments[i]); }
	console.log('Arguments:', args);
	try {
	  var result = f.apply(null, arguments);
	  console.log('Result:', result);
	} catch(e) {
	  console.log('Exception:', e);
	  throw e;
	}
  };
}

function fill(/*initial obj, { name: function ... }, ... arguments ..., callback*/) {
  var result = arguments[0];
  var funcs = arguments[1];
  var callback = arguments[arguments.length-1];
  var args = arguments.length > 3 ? Array.prototype.slice.apply(arguments, [2, arguments.length-2]) : [];
  var callbacks = Object.keys(funcs).length;
  for(var name in funcs) {
    (function(name) {
      var rhandler = function(err, r) {
        if (err) { callback(err, null); return; }
        result[name] = r;
        callbacks--;
        if (callbacks === 0) {
          callback(null, result);
        }
      };
      var r = funcs[name].apply(null, [result].concat(args).concat([rhandler]));
      if (r && !result[name]) { rhandler(r); }
    })(name);
  }
  if (callbacks === 0) {
    callback(null, result);
  }
}

function addRoute(regex, renderer) {
  routes.push({regex: regex, renderer: renderer});
}

function handleRoute(req, res, next, renderer, match) {
  function callback(err, data) {
    if (err) {
      return err.errno === process.ENOENT
        ? next()
        : next(err);
    }
    res.writeHead(200, data.headers);
    res.end(data.buffer);
  }
  renderer.apply(null, match.concat([callback]));
}

function getArticles(version) {
  return function(p, callback) {
    Data.markdowns(version, 'articles', function(p, callback) {
      fill(p, {
        author: function(p, callback) { if (p.author) { Data.author(version, p.author, callback); } else { callback(null, undefined); } }
      }, callback);
    }, callback);
  };
}

function getProjects(version) {
  return function(p, callback) {
    Data.markdowns(version, 'projects', undefined, callback);
  };
}

function filler(obj) {
  return function(p, callback) {
    fill(p, obj, callback);
  };
}

module.exports = function setup(repo) {

  // Initialize the Git Filesystem
  Git(repo = repo || process.cwd());

  // Set up our routes
  addRoute(/^\/$/, function(version, callback) {
    Renderers.markdown(version, 'description.markdown', 'index', filler({
        articles: getArticles(version),
        projects: getProjects(version)
      }), callback);
  });
  addRoute(/^\/feed.xml$/, function(version, callback) {
      Renderers.rssmarkdown(version, 'description.markdown', 'feed.xml', filler({
        articles: getArticles(version)
      }), callback);
  });
  addRoute(/^\/4b64j3k5b6jh3bk6b$/, function(version, callback) {
    function returnresult(r) {
      callback(null, { headers: {}, buffer: r });
    }
    var p = spawn('git', ['fetch', 'origin']);
    p.on('exit', function(code, signal) {
      if (code !== 0) { returnresult('fetching failed'); return; }
      p = spawn('git', ['reset', '--hard', 'origin/master']);
      p.on('exit', function(code, signal) {
        if (code !== 0) { returnresult('resetting failed'); return; }
        returnresult('ok');
      });
    });
  });
  addRoute(/^\/([a-z0-9_-]+)$/, function(version, article, callback) {
    Renderers.markdown(version, Path.join('articles', article + '.markdown'), 'article', filler({
      author: function(props, callback) { if (props.author) { Data.author(version, props.author, callback); } else { callback(undefined); } },
      articles: getArticles(version),
      projects: getProjects(version)
    }), callback);
  });
  addRoute(/^\/project\/([a-z0-9_-]+)$/, function(version, projectName, callback) {
    Renderers.markdown(version, Path.join('projects', projectName + '.markdown'), 'project', filler({
      author: function(props, callback) { if (props.author) { Data.author(version, props.author, callback); } else { callback(null, props.author); } },
      articles: getArticles(version),
      projects: getProjects(version)
    }), callback);
  });
  addRoute(/^\/(.+\.[a-z]{2,4})$/, Renderers.staticFile);


  return function handle(req, res, next) {
    var error = function(err) {
      res.writeHead(404, []);
      res.end('Not found');
    };
    var url = Url.parse(req.url);
    for (var i = 0, l = routes.length; i < l; i++) {
      var route = routes[i];
      var match = url.pathname.match(route.regex);
      if (match) {
        var arguments = ['fs'].concat(match.slice(1));
        handleRoute(req, res, error, route.renderer, arguments);
        return;
      }
    }
    next();
  }
};
