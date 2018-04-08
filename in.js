napp = {};

var http = require('http');

var handleRequest = require('./handleRequest.js');
var world = require('./world.js');

world.start_server(3333);

var server = http.createServer(handleRequest.handleRequest);
server.listen(80);