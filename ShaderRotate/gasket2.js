
var canvas;
var gl;

var points = [];

var NumTimesToSubdivide = 2;

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
        
    //
    //  Initialize our data for the Sierpinski Gasket
    //

    // First, initialize the corners of our gasket with three points.
    
    var vertices = [
        vec2( -.5, -.5 ),
        vec2(  0,  .5 ),
        vec2(  .5, -.5 )
    ];

    divideTriangle( vertices[0], vertices[1], vertices[2],
                    NumTimesToSubdivide);

    //
    //  Configure WebGL
    //
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

    var currentTime = new Date().getMilliseconds();
    var delta = 0;

    var timeLoc = gl.getUniformLocation( program, "time" );

    function render()
    {
        setTimeout(function()
        {
            requestAnimationFrame(render);
            gl.clear( gl.COLOR_BUFFER_BIT );

            delta += 5;
            gl.uniform1f(timeLoc, delta);

            gl.uniformMatrix2fv()

            gl.drawArrays( gl.TRIANGLES, 0, points.length );

        }, 16); // 60fps
    }
    render();
};

function triangle( a, b, c )
{
    points.push( a, b, c);
}

function divideTriangle( a, b, c, count )
{

    // check for end of recursion
    
    if ( count === 0 ) {
        triangle( a, b, c );
    }
    else {
    
        //bisect the sides
        
        var ab = mix( a, b, mixRand() );
        var ac = mix( a, c, mixRand() );
        var bc = mix( b, c, mixRand() );

        --count;

        // three new triangles
        
        divideTriangle( a, ab, ac, count );
        divideTriangle( c, ac, bc, count );
        divideTriangle( b, bc, ab, count );
        //divideTriangle( ab, bc, ac, count);
    }
}

function mixRand() {
    return getRandomArbitrary(.5, .5);
}

function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

