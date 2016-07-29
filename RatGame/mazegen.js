
var gl;
var points;

window.onload = function init()
{
    var canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    points = [];

    var m = 500, n = 500;
    var s = 2 / Math.max(m, n);

    function MazeGen(m, n, offsetM, offsetN, chance) {

        if (m < 2 || n < 2)
            return;

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


    left_hole = Math.floor(getRandomArbitrary(1, n));
    points.push(vec2(0-m/2,0-n/2), vec2(0-m/2,left_hole-1-n/2));
    points.push(vec2(0-m/2,left_hole-n/2), vec2(0-m/2,n-n/2));

    right_hole = Math.floor(getRandomArbitrary(1, m));
    points.push(vec2(m-m/2,0-n/2), vec2(m-m/2,right_hole-1-n/2));
    points.push(vec2(m-m/2,right_hole-n/2), vec2(m-m/2,n-n/2));

    points.push(vec2(0 - m/2, n - n/2), vec2(m - m / 2, n - n/2));
    points.push(vec2(0 - m/2, 0 - n/2), vec2(m - m / 2, 0 - n/2));

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

    // Associate our shader variables with our data buffer
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    var vScalePos = gl.getUniformLocation(program, "vScale");
    gl.uniform1f(vScalePos, s);

    var mousePos = vec2(0 - (m / 2) + (2 / m) * 2, left_hole - 1 - n/2 + (2 / n) * 2);

    // Mussebuffer
    var musseBufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, musseBufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(mousePos), gl.STATIC_DRAW );

    function buffer() {
        gl.bindBuffer( gl.ARRAY_BUFFER, musseBufferId );
        gl.bufferData( gl.ARRAY_BUFFER, flatten(mousePos), gl.STATIC_DRAW );
    }

    function render() {
        gl.clear( gl.COLOR_BUFFER_BIT );

        // draw maze.
        gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
        gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );

        gl.( gl.LINES, 0, points.length);

        // draw mouse.
        gl.bindBuffer( gl.ARRAY_BUFFER, musseBufferId );
        gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );

        gl.drawArrays(gl.POINTS, 0, 1);
    }
    render();

    window.addEventListener("keydown", function (e) {
        var key = String.fromCharCode(e.keyCode);

        switch(key) {
            case "W":
            case "A":
            case "S":
            case"D":
                if (canMove(key))
                    mousePos = newPosition(key);
                break;
        }

        if (mousePos[0] < 0 - (m / 2)) {
            alert("bad job");
            mousePos = newPosition("D");
            mousePos = newPosition("D");
        }

        buffer();
        render();

        if (mousePos[0] > (m / 2)) {
            alert("good job");
            window.location = window.location;
        }
    });

    function newPosition(direction) {
        var moveAmount = (2 / n) * 2;
        switch(direction){
            case "W":
                return vec2(mousePos[0], mousePos[1] + moveAmount);
            case "S":
                return vec2(mousePos[0], mousePos[1] - moveAmount);
            case "A":
                return vec2(mousePos[0] - moveAmount, mousePos[1]);
            case "D":
                return vec2(mousePos[0] + moveAmount, mousePos[1]);
        }
        alert("CRITICAL ERROR");
    }


    function canMove(direction) {
        for(var x=0; x<points.length; x+=2)
        {
            var one = points[x];
            var two = points[x+1];
            var newPos = newPosition(direction);

            if (doIntersect(mousePos, newPos, one, two))
                return false;
        }
        return true;
    }

    function onSegment(p, q, r)
    {
        if(q[0] <= Math.max(p[0], r[0]) && q[0] >= Math.min(p[0], r[0]) && q[1] <= Math.max(p[1], r[1]) && q[1] >= Math.min(p[1], r[1]))
            return true;
        return false;
    }

    function orientation(p, q, r)
    {
        var val = (q[1] - p[1]) * (r[0] - q[0]) - (q[0] - p[0]) * (r[1] - q[1]);
        if (val == 0) return 0;
        return (val > 0) ? 1 : 2;
    }

    function doIntersect(p1, q1, p2, q2)
    {
        var o1 = orientation(p1, q1, p2);
        var o2 = orientation(p1, q1, q2);
        var o3 = orientation(p2, q2, p1);
        var o4 = orientation(p2, q2, q1);

        if (o1 != o2 && o3 != o4)
            return true;

        if (o1 == 0 && onSegment(p1, p2, q1)) return true;
        if (o2 == 0 && onSegment(p1, q2, q1)) return true;
        if (o3 == 0 && onSegment(p2, p1, q2)) return true;
        if (o4 == 0 && onSegment(p2, q1, q2)) return true;

        return false;
    }
};