
var gl;
var points;
var NumTimesToSubdivide = 5;

var _x, _y, _theta, _penDown;

window.onload = function init()
{
    var canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    points = [];

    // initTurtle(-1, 0, 0, true);
    // forward(.5);
    // left(45);
    // forward(.5);
    // right(90);
    // forward(.5);
    // left(45);
    // forward(.5);

    // initTurtle(-1, 0, 0, true);
    // forward(1);
    // right(90);
    // forward(.5);
    // right(90);
    // forward(.5);
    // right(90);
    // forward(1);
    //
    // console.log(_theta);

    initTurtle(-1, -1, 0, true);

    divideTriangle(2, NumTimesToSubdivide);

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

function initTurtle (x, y, theta, penDown) {
    _x = x;
    _y = y;
    _theta = theta;
    _penDown = penDown;
}

function forward(distance) {
    var newX, newY;

    newX = (Math.cos(_theta) * distance) + _x;
    newY = (Math.sin(_theta) * distance) + _y;

    if (_penDown) {
        points.push(vec2(_x, _y));
        points.push(vec2(newX, newY));
    }

    _x = newX;
    _y = newY;
}

function right(angle) {
    _theta -= radians(angle);
    // TODO: handle full circles.
}

function left(angle) {
    _theta += radians(angle);
    // TODO: handle full circles.
}

function pen(up_down) {
    _penDown = up_down;
}


function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.LINES, 0, points.length);
}



function divideTriangle(length, count )
{

    // check for end of recursion

    if ( count === 0 ) {
        //pen(false);
        forward(length);
        left(120);
        forward(length);
        left(120);
        forward(length);
        left(120);
        //pen(true);
    }
    else {
        //bisect the sides



        --count;

        var l = length/2;

        /*
         * Best version
         */

        // divideTriangle(l, count);
        // forward(length);
        // left(120);

        // divideTriangle(l, count );
        // forward(length);
        // left(120);
        //
        // divideTriangle(l, count );
        // forward(length);
        // left(120);

        divideTriangle(l, count);
        forward(l);

        divideTriangle(l, count);
        left(120);
        forward(l);
        right(120);

        divideTriangle(l, count);
        left(240);
        forward(l);
        left(120);
    }
}