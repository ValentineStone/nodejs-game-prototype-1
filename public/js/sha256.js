async function sha256(_str)
{
	var buffer = new TextEncoder("utf-8").encode(_str);
	var hash_buffer = await crypto.subtle.digest("SHA-256", buffer);
	return hash_buffer;
}