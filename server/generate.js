var Git = require('git-fs'),
    Renderers = require('./renderers'),
    Path = require('path'),
    Data = require('./data'),
    mkdirp = require('mkdirp'),
    fs = require('fs');

var outputdir = process.argv[2] || 'target/development-build';
console.log(outputdir);
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
    Data.markdowns(version, 'projects', undefined, function(err,projects) {
      projects = projects.sort(function(a,b) { return a.name === b.name ? 0 : (a.name > b.name ? 1 : -1); });
      callback(err,projects);
    });
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
	var path = Path.join(outputdir,file);
	return function(err,result) {
    if (err) { console.error('Error:', err); return; }
		mkdirp(Path.dirname(path), function() {
			var s = fs.createWriteStream(path);
			s.write(result.buffer);
			s.end();
		});
	};
}

function copyDir(src,dst,callback) {
  console.log(src,'->',dst);
	fs.readdir(src,function(err,entries) {
		if (err) { return callback(err); }
		mkdirp(dst,function() {
			entries.forEach(function(entry) {
				var srcs = fs.createReadStream(src+'/'+entry)
				var dsts = fs.createWriteStream(dst+'/'+entry);
				srcs.pipe(dsts);
			});
		});
	});
}

Renderers.haml(version, 'donate', filler({
  articles: getArticles(version),
  projects: getProjects(version)
}), writeTo('donate.html'));

Renderers.markdown(version, 'description.markdown', 'index', filler({
	articles: getArticles(version),
	projects: getProjects(version)
}), writeTo('index.html'));

Renderers.rssmarkdown(version, 'description.markdown', 'feed.xml', filler({
	articles: getArticles(version),
  projects: getProjects(version)
}), writeTo('feed.xml'));

Renderers.markdown(version, Path.join('projects.markdown'), 'projects', filler({
  projects: getProjects(version)
}), writeTo('projects.html'));

Renderers.markdown(version, Path.join('contact.markdown'), 'markdownpage', filler({
  projects: getProjects(version)
}), writeTo('contact.html'));

getProjects(version)(null,function(err,projects) {
	projects.forEach(function(project) {
		Renderers.markdown(version, Path.join('projects', project.name + '.markdown'), 'project', filler({
			author: function(props, callback) { if (props.author) { Data.author(version, props.author, callback); } else { callback(null, props.author); } },
			articles: getArticles(version),
			projects: getProjects(version)
		}), writeTo('projects/'+project.name+'.html'));

    copyDir('projects/'+project.name, Path.join(outputdir,'projects',project.name),function(){})
	});
});

getArticles(version)(null,function(err,articles) {
	articles.forEach(function(article) {
		Renderers.markdown(version, Path.join('articles', article.name + '.markdown'), 'article', filler({
			author: function(props, callback) { if (props.author) { Data.author(version, props.author, callback); } else { callback(undefined); } },
			articles: getArticles(version),
			projects: getProjects(version)
		}), writeTo(article.name+'.html'));

		copyDir('articles/'+article.name, Path.join(outputdir,article.name),function(){})
	});
});

copyDir('skin/public',outputdir,function(){});