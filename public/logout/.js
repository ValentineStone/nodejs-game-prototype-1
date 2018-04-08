var prompt = document.getElementById('prompt');
var comment = document.getElementById('comment');


function attempt_logout()
{
    ajax_exchange_json('/jrpc', {call:'logout'}, on_logout_done);
    prompt.style.display = 'none';
}

attempt_logout();


function on_logout_done(_json)
{
    if (_json.return)
        window.location = '/';
    else
    {
        comment.innerHTML = _json.error;
        prompt.style.display = 'initial';
    }
}