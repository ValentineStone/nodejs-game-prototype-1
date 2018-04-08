var nodeCookie = require('node-cookie');

module.exports =
{
	validateSession : validateSession,
	validateCookie : validateCookie,
	validatePayload : validatePayload
};


function validateSession (env, _callback)
{
	return validateCookie(env, _callback);
}

function validateCookie(env, _callback)
{
	env.user.id = false;

	function getUserInfo(_err, _row)
	{
		if (_err)
			env.user.id = false;
		else
		{
			env.user.name = _row.user_name;
			env.user.alias = _row.user_alias;
		}
			_callback(env);
	}

	function checkSession(_err, _row)
	{
		if
		(
			_err
			|| env.now > _row.session_expires
			|| env.ip !== _row.session_ip
			|| !_row.session_active
		)
			_callback(env);
		else
		{
			env.user.id = _row.user_id;
			env.session.expires = _row.session_expires;
			env.db.get
			(
				'select user_name, user_alias from users where user_id = ?',
				env.user.id,
				getUserInfo
			);
		}
	}

	if (env.session.id)
		env.db.get
		(
			'select user_id, session_expires, session_ip, session_active from sessions where session_id = ?',
			env.session.id,
			checkSession
		);
	else
		_callback(env);
}

function validatePayload(env)
{
	return false;
}