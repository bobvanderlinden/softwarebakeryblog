var gulp = require("gulp");
var del = require("del");

var through = require("through2");
var gutil = require("gulp-util");
var buffer = require("gulp-buffer");
var filter = require("gulp-filter");
var rename = require("gulp-rename");
var fs = require("fs");
var haml = require("haml");
var extend = require("object-assign");
var path = require("path");
var merge = require("gulp-merge");
var imagemin = require("gulp-imagemin");
var uglify = require("gulp-uglify");
var gswitch = require("gulp-switch");
var cleanCss = require("gulp-clean-css");
var htmlmin = require("gulp-htmlmin");
var shell = require("gulp-shell");

var webserver = require("gulp-webserver");

var rsync = require("gulp-rsync");

var helpers = require("./helpers");
var commonmark = require("./commonmark");

gulp.task("webserver", ["compressBuild"], function () {
  gulp.src("build", { base: "build" }).pipe(
    webserver({
      middleware: [
        function (req, res, next) {
          console.log(req.url);
          if (req.url === "/") {
            req.url = "/index";
          }
          if (path.extname(req.url) === "") {
            req.url = req.url + ".html";
          }
          next();
        },
      ],
    })
  );
});

gulp.task("build", ["staticPages", "projects", "articles", "assets", "feed"]);

var rsyncDeployCommand =
  "rsync --recursive --archive --checksum --verbose build/ softwarebakery:/var/www/softwarebakery.com/";

gulp.task(
  "deploy",
  ["build"],
  shell.task([rsyncDeployCommand], { verbose: true })
);

gulp.task(
  "deploy-dry",
  ["build"],
  shell.task([rsyncDeployCommand + " --dry-run"], { verbose: true })
);

var output = function () {
  return gulp.dest("build/");
};

var optimizeJs = uglify;
var optimizeCss = cleanCss;
var optimizeImage = imagemin;
var optimizeHtml = function () {
  return htmlmin({ collapseWhitespace: true });
};

function optimizeAssets(assets) {
  var images = assets.pipe(filter("**/*.{png,jpg,jpeg}")).pipe(optimizeImage());
  var css = assets.pipe(filter("**/*.css")).pipe(optimizeCss());
  var js = assets.pipe(filter("**/*.js")).pipe(optimizeJs());
  var rest = assets.pipe(
    filter(["**/*", "!**/*.{png,jpg,jpeg}", "!**/*.css", "!**/*.js"])
  );

  var all = merge(images, css, js, rest);

  return all;
}

gulp.task("staticPages", ["index", "contact", "donate"]);

gulp.task("index", function () {
  return gulp
    .src("skin/index.haml")
    .pipe(buffer())
    .pipe(hamlToHtml())
    .pipe(layoutTemplate({ title: "" }))
    .pipe(optimizeHtml())
    .pipe(output());
});

gulp.task("contact", function () {
  return gulp
    .src("contact.markdown")
    .pipe(buffer())
    .pipe(markdownToHtml())
    .pipe(layoutTemplate())
    .pipe(optimizeHtml())
    .pipe(output());
});

gulp.task("donate", function () {
  return gulp
    .src("skin/donate.haml")
    .pipe(buffer())
    .pipe(hamlToHtml())
    .pipe(layoutTemplate({ title: "Donate" }))
    .pipe(optimizeHtml())
    .pipe(output());
});

// Articles
gulp.task("articles", ["articlePages", "articleAssets"]);
gulp.task("articlePages", function () {
  return gulp
    .src("articles/*.markdown")
    .pipe(buffer())
    .pipe(markdownToHtml())
    .pipe(template("skin/article.haml"))
    .pipe(layoutTemplate())
    .pipe(
      rename({
        extname: ".html",
      })
    )
    .pipe(optimizeHtml())
    .pipe(output());
});

gulp.task("articleAssets", function () {
  return optimizeAssets(gulp.src("articles/*/*", { base: "articles" })).pipe(
    output()
  );
});

// Projects
gulp.task("projects", ["projectPages", "projectAssets"]);
gulp.task("projectPages", function () {
  return gulp
    .src("projects/*.markdown")
    .pipe(buffer())
    .pipe(markdownToHtml())
    .pipe(template("skin/project.haml"))
    .pipe(layoutTemplate())
    .pipe(
      rename({
        dirname: "projects",
        extname: ".html",
      })
    )
    .pipe(optimizeHtml())
    .pipe(output());
});

