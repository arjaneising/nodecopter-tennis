var arDrone = require( "ar-drone" )
,   client  = arDrone.createClient()
;

client.config('general:navdata_demo', 'TRUE');


var INITIAL_VERTICAL_SPEED  = 0
,   TIMELOOP                = 300
;

var verticalFactor  = INITIAL_VERTICAL_SPEED
,   gravityFactor   = 0
,   direction       = "up"
,   active          = false
,   navdata
,   gameLoopTimer
,   gameLoopRunning = false
;

client.on( "navdata", function( data )
{
    navdata = data;

//    console.log( "gameLoopRunning", gameLoopRunning, "navdata.demo", navdata );

    if ( navdata.droneState.lowBattery === 1 )
    {
        console.error( "LOW BATTERY" );
        stop();
    }

    if ( gameLoopRunning && navdata.demo && navdata.demo.altitudeMeters < 0.3 )
    {
        console.log( "toolow, " + navdata.demo.altitudeMeters + " stopping" );
        stop();
    }
} );

var _startGameLoop = function()
{
    console.log( "start gameloop" );

    gameLoopRunning = true;

    gameLoopTimer = setInterval( function()
    {
        var newDirection;

        if ( direction === "up" )
        {
            verticalFactor = ( verticalFactor -= gravityFactor );

            if ( verticalFactor <= 0 )
            {
                newDirection = "down";
            }
        }
        else
        {
            if ( verticalFactor < 10 )
            {
                verticalFactor = ( verticalFactor += gravityFactor );
            }
        }

        var navdataDemo = navdata.demo || {};

        console.log( "  >> direction", direction, "verticalFactor", verticalFactor );
        console.log( "  >> altitude", navdataDemo.altitudeMeters );

        var param = verticalFactor / 10;
        console.log( "sending command", direction, param );

        client[ direction ]( param );

        if ( newDirection )
        {
            direction = newDirection;
        }

    }, TIMELOOP );
};

var _stopGameLoop = function()
{
    gameLoopRunning = false;
    clearTimeout( gameLoopTimer );
};

var start = function()
{
    console.log( "takeoff" );

    client.takeoff();

    // Goto playing height
    //
    client
        .after( 4000, function()
        {
            _startGameLoop();
        });
};

var stop = function()
{
    console.log( "stop" );

    _stopGameLoop();

    client.stop();
    client.land();
};

var kick = function( data )
{
    console.log( "Kick!" );

    gravityFactor = 0.8;

    direction = "up";
    verticalFactor = data;
};

console.log( "game init" );

exports.start       = start;
exports.stop        = stop;
exports.kick        = kick;
