var nodeCookie = require('node-cookie');
var security = require('./security');



module.exports = 
{
	respondToJRPC : respondToJRPC,

	echo : echo,
	login : login,
	logout : logout,
	validateCookie : validateCookie,
	getUserData : getUserData,
	isUsernameFree : isUsernameFree,
	register : register,
	updateProfile : updateProfile
}



function respondToJRPC(env)
{
	env.data = '';

	env.req.on('data', (_data) => env.data += _data);
	env.req.on('end', () => actUponBufferedData(env));
}


function actUponBufferedData(env)
{
	try { env.data = JSON.parse(env.data); }
	catch (_exc) {}

	if (typeof env.data != 'object')
		respondWithJRPC(env, undefined, 'Non-object jrpc currently not supported');
	else if ( !(env.data.call in module.exports) || env.data.call === 'respondToJRPC' )
		respondWithJRPC(env, undefined, 'Unknown call: ' + env.data.call);
	else
	{
		env.jrpc = {end : (_return, _error) => respondWithJRPC(env, _return, _error)};
		module.exports[env.data.call](env);
	}
}


function makeJRPCResponse(_return, _error)
{
	var message = {};
	message.jrpc = '1.0';
	message.return = _return;
	message.error = _error;
	return message;
}


function respondWithJRPC(env, _return, _error)
{
	env.res.writeHead(200);
	env.res.end(JSON.stringify(makeJRPCResponse(_return, _error)));
}



function echo(env)
{
	env.jrpc.end(env.data.text);
}



function login(env)
{
	function setCookie(_err, _row)
	{
		if (_err || !this.lastID)
			env.jrpc.end(undefined, 'Could not create session.');
		else
		{
			env.res.setHeader
			(
				'Set-Cookie',
				'session_id=' + this.lastID
				+ ';expires='
				+ new Date(env.now + 31536000000).toUTCString()
			);
			env.jrpc.end(true);
		}
	}

	function startNewSession(_err, _row)
	{
		if (_err || !_row || !_row.user_id)
			env.jrpc.end(undefined, 'Invalid username / password combination');
		else
		{
			env.user.id = _row.user_id;
			env.db.get
			(
				'update sessions set session_active = 0 where user_id = ? and session_ip = ? and session_active',
				env.user.id,
				env.ip
			);
			env.db.run
			(
				'insert into sessions (user_id, session_active, session_ip, session_expires) values (?,?,?,?)',
				env.user.id,
				1,
				env.ip,
				env.now + 31536000000, // one year
				setCookie
			);
		}
	}


	if (env.data.user_name && env.data.user_passhash)
	{
		env.db.get
		(
			'select user_id from users where user_name = ? and user_passhash = ?',
			env.data.user_name,
			env.data.user_passhash,
			startNewSession
		);
	}
	else
		env.jrpc.end(undefined, 'Username or password not present');
}


function validateCookie(env)
{
	env.jrpc.end(env.user.id);
}

function logout(env)
{
	if (env.user.id)
	{
		env.db.run
		(
			'update sessions set session_active = 0 where user_id = ? and session_ip = ? and session_active',
			env.user.id,
			env.ip,
			function(_err)
			{
				if (_err)
					env.jrpc.end(false, 'Cant get user data: DB error: ' + _err);
				else if (!this.changes)
					env.jrpc.end(false, 'No active sessions found');
				else
					env.jrpc.end(true);
			}
		);
	}
	else
		env.jrpc.end(true);
}



function getUserData(env)
{
	if (env.user.id)
	{
		env.db.get
		(
			'select * from users where user_id = ?',
			env.user.id,
			function(_err, _row)
			{
				if (_err)
					env.jrpc.end(undefined, 'Cant get user data: DB error: ' + _err);
				else if (!_row.user_id)
					env.jrpc.end(undefined, 'Unknown user_id');
				else
				{
					_row.user_passhash = undefined;
					env.jrpc.end(_row);
				}
			}
		);
	}
	else
		env.jrpc.end(undefined, 'No user logged in');
}


function isUsernameFree(env)
{
	env.db.get
	(
		'select user_id from users where user_name = ?',
		env.data.user_name,
		function(_err, _row)
		{
			if (_err)
				env.jrpc.end(undefined, 'Cant check username: DB error: ' + _err);
			else if (_row)
				env.jrpc.end(false);
			else
				env.jrpc.end(true);
		}
	);
}


function register(env)
{
	function setCookie(_err, _row)
	{
		if (_err || !this.lastID)
			env.jrpc.end(undefined, 'Could not create session.');
		else
		{
			env.res.setHeader
			(
				'Set-Cookie',
				'session_id=' + this.lastID
				+ ';expires='
				+ new Date(env.now + 31536000000).toUTCString()
			);
			env.jrpc.end(true);
		}
	}

	function startNewSession(_err)
	{
		if (_err || !this.lastID)
			env.jrpc.end(undefined, 'Username already in use');
		else
		{
			env.user.id = this.lastID;
			env.db.run
			(
				'update sessions set session_active = 0 where user_id = ? and session_ip = ? and session_active',
				env.user.id,
				env.ip
			);
			env.db.run
			(
				'insert into sessions (user_id, session_active, session_ip, session_expires) values (?,?,?,?)',
				env.user.id,
				1,
				env.ip,
				env.now + 31536000000, // one year
				setCookie
			);
		}
	}
	
	

	if (env.data.user_name && env.data.user_passhash1 && env.data.user_passhash2)
	{
		if (env.data.user_passhash1 === env.data.user_passhash2)
		{
			env.db.run
			(
				'insert into users (user_name, user_passhash, user_alias) values (?,?,?)',
				env.data.user_name,
				env.data.user_passhash1,
				env.data.user_alias,
				startNewSession
			);
		}
		else
			env.jrpc.end(undefined, 'Passwords do not match');
	}
	else
		env.jrpc.end(undefined, 'Username or password not present');
}



function updateProfile(env)
{
	function on_update_done(_err)
	{
		if (_err)
			env.jrpc.end(false, 'Can not update your info. ' + _err);
		else
			env.jrpc.end(true);
	}

	env.db.run
	(
		'update users set user_name = ?, user_alias = ?, user_chr = ? where user_id = ?',
		env.data.user_name,
		env.data.user_alias,
		env.data.user_chr,
		env.user.id,
		on_update_done
	);
}