gulp.task("projectAssets", function () {
  return optimizeAssets(gulp.src("projects/*/*", { base: process.cwd() })).pipe(
    output()
  );
});

gulp.task("assets", function () {
  return optimizeAssets(gulp.src("skin/public/*")).pipe(output());
});

gulp.task("feed", function () {
  return gulp
    .src("skin/feed.xml.haml")
    .pipe(buffer())
    .pipe(hamlToHtml())
    .pipe(
      rename({
        basename: "feed",
        extname: ".xml",
      })
    )
    .pipe(output());
});

gulp.task("clean", function (cb) {
  del(["build"], cb);
});

var authors = {
  FrozenCow: {
    name: "FrozenCow",
    email: "frozencow@gmail.com",
    github: "FrozenCow",
  },
  Maato: {
    name: "Maato",
    email: "maato@softwarebakery.com",
    github: "Maato",
  },
};

var projects = fs
  .readdirSync("projects")
  .filter(function (name) {
    return /\.markdown$/.test(name);
  })
  .map(function (filename) {
    var project = parseMetadata(
      fs.readFileSync("projects/" + filename).toString()
    );
    var name = /^(.*)\.markdown$/.exec(filename)[1];
    return extend(project.metadata, {
      name: name,
    });
  });

var articles = fs
  .readdirSync("articles")
  .filter(function (filename) {
    return /\.markdown$/.test(filename);
  })
  .map(function (filename) {
    var article = parseMetadata(
      fs.readFileSync("articles/" + filename).toString()
    );
    var name = /^(.*)\.markdown$/.exec(filename)[1];
    return extend(article.metadata, {
      name: name,
      author: authors[article.metadata.author],
      markdown: article.content,
    });
  })
  .sort(function (a, b) {
    return Date.parse(b.date) - Date.parse(a.date);
  });

function parseMetadata(content) {
  var match = /\r?\n\r?\n/g.exec(content);
  var header = content.substr(0, match.index);
  var body = content.substr(match.index + match.length);

  var metadata = {};
  if (header) {
    header.split(/\r?\n/).forEach(function (headerLine) {
      var match = /(\w+): (.*)/.exec(headerLine);
      if (!match) {
        throw new Error('Could not parse header in line "' + headerLine + '"');
      }
      metadata[match[1].toLowerCase()] = match[2];
    });
  }

  return {
    metadata: metadata,
    content: body,
  };
}

function markdownToHtml() {
  return through.obj(function (file, enc, cb) {
    var page = parseMetadata(file.contents.toString());
    var htmlFile = new gutil.File({
      base: file.base,
      cwd: file.cwd,
      path: gutil.replaceExtension(file.path, ".html"),
      contents: new Buffer(commonmark(page.content)),
    });
    htmlFile.metadata = page.metadata;
    cb(null, htmlFile);
  });
}

function hamlToHtml(locals) {
  return through.obj(function (file, enc, cb) {
    var template = haml(file.contents.toString());

    var locals = extend(
      {
        projects: projects,
        articles: articles,
      },
      locals,
      helpers
    );

    var resultHtml = template(locals);

    var resultFile = new gutil.File({
      contents: new Buffer(resultHtml),
      base: file.base,
      cwd: file.cwd,
      path: gutil.replaceExtension(file.path, ".html"),
    });

    return cb(null, resultFile);
  });
}

function template(templatePath, locals) {
  var template = haml(fs.readFileSync(templatePath).toString());
  return through.obj(function (file, enc, cb) {
    var context = extend(
      {},
      helpers,
      file.metadata || {},
      {
        content: file.contents && file.contents.toString(),
        projects: projects,
        articles: articles,
        path: file.path,
        name: path.basename(file.path, path.extname(file.path)),
        author:
          file.metadata &&
          file.metadata.author &&
          authors[file.metadata.author],
      },
      locals
    );

    var resultHtml;
    try {
      resultHtml = template(context);
    } catch (e) {
      throw new Error(
        "Error while applying template " +
          templatePath +
          " to file " +
          file.path +
          ": " +
          e.message
      );
    }

    var match = /<pre class='error'>(.*)/.exec(resultHtml);
    if (match) {
      throw new Error(
        "Error while applying template " +
          templatePath +
          " to file " +
          file.path +
          ": " +
          match[1]
      );
    }

    var resultFile = new gutil.File({
      contents: new Buffer(resultHtml),
      base: file.base,
      cwd: file.cwd,
      path: gutil.replaceExtension(file.path, ".html"),
    });

    resultFile.metadata = file.metadata;

    cb(null, resultFile);
  });
}

