ajax_exchange_json
(
    '/jrpc',
    {call:'validateCookie'},
    function (_json)
    {
        if (_json.return)
            window.location = '/profile';
        else
            window.location = '/welcome';
    }
);