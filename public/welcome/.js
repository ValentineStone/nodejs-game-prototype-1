var login_div = document.getElementById('login_div');
var profile_div = document.getElementById('profile_div');


ajax_exchange_json
(
    '/jrpc',
    {call:'validateCookie'},
    function (_json)
    {
        if (_json.return)
            welcome_user();
        else
            welcome_guest();
    }
);

function welcome_guest()
{
    login_div.style.display = 'initial';
}


function welcome_user()
{
    ajax_exchange_json('/jrpc', {call:'getUserData'}, on_user_data_ready);

    function on_user_data_ready(_json)
    {
        if (_json.return)
        {
            json_populate(_json.return);
            profile_div.style.display = 'initial';
        }
        else
            welcome_guest();
    }
}