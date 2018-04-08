module.exports = 
{
	handleRequest : handleRequest,
}

var path = require('path');
var fs = require('fs');



var jrpc = require('./jrpc.js');
var make_env = require('./make_env.js');
var security = require('./security.js');
var securePages = require('./securePages.json');



function handleRequest(_request, _response)
{
	var env = make_env(_request, _response);
	security.validateSession(env, preprocessResponse);
}

function preprocessResponse(env)
{
	function isPathSecurePage(_securePage)
	{
		return env.path.startsWith(_securePage,1);
	}

	if (env.path.startsWith('/jrpc'))
	{
		console.log('[jrpc]');
		jrpc.respondToJRPC(env);
	}
	else if (env.path.startsWith('/private'))
	{
		if (env.user.id)
			env.path = env.path.slice(0,8) + '/' + env.user.id + env.path.slice(8);
		else
			env.path = '/public/login';
		preprocessFile(env);
	}
	else if (securePages.some(isPathSecurePage))
	{
		if (env.user.id)
			env.path = '/private' + env.path;
		else
			env.path = '/public/login';
		preprocessFile(env);
	}
	else
	{
		env.path = '/public' + env.path;
		preprocessFile(env);
	}
}


function preprocessFile(env)
{
	fs.stat
	(
		env.path.slice(1),
		(_err, _stats) =>
		{
			if (_err || !(_stats.isFile() || _stats.isDirectory()))
				respondWithCode(env, 404, env.path);
			else
			{
				env.file = {};
				env.file.stats = _stats;

				if (_stats.isDirectory())
					env.path += '/index.html';
				
				respondWithFile(env);
			}
		}
	);
}

function respondWithFile(env)
{
	console.log('[file]: ' + env.path);
	var readStream = fs.createReadStream(env.path.slice(1));
	readStream.on('error', (_err) => respondWithCode(env, 404, env.path));
	readStream.on('close', () => respondWithCode(env, 200));
	readStream.pipe(env.res);
}

function respondWithCode(env, _code, _text)
{
	console.log('[code]: ' + _code);
	env.res.writeHead(_code);
	if (_text)
		env.res.write(_text);
	env.res.end();
}