var layoutTemplate = template.bind(null, "skin/layout.haml");

function projectTemplate(templatePath) {
  var template = haml(fs.readFileSync("skin/project.haml").toString());
  return through.obj(function (file, enc, cb) {
    var project = parseMetadata(file.contents.toString());

    var hamlLocals = extend(
      {
        name: /\/([^\/]+)\.markdown/.exec(file.path)[1],
        markdown: project.content,
      },
      project.metadata,
      helpers
    );

    file.metadata = project.metadata;
    file.contents = new Buffer(template(hamlLocals));
    cb(null, file);
  });
}

function articleTemplate(templatePath) {
  var template = haml(fs.readFileSync("skin/article.haml").toString());
  return through.obj(function (file, enc, cb) {
    var article = parseMetadata(file.contents.toString());

    var hamlLocals = extend(
      {
        name: /\/([^\/]+)\.markdown/.exec(file.path)[1],
        author: authors[article.metadata.author],
        markdown: article.content,
      },
      article.metadata,
      helpers
    );

    file.metadata = article.metadata;
    file.contents = new Buffer(template(hamlLocals));
    cb(null, file);
  });
}

// var webshot = require("webshot");
// var httpServer = require("http-server");
// var imageDiff = require("image-diff");
// var Stream = require("stream");
// var tmp = require("tmp");
// gulp.task("diff", ["build"], function () {
//   gulp
//     .src("build/**/*.html", { base: "build" })
//     .pipe(diff({}))
//     .pipe(rename({ suffix: ".diff", extname: ".png" }))
//     .pipe(gulp.dest("build-diff/"));
// });

// function diff(options) {
//   function createServer(cb) {
//     var server = httpServer.createServer({
//       root: "build",
//     });
//     server.listen(8080, function (err) {
//       cb(err, server);
//     });
//   }

//   function diff(path, output, cb) {
//     var localUrl = "http://localhost:8080" + path;
//     var remoteUrl = "http://softwarebakery.com" + path;
//     var localShotFileName = tmp.fileSync({ postfix: ".png" }).name;
//     var remoteShotFileName = tmp.fileSync({ postfix: ".png" }).name;
//     webshot(localUrl, localShotFileName, function (err) {
//       if (err) {
//         return cb(err);
//       }
//       webshot(remoteUrl, remoteShotFileName, function (err) {
//         if (err) {
//           return cb(err);
//         }
//         imageDiff(
//           {
//             actualImage: localShotFileName,
//             expectedImage: remoteShotFileName,
//             diffImage: output,
//             shadow: true,
//           },
//           cb
//         );
//       });
//     });
//   }

//   var server;
//   var serverListeners = [];
//   createServer(function (err, s) {
//     server = s;
//     serverListeners.forEach(function (cb) {
//       cb(err, server);
//     });
//   });

//   function waitForServer(cb) {
//     if (server) {
//       cb(null, server);
//     } else {
//       serverListeners.push(cb);
//     }
//   }

//   var stream = new Stream.Transform({ objectMode: true });

//   stream._transform = function (file, encoding, cb) {
//     var self = this;
//     waitForServer(function (err) {
//       if (err) {
//         return cb(err);
//       }
//       var path = file.relative;
//       var diffFilePath = require("tmp").fileSync().name;
//       diff("/" + path, diffFilePath, function (err, isSame) {
//         if (err) {
//           return cb(err);
//         }
//         if (isSame) {
//           // Ignore.
//           gutil.log("[UNCHANGED]", path);
//           cb();
//         } else {
//           gutil.log("[CHANGED]  ", path);
//           var diffFile = file.clone({ contents: false });
//           diffFile.contents = fs.createReadStream(diffFilePath);
//           diffFile.contents.on("close", function () {
//             fs.unlink(diffFilePath);
//           });
//           self.push(diffFile);
//           cb();
//         }
//       });
//     });
//   };

//   stream.on("end", function () {
//     waitForServer(function () {
//       server.close();
//     });
//   });
//   return stream;
// }
