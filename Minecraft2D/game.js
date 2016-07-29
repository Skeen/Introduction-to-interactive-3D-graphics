/**
 * Created by dkchokk on 27-07-2016.
 */
$(function() {
    // WebGL stuff.
    var canvas, gl, program;

    // Initialization of WebGL.
    initWebGl();

    // Buffers.
    var vertexBuffer;

    // Initialize buffers.
    initBuffers();

    // Game related stuff.
    var squareSize = canvas.clientWidth / 10;
    var worldWidth = squareSize, worldHeight = squareSize, worldGrid = [], points = [];

    // Generate world.
    for (var x = 0; x < worldWidth; x++) {
        worldGrid[x] = [];
        for (var y = x; y < worldHeight; y++) {
            console.log(0 - (worldGrid.length / 2))
            var newX = (((x -(worldGrid.length/2))*(-1))/ (worldGrid.length/2));
            var newY = ((y -(worldGrid.length/2))*(-1))/ (worldGrid.length/2);
            worldGrid[x][y] = vec2(newX, newY);
        }
    }

    function flatten2dArray(pointsArray) {
        for (var x = 0; x < pointsArray.length; x++) {
            for (var y = x; y < pointsArray[0].length; y++) {
                points.push(pointsArray[x][y]);
            }
        }
    }
    flatten2dArray(worldGrid);

    function render() {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);
        gl.drawArrays(gl.POINTS, 0, points.length);
    }
    render();


    // Initialize WebGL render context.
    function initWebGl() {
        canvas = document.getElementById("gl-canvas");
        gl = WebGLUtils.setupWebGL(canvas);
        if (!gl)
            return;
        gl.viewport(0, 0, canvas.clientWidth, canvas.clientHeight);
        gl.clearColor(1.0, 1.0, 1.0, 1.0);
        gl.enable(gl.DEPTH_TEST);

        // Initialize shaders.
        program = initShaders(gl, "vertex-shader", "fragment-shader");
        gl.useProgram(program);
    }

    // Initialize buffers.
    function initBuffers() {
        vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

        var vPosition = gl.getAttribLocation(program, 'vPosition');
        gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vPosition);
    }
});