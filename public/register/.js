var register_form = document.getElementById('register_form');
var comment = document.getElementById('comment');
register_form.action = location.pathname.startsWith('/register') ? '/' : location.href;


ajax_exchange_json('/jrpc', {call:'validateCookie'}, on_validation_done);


function on_validation_done(_json)
{
    if (_json.return)
        window.location = register_form.action;
    else
        register_form.style.display = 'initial';
}

async function on_response(_json)
{
    if (_json.return)
        window.location = register_form.action;
    else
        comment.innerHTML = 'Could not register you, sorry. ' + _json.error;
}

async function process_and_submit()
{
    var jrpc_register =
    {
        call : 'register',
        user_passhash1 : bin2hex(await sha256(document.getElementById('user_pass1').value)),
        user_passhash2 : bin2hex(await sha256(document.getElementById('user_pass2').value)),
        user_name : document.getElementById('user_name').value,
        user_alias : document.getElementById('user_alias').value
    };
    ajax_exchange_json('/jrpc', jrpc_register, on_response);
}