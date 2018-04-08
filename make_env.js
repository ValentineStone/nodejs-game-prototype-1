var sqlite3 = require('sqlite3').verbose();
var path = require('path');
var nodeCookie = require('node-cookie');
var url = require('url');


module.exports = 
function make_env(_request, _response)
{
	var env = {};
	env.ip = _request.connection.remoteAddress;
	env.now = Date.now();
	env.req = _request;
	env.res = _response;
	env.db = new sqlite3.Database('.db');
	env.db.serialize();
	env.path = path.posix.normalize(decodeURIComponent(url.parse(_request.url).pathname));
	env.session = {};
	env.session.id = nodeCookie.get(_request, 'session_id');
	env.user = {};
	return env;
}