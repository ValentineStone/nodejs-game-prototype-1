var WebSocket = require('ws');


var make_env = require('./make_env.js');
var security = require('./security.js');
var jrpc = require('./jrpc.js');




module.exports =
{
	start_server : start_server
}




var ENTITY_COUNT = 0;
var ENTITIES = {};
var ENTITIES_ADD = [];
var ENTITIES_DEL = [];


var ENTITY_SPEED = 5;



var HEARTBEAT_RATE = 40;
var HEARTBEAT_LAST = Date.now();



var Entity = function(_notify, _chr, _alias)
{
	this.i = ++ENTITY_COUNT;
	this.x = 350;
	this.y = 350;
	this.dx = 0;
	this.dy = 0;
	this.chr = _chr && _chr <= 45 ? _chr : 0;
	this.a = _alias;

	hide_prop(this, 'dead', false);
	hide_prop(this, 'target', null);
	hide_prop(this, 'new_target', null);
	hide_prop(this, 'notify', _notify ? _notify : () => {});

	hide_prop
	(
		this,
		'update',
		function()
		{
			var update = {};

			if (this.new_target)
			{
				this.target = this.new_target;
				this.new_target = null;

				var dx = this.target.x - this.x;
				var dy = this.target.y - this.y;
				var ds = Math.sqrt(Math.pow(dx,2) + Math.pow(dy,2));

				this.dx = ds ? ENTITY_SPEED * dx / ds : 0;
				this.dy = ds ? ENTITY_SPEED * dy / ds : 0;

				update.dx = this.dx;
				update.dy = this.dy;
			}

			if (this.target)
			{
				if (Math.abs(this.target.x - this.x) < Math.abs(this.dx))
				{
					this.x = this.target.x;
					this.dx = 0;
					update.dx = this.dx;
				}
				else
					this.x += this.dx;

				if (Math.abs(this.target.y - this.y) < Math.abs(this.dy))
				{
					this.y = this.target.y;
					this.dy = 0;
					update.dy = this.dy;
				}
				else
					this.y += this.dy;

				if
				(
					this.target.dead
					&& this.x === this.target.x
					&& this.y === this.target.y
				)
				{
					this.target = null;
					update.x = this.x;
					update.y = this.y;
				}
			}

			return Object.keys(update).length ? update : undefined;
		}
	);

	hide_prop
	(
		this,
		'set_target',
		function(_target)
		{
			this.new_target = {x:_target.x, y:_target.y, dead:_target.dead};
		}
	);
}





function start_server(_port)
{
	var wss = new WebSocket.Server({ port: _port });
	wss.on('connection', on_connection);

	setInterval(world_heartbeat, HEARTBEAT_RATE);

	function on_connection(ws, req)
	{
		var env = make_env(req);
		env.wss = wss;
		env.ws = ws;
		security.validateSession(env, on_validation);
	}
}





function world_heartbeat()
{
	HEARTBEAT_LAST = Date.now();

	var notification = {};

	if (ENTITIES_DEL.length)
		notification.del = ENTITIES_DEL.slice(0);

	if (ENTITIES_ADD.length)
		notification.add = ENTITIES_ADD.slice(0);

	for (let i = ENTITIES_DEL.pop(); i && ENTITIES[i]; i = ENTITIES_DEL.pop())
	{
		ENTITIES[i].dead = true;
		delete ENTITIES[i];
	}

	notification.upd = {};

	var upd;

	for (let i in ENTITIES)
	{
		upd = ENTITIES[i].update();
		if (upd)
			notification.upd[i] = upd;
	}

	if (!Object.keys(notification.upd).length)
		delete notification.upd;
	if (Object.keys(notification).length)
		noify_all(notification);
	

	for (let entity = ENTITIES_ADD.pop(); entity; entity = ENTITIES_ADD.pop())
		ENTITIES[entity.i] = entity;
}







function noify_all(_json)
{
	var json = _json.constructor === String
		? _json
		: JSON.stringify(_json);

	for (let i in ENTITIES)
		ENTITIES[i].notify(json);
	for (let entity of ENTITIES_ADD)
		entity.notify(json);
}






function on_validation(env)
{
	if (!env.user.id)
	{
		env.ws.terminate();
		return;
	}




	env.jrpc = {end:on_user_data_ready}

	jrpc.getUserData(env);

	function on_user_data_ready(_jrpc)
	{
		env.entity = new Entity
		(
			function (_json)
			{
				if (env.ws.readyState === 1)
				{
					env.ws.send
					(
						_json.constructor === String
							? _json :
							JSON.stringify(_json)
					);
				}
			},
			_jrpc.user_chr,
			_jrpc.user_alias
		);

		env.entity.notify({hrate:HEARTBEAT_RATE, hts:HEARTBEAT_LAST, add:Object.values(ENTITIES).splice(ENTITIES_ADD)});

		ENTITIES_ADD.push(env.entity);
		
		env.ws.on('message', on_message);
		env.ws.on('close', () => ENTITIES_DEL.push(env.entity.i));
	}



	function on_message(_mess)
	{
		var json = JSON.parse(_mess);

		if (json.m === 0)
		{
			env.entity.set_target({x:json.x, y:json.y});
		}
	}
}






















function hide_prop(_object, _propname, _value)
{
	return Object.defineProperty
	(
		_object,
		_propname,
		{
			writable: true,
			value: _value
		}
	);
}