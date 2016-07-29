/**
 * Created by dkchokk on 27-07-2016.
 */
$(function() {
    // WebGL stuff.
    var canvas, gl, program;

    // Initialization of WebGL.
    initWebGl();

    // Buffers
    //--------
    // Blocks
    var vertexBuffer;
    var colorBuffer;
    var verts_per_block = 6;
    // Stick figure
    var stickBuffer;

    // Shader positions.
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

    // Render stuf
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
                return vec4(0., 0., 1., 0.1);
            case blocks.STONE:
                return vec4(5., 5., 5., 1.);
            case blocks.GRASS:
                return vec4(0., 1., 0., 1.);
            case blocks.DIRT:
                return vec4(0.55, 0.27, 0.07, 1.);
            case blocks.WOOD:
                return vec4(0.87, 0.72, 0.53, 1.);
            case blocks.METAL:
                return vec4(0.82, 0.82, 0.82, 1.);
            case blocks.WATER:
                return vec4(0., 0., 1., 1.);
            case blocks.FIRE:
                return vec4(1., 0., 0., 1.);
            default:
                alert("Invalid tile, cannot convert to color!");
        }
    }

    function can_build(x, y)
    {
        // Check if the block is free
        if(worldGrid[x][y].tile != blocks.EMPTY)
        {
            return false;
        }
        // Check that an adjecent block exists
        for(var i = -1; i <= 1; i++)
            for(var j = -1; j <= 1; j++)
                // Ensure that the indicies are valid (i.e. within array bounds)
                if(x+i >= 0 && x+i < worldWidth &&
                   y+j >= 0 && y+j < worldHeight)
                    // If we find one adjecent, we're good
                    if((worldGrid[x+i][y+j].tile != blocks.EMPTY))
                        return true;
                    //console.log(x+i, y+j, worldGrid[x+i][y+j].tile != blocks.EMPTY);

        return false;

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
/*
    worldGrid[1][0].tile = blocks.STONE;
    worldGrid[0][0].tile = blocks.STONE;
    console.log(can_build(0,0));
*/

    // Create ground
    for (var x = 0; x < worldWidth; x++) {
        for (var y = 0; y < Math.floor(worldHeight/3); y++) {
            worldGrid[x][y].tile = blocks.DIRT;
        }
    }

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
                    var tile_color = tile_to_color(point.tile);

                    points.push(point.pos);
                    colors.push(vec4(0., 0., 0., tile_color[3]));

                    points.push(vec2(point.pos[0] - 0.5, point.pos[1] - 0.5));
                    colors.push(tile_color);
                    points.push(vec2(point.pos[0] - 0.5, point.pos[1] + 0.5));
                    colors.push(tile_color);
                    points.push(vec2(point.pos[0] + 0.5, point.pos[1] + 0.5));
                    colors.push(tile_color);
                    points.push(vec2(point.pos[0] + 0.5, point.pos[1] - 0.5));
                    colors.push(tile_color);
                    points.push(vec2(point.pos[0] - 0.5, point.pos[1] - 0.5));
                    colors.push(tile_color);
                }
            }
        }
    }
    flatten2dArray(worldGrid);

    var stick_man;
    var stick_man_pos;

    function update_stick_man(x, y)
    {
        stick_man_pos = vec2(x,y);
        stick_man = [];
        // Legs
        stick_man.push(vec2(0,0), vec2(1,1));
        stick_man.push(vec2(2,0), vec2(1,1));
        // Body
        stick_man.push(vec2(1,1), vec2(1,3));
        // Arms
        stick_man.push(vec2(0,2.5), vec2(2,2.5));
        // Face
        stick_man.push(vec2(1,3), vec2(0.5,4));
        stick_man.push(vec2(1,3), vec2(1.5,4));
        stick_man.push(vec2(0.5,4), vec2(1.5,4));

        for(var i = 0; i < stick_man.length; i++)
        {
            stick_man[i][0] += x;
            stick_man[i][1] += y;
        }
    }

    update_stick_man(0.5, Math.floor(worldHeight/3)+10);

    function block_by_pos(x, y)
    {
        return worldGrid[Math.floor(x)][Math.floor(y)];
    }

    setInterval(function gravity()
    {
        // Get block below stickman
        var block = block_by_pos(stick_man_pos[0], stick_man_pos[1] - 0.1);
        if(block.tile == blocks.EMPTY)
        {
            update_stick_man(stick_man_pos[0], stick_man_pos[1] - 0.1);
            render();
        }
    }, 10);

    window.addEventListener("keydown", function (e) {
        var key = String.fromCharCode(e.keyCode);
        var move_length = 0.5;
        var jump_height = 5;

        function jump()
        {
            var block = block_by_pos(stick_man_pos[0], stick_man_pos[1] - 0.1);
            if(block.tile != blocks.EMPTY)
            {
                update_stick_man(stick_man_pos[0], stick_man_pos[1] + jump_height);
                render();
            }
        }

        function move_left()
        {
            var block = block_by_pos(stick_man_pos[0] - move_length, stick_man_pos[1]);
            if(block.tile == blocks.EMPTY)
            {
                update_stick_man(stick_man_pos[0] - move_length, stick_man_pos[1]);
                render();
            }
        }

        function move_right()
        {
            var block = block_by_pos(stick_man_pos[0] + move_length, stick_man_pos[1]);
            if(block.tile == blocks.EMPTY)
            {
                update_stick_man(stick_man_pos[0] + move_length, stick_man_pos[1]);
                render();
            }
        }


        switch(key) {
            case "W":
                jump();
                break;
            case "A":
                move_left();
                break;
            case "D":
                move_right();
                break;
        }
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

        gl.bindBuffer(gl.ARRAY_BUFFER, stickBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(stick_man), gl.STATIC_DRAW);
        gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);

        gl.drawArrays(gl.LINES, 0, stick_man.length);
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
        var vPosition = gl.getAttribLocation(program, 'vPosition');
        var vColor = gl.getAttribLocation(program, "vColor");

        var vScalePos = gl.getUniformLocation(program, "vScale");
        gl.uniform1f(vScalePos, render_scale);

        vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, sizeof['vec2'] * worldBlocks, gl.STATIC_DRAW);
        gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vPosition);

        colorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, sizeof['vec4'] * worldBlocks, gl.STATIC_DRAW);
        gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vColor);

        stickBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, stickBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, sizeof['vec2'] * 7 * 2, gl.STATIC_DRAW);
        gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vPosition);
    }
});
