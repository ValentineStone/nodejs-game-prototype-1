function parseURIParameters()
{
	var query = location.search.substr(1);
	var result = {};
	query.split("&").forEach
	(
		function(_part)
		{
			var item = _part.split("=");
			result[item[0]] = decodeURIComponent(item[1]);
		}
	);
	return result;
}