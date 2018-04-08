var gamblers = [];

function rand_rps()
{
    switch (Math.floor(Math.random() * 3))
    {
        case 0: return 'r';
        case 1: return 'p';
        case 2: return 's';
    }
}

function heartbeat_log(_string) { console.log('[rps_heartbeat]: ' + _string); }

function rps_heartbeat()
{
    heartbeat_log('tik');

    place_machine_bets();

    var results = {r:0,p:0,s:0};

    for (let gambler of gamblers)
        results[gambler.bet]++;

    for (let gambler of gamblers)
        gambler.notify(results);

    gamblers.length = 0;
    
    heartbeat_log('tok');
}

function place_machine_bets()
{
    for (var i = 0; i < 30; i++)
    {
        gamblers.push(new RoboGambler('machine'+i));
    }
}


class RoboGambler
{
    constructor(name)
    {
        this.name = name;
        this.commit_bet();
    }

    commit_bet() { this.bet = rand_rps(); }
    
    notify(_r)
    {
        results_specify(this.bet, _r);
        heartbeat_log
        (
            this.name
            + ' bet on ' + this.bet +
            ' with '
            + _r.w + ' wins, '
            + _r.l + ' losses and '
            + _r.d + ' draws '
            + 'balance: ' + _r.b
        );
    }
}


function results_specify(_y, _r)
{
    switch (_y)
    {
        case 'r':
            _r.w = _r.s;
            _r.l = _r.p;
            _r.d = _r.r;
            break;
        case 'p':
            _r.w = _r.r;
            _r.l = _r.s;
            _r.d = _r.p;
            break;
        case 's':
            _r.w = _r.p;
            _r.l = _r.r;
            _r.d = _r.s;
            break;
    }

    _r.b = _r.w - _r.l;
}



var heartbeat_id = setInterval(rps_heartbeat, 2000);