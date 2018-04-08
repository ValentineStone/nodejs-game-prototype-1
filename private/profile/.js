var user_data = document.getElementById('user_data');
var comment = document.getElementById('comment');

ajax_exchange_json('/jrpc', {call:'getUserData'}, on_user_data_ready);

function on_user_data_ready(_json)
{
    json_populate(_json.return);
}






function on_submit()
{
    var jrpc_update =
    {
        call : 'updateProfile',
        user_name : document.getElementById('user_name').value,
        user_alias : document.getElementById('user_alias').value,
        user_chr : document.getElementById('user_chr').value
    };
    ajax_exchange_json('/jrpc', jrpc_update, on_response);
}


function on_response(_json)
{
    if (_json.return)
        comment.innerHTML = 'Update successfull';
    else
        comment.innerHTML = 'Could not register you, sorry. ' + _json.error;
}