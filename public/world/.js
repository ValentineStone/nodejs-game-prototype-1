ajax_exchange_json('/jrpc', {call:'validateCookie'}, (_jrpc) => _jrpc.return ? true : window.location = '/');



var WORLD = document.querySelector('div.world');

var CONSTROLLER_STATE = {};


var ENTITIES = {};



document.addEventListener
(
	'keydown',
	(_evt) =>
	{
		if (_evt.keyCode != CONSTROLLER_STATE.k)
		{
			CONSTROLLER_STATE.k = _evt.keyCode;
			CONSTROLLER_STATE.m = undefined;
			controller_state_update_send();
		}
		return false;
	}
);

document.addEventListener
(
	'keyup',
	(_evt) =>
	{
		if (_evt.keyCode == CONSTROLLER_STATE.k)
			CONSTROLLER_STATE.k = undefined;
		return false;
	}
);

document.addEventListener
(
	'mousemove',
	(_evt) =>
	{
		CONSTROLLER_STATE.x = _evt.clientX - WORLD.offsetLeft;
		CONSTROLLER_STATE.y = _evt.clientY - WORLD.offsetTop;
		return false;
	}
);

document.addEventListener
(
	'mousedown',
	(_evt) =>
	{
		CONSTROLLER_STATE.x = _evt.clientX - WORLD.offsetLeft;
		CONSTROLLER_STATE.y = _evt.clientY - WORLD.offsetTop;
		CONSTROLLER_STATE.m = _evt.button;
		controller_state_update_send();
		_evt.preventDefault();
	}
);

document.addEventListener
(
	'contextmenu',
	(_evt) =>
	{
		_evt.preventDefault();
	}
);


var ws = new WebSocket("ws://localhost:3333");

ws.onclose = function()
{
	console.log('Washington, D.C.');
	//alert("You have been disconnected.");
	//window.location = '/world_welcome';
};


function controller_state_update_send()
{
	ws.send(JSON.stringify(CONSTROLLER_STATE));
}

ws.onmessage = function (_mess)
{
	var json = JSON.parse(_mess.data);

	console.log(json);

	if (json.hrate)
	{
		setTimeout
		(
			() => setInterval(world_heartbeat, json.hrate),
			(Date.now() - json.hts) % json.hrate
		);
	}

	if (json.add)
	{
		for (let entity of json.add)
			ENTITIES[entity.i] = new Entity(entity);
	}

	if (json.del)
	{
		for (let i of json.del)
			if (ENTITIES[i])
			{
				WORLD.removeChild(ENTITIES[i].div);
				delete ENTITIES[i];
			}
	}

	if (json.upd)
	{
		for (let i in json.upd)
			if (ENTITIES[i])
				for (let prop in json.upd[i])
					ENTITIES[i][prop] = json.upd[i][prop];
	}

};





class Entity
{
	constructor (_json)
	{
		this.dx = _json.dx;
		this.dy = _json.dy;
		this.x = _json.x;
		this.y = _json.y;

		this.div = document.createElement('div');
		this.div.className = 'entity';
		this.a = document.createElement('a');
		this.a.innerHTML = _json.a;
		this.a.className = 'alias';

		this.sh = new Image();
		this.sh.src = '/world/sh.png';
		this.sh.style.position = 'absolute';
		this.sh.style.left = '0px';
		this.sh.style.top = '60px';
		this.sh.style.zIndex = -1;

		this.img = new Image();
		this.chr = _json.chr;
		this.div.style.position = 'absolute';

		this.apply_pos();

		//this.div.appendChild(document.createElement('br'));
		this.div.appendChild(this.a);
		this.div.appendChild(this.sh);
		this.div.appendChild(this.img);
		WORLD.appendChild(this.div);
	}

	set chr(_id) { this.img.src = '/img/world/chr/' + _id + '.png'; }

	apply_pos()
	{
		this.div.style.left = Math.floor(this.x) + 'px';
		this.div.style.top = Math.floor(this.y) + 'px';
	}

	update()
	{
		this.x += this.dx;
		this.y += this.dy;
		this.apply_pos();
	}
}









function world_heartbeat()
{
	for (let i in ENTITIES)
		ENTITIES[i].update();
}