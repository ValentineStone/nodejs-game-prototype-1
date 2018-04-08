function json_populate(_json)
{
	for (let key in _json)
	{
		for (let input of document.querySelectorAll('input[name=' + key + ']'))
			input.value = _json[key];
		for (let element of document.querySelectorAll('*[data-name=' + key + ']'))
			if (element instanceof HTMLImageElement)
				element.src = _json[key];
			else
				element.innerHTML = _json[key];
	}
}