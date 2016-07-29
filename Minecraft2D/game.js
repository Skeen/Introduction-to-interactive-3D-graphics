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
    var colorBuffer;
    var verts_per_block = 6;
    // Initialize buffers.
    var vPosition;
    var vColor;

    // Game related stuff.
    var worldWidth = 40;
    var worldHeight = 40;
    var worldBlocks = worldWidth * worldHeight;
    //var squareSize = canvas.clientWidth / 10;
    var worldGrid = [];
    var points = [];
    var colors = [];

    var mousePoint = vec2(.0, .0);

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

    function tile_to_color(block)
    {
        switch(block)
        {
            case blocks.EMPTY:
                return vec4(0., 0., 1., 0.4);
            case blocks.STONE:
                return vec4(5., 5., 5., 1.);
            case blocks.GRASS:
                return vec4(0., 1., 0., 1.);
            case blocks.DIRT:
                return vec4(0.55, 0.27, 0.07, 1.);
            // TODO: Rest of cases
        }
    }

    // Generate empty world.
    for (var x = 0; x < worldWidth; x++) {
        worldGrid[x] = [];
        for (var y = 0; y < worldHeight; y++) {
            worldGrid[x][y] = {
                tile: blocks.EMPTY,
                pos: vec2(x + 0.5, y + 0.5)
                //rendered: false
            }
        }
    }

    // Create ground
    //for (var x = 0; x < worldWidth; x++) {
    //    for (var y = 0; y < Math.floor(worldHeight/3); y++) {
    //        worldGrid[x][y].tile = blocks.DIRT;
    //    }
    //}

    // Create grass
    for (var x = 0; x < worldWidth; x++) {
        var y = Math.floor(worldHeight/3);
        worldGrid[x][y].tile = blocks.GRASS;
        worldGrid[x][y+1].tile = blocks.GRASS;
    }

    function flatten2dArray(pointsArray) {
        for (var x = 0; x < pointsArray.length; x++) {
            for (var y = 0; y < pointsArray[x].length; y++) {
                var point = pointsArray[x][y];
                if(point.tile != blocks.EMPTY)
                {
                    points.push(point.pos);
                    colors.push(vec4(0., 0., 0., 1.));

                    points.push(vec2(point.pos[0] - 0.5, point.pos[1] - 0.5));
                    colors.push(tile_to_color(point.tile));
                    points.push(vec2(point.pos[0] - 0.5, point.pos[1] + 0.5));
                    colors.push(tile_to_color(point.tile));
                    points.push(vec2(point.pos[0] + 0.5, point.pos[1] + 0.5));
                    colors.push(tile_to_color(point.tile));
                    points.push(vec2(point.pos[0] + 0.5, point.pos[1] - 0.5));
                    colors.push(tile_to_color(point.tile));
                    points.push(vec2(point.pos[0] - 0.5, point.pos[1] - 0.5));
                    colors.push(tile_to_color(point.tile));
                }
            }
        }
    }

    flatten2dArray(worldGrid);

    //MouseListener with a point that follows the mouse
    canvas.addEventListener("mousemove", function (event) {

        mousePoint = vec2((((-1 + 2 * event.clientX / canvas.width)+1)/2)*worldWidth,
                (((-1 + 2 * ( canvas.height - event.clientY ) / canvas.height)+1)/2)*worldHeight);
        //var selectedBlock = document.getElementById('Block');
        //console.log(selectedBlock);
        //color = selectedBlock;

        gl.bindBuffer(gl.ARRAY_BUFFER, mouseBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(mousePoint));
        console.log((mousePoint[0]+1)/2);
        console.log((mousePoint[1]+1)/2);
        render();
        //gl.bindBuffer(gl.ARRAY_BUFFER, cBufferId);
        //gl.bufferSubData(gl.ARRAY_BUFFER, 16 * index, flatten(color));
    });
    function render() {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);
        gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);
        gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);

        for (var i = 0; i < points.length/verts_per_block; i+=1)
        {
            gl.drawArrays(gl.TRIANGLE_FAN, verts_per_block*i, verts_per_block);
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, mouseBuffer);
        //gl.bufferData(gl.ARRAY_BUFFER, flatten(t), gl.STATIC_DRAW);
        gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
        gl.drawArrays(gl.POINTS, 0, 1);
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
        gl.bufferData(gl.ARRAY_BUFFER, sizeof['vec2'] * worldBlocks, gl.STATIC_DRAW);

        colorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, sizeof['vec4'] * worldBlocks, gl.STATIC_DRAW);
 

        var vPosition = gl.getAttribLocation(program, 'vPosition');
        gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vPosition);

        var vColor = gl.getAttribLocation(program, "vColor");
        gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vColor);

        var vScalePos = gl.getUniformLocation(program, "vScale");
        gl.uniform1f(vScalePos, render_scale);

        // Mouse square buffer
        mouseBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, mouseBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(mousePoint), gl.STATIC_DRAW);
        gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vPosition);

    }
});
