var Git = require('git-fs'),
    Path = require('path'),
    Step = require('step'),
    util = require(process.binding('natives').util ? 'util' : 'sys'),
    Script = process.binding('evals').Script,
    QueryString = require('querystring');

function preProcessMarkdown(markdown) {
  if (!(typeof markdown === 'string')) {
    markdown = markdown.toString();
  }
  var props = { };

  // Parse out headers
  var match;
  while(match = markdown.match(/^([a-z]+):\s*(.*)\s*\n/i)) {
    var name = match[1].toLowerCase(),
        value = match[2];
    markdown = markdown.substr(match[0].length);
    props[name] = value;
  }
  props.markdown = markdown;

  // Look for snippet placeholders
  var unique = props.uniqueSnippets = {};
  props.snippets = (markdown.match(/\n<[^<>:\s]+\.[a-z]{2,4}(\*|[#].+)?>\n/g) || []).map(
    function (original) {
      var path = original.substr(2, original.length - 4);

      var filename = path;
      execute = path[path.length - 1] === "*";
      if (execute) {
        filename = filename.substr(0, filename.length - 1);
      }
      base = path.substr(path.indexOf('/') + 1).replace(/[#*].*$/, '');
      var match = filename.match(/#(.+)$/);
      var name;
      if (match) {
        name = match[1];
        filename = path.substr(0, match.index);
      }
      return unique[base] = {
        original: original,
        filename: filename,
        execute: execute,
        base: base,
        name: name
      };
    }
  );
  if (props.snippets.length === 0) {
    props.uniqueSnippets = false;
  }


  return props;
}

function sandbox(snippet) {
  snippet.result = "";
  snippet.output = "";
  function fakeRequire(path) {
    var lib = require(path);
    return lib;
  }
  // Create a 'pseudo-write-stream', to act as the virtual 'stdout' stream.
  var stdout = new (require('stream').Stream)();
  stdout.writable = true;
  stdout.write = function(buf, enc) {
    if (!this.writable) throw new Error("Stream is not writable");
    if (!Buffer.isBuffer(buf)) {
      buf = new Buffer(buf, enc);
    }
    this.emit('data', buf);
  }
  stdout.end = function(buf, enc) {
    if (buf) { this.write(buf, enc); }
    this.writable = false;
  }
  stdout.on('data', function(data) {
    snippet.output += data.toString();
  });
  
  var env = {
    clear: function () { snippet.output = ""; },
    require: fakeRequire,
    process: {
      exit: function fakeExit() {},
      argv: [process.argv[0], snippet.filename],
      stdout: stdout
    },
    console: {
      log: function fakeLog() {
        arguments.forEach(function (data) {
          stdout.write(data + "\n");
        });
      },
      dir: function fakeDir() {
        arguments.forEach(function (data) {
          snippet.output += util.inspect(data) + "\n";
        });
      }
    }
  };
  env.process.__proto__ = process;

  var toRun = (snippet.beforeCode ? (snippet.beforeCode + "\nclear();\n") : "") + snippet.code;

  try {
    snippet.lastExpression = Script.runInNewContext(toRun, env, snippet.filename);
  } catch (err) {
    snippet.error = err;
  }
}

function activateSnippets(version, snippets, canExecute, callback) {
  Step (
    function () {
      if (snippets.length === 0) {
        callback(null, snippets);
        return;
      }
      var group = this.group();
      snippets.forEach(function (snippet) {
        Git.readFile(version, "articles/" + snippet.filename, group());
      });
    },
    function (err, files) {
      if (err) { callback(err); return; }
      files.forEach(function (code, i) {
        var snippet = snippets[i];

        if (snippet.name) {
          var regex = new RegExp("^//" + snippet.name + "\n((?:[^/]|/[^/]|//[^a-z])*)", "m");
          var match = code.match(regex);
          snippet.beforeCode = code.substr(0, match.index);
          snippet.code = match[1];
        } else {
          snippet.code = code.replace(/^\/\/[a-z-]+.*\n/mg, '');
        }
        snippet.code = snippet.code.trim();
        if (canExecute && snippet.execute) {
          sandbox(snippet);
        }
      });
      return snippets;
    },
    callback
  );
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

// These are our data sources
var Data = module.exports = {

  // Loads a snippet of code for inclusion in a page
  snippet: Git.safe(function snippet(version, path, callback) {
    var name, filename, execute, base, url, beforeCode, result;
    function error(err) {
      callback(null, {
        url: url,
        name: name,
        base: base,
        execute: execute,
        path: path,
        code: err.stack,
        error: err.message
      });
    }
    Step(
      function () {
        filename = path;
        execute = path[path.length - 1] === "*";
        if (execute) {
          filename = filename.substr(0, filename.length - 1);
        }
        base = path.substr(path.indexOf('/') + 1).replace(/[#*].*$/, '');
        var match = filename.match(/#(.+)$/);
        if (match) {
          name = match[1];
          filename = path.substr(0, match.index);
        }
        url = "/" + (version === "fs" ? "" : version + "/") + filename;
        Git.readFile(version, "articles/" + filename, this);
      },
      function (err, code) {
        if (err) { error(err); return; }
				code=code.toString();
        result = {
          url: url,
          name: name,
          base: base,
          execute: execute,
          path: path,
          beforeCode: beforeCode,
          code: code.trim(),
          output: ""
        };
      },
      function (err, result) {
        if (err) { error(err); return; }
        callback(null, result);
      }
    )
  }),

  markdown: Git.safe(function markdown(version, file, filler, callback) {
    Step(
      function loadFile() {
        Git.readFile(version, file, this.parallel());
      },
      function loadData(err, markdown) {
        if (err) { callback(err); return undefined; }
				markdown=markdown.toString();
        page = preProcessMarkdown(markdown);
        page.name = Path.basename(file, '.markdown');
        page.version = version;
        page.file = file;
        if (filler) {
          return filler(page, this.parallel());
        }
        return page;
      },
      callback
    )
  }),

  markdowns: Git.safe(function markdowns(version, dir, filler, callback) {
    Step(
      function getListOfArticles() {
        Git.readDir(version, dir, this);
      },
      function readArticles(err, results) {
        if (err) { callback(err); return; }
        var group = this.group();
        results.files.forEach(function onFile(filename) {
          if (!(/\.markdown$/.test(filename))) {
            return;
          }
          Data.markdown(version, Path.join(dir, filename), filler, group());
        });
      },
      function sortAndFinish(err, pages) {
        if (err) { callback(err); return; }
        pages.sort(function dateSorter(a, b) {
          return (Date.parse(b.date)) - (Date.parse(a.date));
        });
        return pages;
      },
      callback
    )
  }),

  // Loads the core data for a single author.
  author: Git.safe(function author(version, name, callback) {
    Step(
      function getAuthorMarkdown() {
        if (!name) {
          callback(new Error("name is required"));
          return;
        }
        Git.readFile(version, Path.join("authors", name + ".markdown"), this);
      },
      function process(err, markdown) {
        if (err) { callback(err); return; }
				markdown=markdown.toString();
        return preProcessMarkdown(markdown);
      },
      function finish(err, props) {
        if (err) { callback(err); return; }
        props.name = name;
        return props;
      },
      callback
    );
  })
};

