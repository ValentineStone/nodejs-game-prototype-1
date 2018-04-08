function ajax_request(_filename, _handler)
{
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function()
	{
		if (this.readyState == 4 && this.status == 200)
			_handler(this.responseText);
	};
	xhttp.open("GET", _filename, true);
	xhttp.send();
}

function ajax_exchange(_address, _data_in, _handler)
{
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function()
	{
		if (this.readyState == 4 && this.status == 200)
			_handler(this.responseText);
	};
	xhttp.open("POST", _address, true);
	xhttp.send(_data_in);
}

function ajax_chain_requests(_filenames, _handlers, _callback, _chainposition)
{
	if (typeof _chainposition === 'undefined')
		_chainposition = 0;

	if (_filenames[_chainposition])
		ajax_request
		(
			typeof _filenames[_chainposition] === 'function'
				? _filenames[_chainposition]()
				: _filenames[_chainposition],
			function (_response)
			{
				if (typeof _handlers === 'function')
					_handlers(_response);
				else
					_handlers[_chainposition](_response);

				ajax_chain_requests(_filenames, _handlers, _callback, _chainposition + 1);
			}
		);
	else
		if (typeof _callback === 'function')
			_callback();
}

function ajax_request_json(_filename, _handler)
{
	ajax_request
	(
		_filename,
		function (_json)
		{
			var json;
			try
			{
				json = JSON.parse(_json);
			}
			catch (_exc)
			{
				json = _json;
			}
			_handler(json);
		}
	);
}

function ajax_exchange_json(_address, _json_in, _handler)
{
	ajax_exchange
	(
		_address,
		JSON.stringify(_json_in),
		function (_data)
		{
			var json_out;
			try
			{
				json_out = JSON.parse(_data);
			}
			catch (_exc)
			{
				json_out = _data;
			}
			_handler(json_out);
		}
	);
}

function ajax_request_eval(_filename)
{
	ajax_request(_filename, eval);
}

function ajax_insert(_filename, _elem)
{
	ajax_request(_filename, function (_insertion) {_elem.innerHTML = _insertion;});
}

function ajax_append(_filename, _elem)
{
	ajax_request(_filename, function (_insertion) {_elem.innerHTML += _insertion;});
}