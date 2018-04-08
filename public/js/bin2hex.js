function bin2hex(_buffer)
{
	var hexCodes = [];
	var view = new DataView(_buffer);
	for (var i = 0; i < view.byteLength; i++)
	{
		// Using getUint32 reduces the number of iterations needed (we might process 4 bytes each time)
		var value = view.getUint8(i)
		// toString(16) will give the hex representation of the number without padding
		var stringValue = value.toString(16)
		// We use concatenation and slice for padding
		var padding = '00'
		var paddedValue = (padding + stringValue).slice(-padding.length)
		hexCodes.push(paddedValue);
	}
	// Join all the hex strings into one
	return hexCodes.join("");
}
