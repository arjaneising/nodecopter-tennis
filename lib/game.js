var arDrone = require( "ar-drone" )
,   client  = arDrone.createClient()
;

client.config('general:navdata_demo', 'TRUE');


var INITIAL_VERTICAL_SPEED  = 0
,   TIMELOOP                = 200
,   CEILING                 = 3
;

var verticalFactor   = INITIAL_VERTICAL_SPEED
,   gravityFactor   = 0
,   direction       = "up"
,   active          = false
,   navdata
,   gameLoopTimer
,   gameLoopRunning = false

,   droneInRange    = false

,   cb              =
    {
        inRange:        function() {}
    ,   outOfRange:     function() {}
    }
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

    if ( droneInRange && navdata.demo.altitudeMeters > CEILING )
    {
        droneInRange = false;
        cb.outOfRange();
    }

    if ( !droneInRange && navdata.demo.altitudeMeters < CEILING )
    {
        droneInRange = true;
        cb.inRange();
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

    client.disableEmergency();

    client.takeoff();

    // Goto playing height
    //
    client
        .after( 4000, function()
        {
            _startGameLoop();

            droneInRange = true;
            cb.inRange();
        });
};

var stop = function()
{
    console.log( "stop" );

    droneInRange = false;
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

var inRange = function( fn )
{
    cb.inRange = fn;
};

var outOfRange = function( fn )
{
    cb.outOfRange = fn;
};


exports.start       = start;
exports.stop        = stop;
exports.kick        = kick;
exports.inRange     = inRange;
exports.outOfRange  = outOfRange;
