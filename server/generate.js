var Git = require('git-fs'),
    Renderers = require('./renderers'),
    Path = require('path'),
    Data = require('./data'),
    fs = require('fs');

function mkdir_p(path, mode, callback, position) {
    mode = mode || 0777;
    position = position || 0;
    parts = require('path').normalize(path).split('/');
 
    if (position >= parts.length) {
        if (callback) {
            return callback();
        } else {
            return true;
        }
    }
 
    var directory = parts.slice(0, position + 1).join('/');
    fs.stat(directory, function(err) {
        if (err === null) {
            mkdir_p(path, mode, callback, position + 1);
        } else {
            fs.mkdir(directory, mode, function (err) {
                if (err) {
                    if (callback) {
                        return callback(err);
                    } else {
                        throw err;
                    }
                } else {
                    mkdir_p(path, mode, callback, position + 1);
                }
            })
        }
    });
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

Git(process.cwd());
var version = 'fs';

function writeTo(file) {
	var path = 'output/'+file;
	return function(err,result) {
		mkdir_p(Path.dirname(path), null, function() {
			var s = fs.createWriteStream(path);
			s.write(result.buffer);
			s.end();
		});
	};
}

function copyDir(src,dst,callback) {
	fs.readdir(src,function(err,entries) {
		if (err) { return callback(err); }
		fs.mkdir(dst,function() {
			entries.forEach(function(entry) {
				var srcs = fs.createReadStream(src+'/'+entry)
				var dsts = fs.createWriteStream(dst+'/'+entry);
				srcs.pipe(dsts);
			});
		});
	});
}

Renderers.markdown(version, 'description.markdown', 'index', filler({
	articles: getArticles(version),
	projects: getProjects(version)
}), writeTo('index.html'));

Renderers.rssmarkdown(version, 'description.markdown', 'feed.xml', filler({
	articles: getArticles(version)
}), writeTo('feed.xml'));

getProjects(version)(null,function(err,projects) {
	projects.forEach(function(project) {
		Renderers.markdown(version, Path.join('projects', project.name + '.markdown'), 'project', filler({
			author: function(props, callback) { if (props.author) { Data.author(version, props.author, callback); } else { callback(null, props.author); } },
			articles: getArticles(version),
			projects: getProjects(version)
		}), writeTo('project/'+project.name+'.html'));
	});
});

getArticles(version)(null,function(err,articles) {
	articles.forEach(function(article) {
		Renderers.markdown(version, Path.join('articles', article.name + '.markdown'), 'article', filler({
			author: function(props, callback) { if (props.author) { Data.author(version, props.author, callback); } else { callback(undefined); } },
			articles: getArticles(version),
			projects: getProjects(version)
		}), writeTo(article.name+'.html'));

		copyDir('articles/'+article.name, 'output/'+article.name,function(){})
	});
});

copyDir('skin/public','output',function(){});