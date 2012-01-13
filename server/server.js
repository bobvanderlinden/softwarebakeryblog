// Just a basic server setup for this site
var stack = require('stack'),
    http = require('http');

http.createServer(stack(
  require('./wheat')(__dirname +"/..")
)).listen(7070);
