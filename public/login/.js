var login_form = document.getElementById('login_form');
var comment = document.getElementById('comment');
login_form.action = location.pathname.startsWith('/login') ? '/' : location.href;


ajax_exchange_json('/jrpc', {call:'validateCookie'}, on_validation_done);


function on_validation_done(_json)
{
    if (_json.return)
        window.location = login_form.action;
    else
        login_form.style.display = 'initial';
}



async function on_login_response(_json)
{
    if (_json.return)
        window.location = login_form.action;
    else
        comment.innerHTML = 'Could not log you in, sorry. ' + _json.error;
}

async function process_and_submit()
{
    var jrpc_login =
    {
        call : 'login',
        user_passhash : bin2hex(await sha256(document.getElementById('user_pass').value)),
        user_name : document.getElementById('user_name').value
    };
    ajax_exchange_json('/jrpc', jrpc_login, on_login_response);
}