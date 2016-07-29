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

    // Game related stuff.
    var worldWidth = 40;
    var worldHeight = 40;
    //var squareSize = canvas.clientWidth / 10;
    var worldGrid = [];
    var points = [];

    var render_scale = 2 / Math.max(worldWidth, worldHeight);

    initBuffers();

    var blocks = {
        EMTPY: 0,
        STONE: 1,
        GRASS: 2,
        DIRT: 3,
        WOOD: 4,
        METAL: 5,
        WATER: 6,
        FIRE: 7
    }

    // Generate world.
    for (var x = 0; x < worldWidth; x++) {
        worldGrid[x] = [];
        for (var y = 0; y < worldHeight; y++) {
            worldGrid[x][y] = {
                tile: blocks.empty,
                pos: vec2(x + 0.5, y + 0.5)
            }
        }
    }

    function flatten2dArray(pointsArray) {
        for (var x = 0; x < pointsArray.length; x++) {
            for (var y = 0; y < pointsArray[x].length; y++) {
                points.push(pointsArray[x][y].pos);
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

        var vScalePos = gl.getUniformLocation(program, "vScale");
        gl.uniform1f(vScalePos, render_scale);


    }
});
