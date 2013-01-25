var Git = require('git-fs'),
    Data = require('./data'),
    Tools = require('./tools'),
    Buffer = require('buffer').Buffer,
    Prettify = require('./prettify'),
    MD5 = require('./md5'),
    ChildProcess = require('child_process'),
    getMime = require('simple-mime')('application/octet-string'),
    Step = require('step'),
    Path = require('path');

// Execute a child process, feed it a buffer and get a new buffer filtered.
function execPipe(command, args, data, callback) {
  var child = ChildProcess.spawn(command, args);
  var stdout = [], stderr = [], size = 0;
  child.stdout.on('data', function onStdout(buffer) {
    size += buffer.length;
    stdout[stdout.length] = buffer;
  });
  child.stderr.on('data', function onStderr(buffer) {
    stderr[stderr.length] = buffer;
  });
  child.on('error', function onExit(err) {
    callback(err);
  });
  child.on('exit', function onExit(code) {
    if (code > 0) {
      callback(new Error(stderr.join("")));
    } else {
      var buffer = new Buffer(size);
      var start = 0;
      for (var i = 0, l = stdout.length; i < l; i++) {
        var chunk = stdout[i];
        chunk.copy(buffer, start);
        start += chunk.length;
      }
      callback(null, buffer);
    }
  });
  if (typeof data === 'string') {
    child.stdin.write(data, "binary");
  } else {
    child.stdin.write(data);
  }
  child.stdin.end();
}

// This writes proper headers for caching and conditional gets
// Also gzips content if it's text based and stable.
function postProcess(headers, buffer, version, path, callback) {
  Step(
    function buildHeaders() {
      if (!headers["Content-Type"]) {
        headers["Content-Type"] = "text/html; charset=utf-8";
      }
      var date = new Date().toUTCString();
      headers["Date"] = date;
      headers["Server"] = "Wheat (node.js)";
      if (version === 'fs') {
        delete headers["Cache-Control"];
      } else {
        headers["ETag"] = MD5.md5(version + ":" + path + ":" + date);
      }

      if (/html/.test(headers["Content-Type"])) {
        buffer = Tools.stringToBuffer((buffer+"").replace(/<pre><code>[^<]+<\/code><\/pre>/g,
          function applyHighlight(code) {
            var code = code.match(/<code>([\s\S]+)<\/code>/)[1];
            code = Prettify.prettyPrintOne(code)
            return "<pre><code>" + code + "</code></pre>";
          }
        ));
      }

      headers["Content-Length"] = buffer.length;

      return {
        headers: headers,
        buffer: buffer
      };
    },
    callback
  );
}

function insertSnippets(markdown, snippets, callback) {
  Step(
    function () {
      Tools.compileTemplate('snippet', this);
    },
    function (err, snippetTemplate) {
      if (err) { callback(err); return; }
      snippets.forEach(function (snippet) {
        var html = snippetTemplate({snippet: snippet});
        markdown = markdown.replace(snippet.original, html);
      });
      return markdown;
    },
    callback
  )
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

var Renderers = module.exports = {
  markdown: Git.safe(function markdown(version, file, templateName, filler, callback) {
    Step(
      function loadMarkdown() {
        Data.markdown(version, file, filler, this.parallel());
      },
      function applyTemplate(err, page) {
        if (err) { callback(err); return; }
        Tools.render(templateName, page, this);
      },
      function callPostProcess(err, buffer) {
        if (err) { callback(err); return; }
        postProcess({
          "Cache-Control": "public, max-age=3600"
        }, buffer, version, file, this);
      },
      callback
    );
  }),

  rssmarkdown: Git.safe(function rssmarkdown(version, file, templateName, filler, callback) {
    Step(
      function loadMarkdown() {
        Data.markdown(version, file, filler, this.parallel());
      },
      function applyTemplate(err, page) {
        if (err) { callback(err); return; }
        Tools.render(templateName, page, this);
      },
      function finish(err, buffer) {
        if (err) { callback(err); return; }
        postProcess({
          "Content-Type":"application/rss+xml",
          "Cache-Control": "public, max-age=3600"
        }, buffer, version, file, this);
      },
      callback
    );
  }),

  staticFile: Git.safe(function staticFile(version, path, callback) {
    Step(
      function loadPublicFiles() {
        Git.readFile(version, "skin/public/" + path, this);
      },
      function loadArticleFiles(err, data) {
        if (err) {
          Git.readFile(version, "articles/" + path, this);
        }
        return data;
      },
      function processFile(err, data) {
        if (err) { callback(err); return; }
        var headers = {
          "Content-Type": getMime(path),
          "Cache-Control": "public, max-age=32000000"
        };
        postProcess(headers, data, version, path, this);
      },
      callback
    );
  }),

  dotFile: Git.safe(function dotFile(version, path, callback) {
    Step(
      function loadPublicFiles() {
        Git.readFile(version, "skin/public/" + path, this);
      },
      function loadArticleFiles(err, data) {
        if (err) {
          Git.readFile(version, "articles/" + path, this);
        }
        return data;
      },
      function processFile(err, data) {
        if (err) { callback(err); return; }
				data=data.toString();
        execPipe("dot", ["-Tpng"], data, this);
      },
      function finish(err, buffer) {
        if (err) { callback(err); return; }
        postProcess({
          "Content-Type": "image/png",
          "Cache-Control": "public, max-age=32000000"
        }, buffer, version, path, this);
      },
      callback
    );
  })
}
