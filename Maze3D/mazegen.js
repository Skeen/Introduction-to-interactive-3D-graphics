
var gl;
var points;

var extrudeSettings = {
    steps			: 200,
    bevelEnabled	: false,
    extrudePath		: randomSpline
};

window.onload = function init()
{
    var canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    points = [];

    var m = 4, n = 4;
    var s = 2 / Math.max(m, n);

    function MazeGen(m, n, offsetM, offsetN, chance) {

        if (m < 2 || n < 2)
            return;

        console.log(m, n);

        var mRand = Math.floor(getRandomArbitrary(1, m));
        var nRand = Math.floor(getRandomArbitrary(1, n));

        if (Math.random() > chance ) {
            points.push(vec2(mRand+offsetM, 0+offsetN), vec2(mRand+offsetM, nRand - 1+offsetN));
            points.push(vec2(mRand+offsetM, nRand+offsetN), vec2(mRand+offsetM, n+offsetN));

            MazeGen(mRand, n, offsetM, offsetN, 1);
            MazeGen(m-mRand, n, offsetM + mRand, offsetN, 1);
        }
        else {
            points.push(vec2(0+offsetM, nRand+offsetN), vec2(mRand - 1 + offsetM, nRand + offsetN));
            points.push(vec2(mRand+offsetM, nRand+offsetN), vec2(m+offsetM, nRand+offsetN));

            MazeGen(m, nRand, offsetM, offsetN, 0);
            MazeGen(m, n-nRand, offsetM, offsetN + nRand, 0);
        }
    }

    MazeGen(m, n, -m/2, -n/2, 0.5);

    console.log(points);

    left_hole = Math.floor(getRandomArbitrary(1, n));
    points.push(vec2(0-m/2,0-n/2), vec2(0-m/2,left_hole-1-n/2));
    points.push(vec2(0-m/2,left_hole-n/2), vec2(0-m/2,n-n/2));

    right_hole = Math.floor(getRandomArbitrary(1, m));
    points.push(vec2(m-m/2,0-n/2), vec2(m-m/2,right_hole-1-n/2));
    points.push(vec2(m-m/2,right_hole-n/2), vec2(m-m/2,n-n/2));

    var tPoints = [];
    for (var p in points) {
        var point = points[p];

        //scale(s, point);
        tPoints.push(scale(s, point));
    }

    points = tPoints;

    points.push(vec2(-1,1), vec2(1,1));
    points.push(vec2(-1,-1), vec2(1,-1));

    console.log(points);

    function getRandomArbitrary(min, max) {
        return Math.random() * (max - min) + min;
    }

    //  Configure WebGL

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    
    //  Load shaders and initialize attribute buffers
    
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Load the data into the GPU
    
    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer
    
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    render();
};

function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.LINES, 0, points.length);
}