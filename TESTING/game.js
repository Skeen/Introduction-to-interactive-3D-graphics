// TODO: Send stickman as buffer, then move via uniform variable?

/**
 * Created by dkchokk on 27-07-2016.
 */
$(function() {
    // WebGL stuff.
    var canvas;
    var gl;
    var program;
    var boxShaderProgram;

    // Initialization of WebGL.
    initWebGl();

    // Buffers
    //--------
    // Blocks
    var worldVBuffer;
    var worldCBuffer;
    var worldDCBuffer;
    var worldCenterBuffer;
    // Stick figure
    var stickVBuffer;
    var stickCBuffer;
    // Mouse
    var mouseVBuffer;
    var mouseCBuffer;
    var mouseCenterBuffer;

    // Game related stuff.
    var worldWidth = 40;
    var worldHeight = 40;
    var worldBlocks = worldWidth * worldHeight;
    //var squareSize = canvas.clientWidth / 10;
    var worldGrid = [];
    // world variables
    var verts_per_block = 4;
    // stick-man variables
    var move_length = 0.5;
    var jump_height = 5;
    var gravity_check = 0.1;
    var stick_man_pos;
    var stick_man_num_points;
    // mouse
    var mouse_points = [];
    var mouse_colors = [];
    var mouse_centers = [];
    // Shockwave variables
    var shockwave_duration = 1000;
    var timerId;
    // Render stuf
    var render_scale = 2 / Math.max(worldWidth, worldHeight);

    // Shader variables
    var vPosition;
    var vColor;
    var vScalePos;
    var vCenterPos;
    var vClickPos;
    var vTime;
    var vStickPos;

    // Setup buffers
    initBuffers();

    var blocks = {
        EMPTY: 0,
        STONE: 1,
        GRASS: 2,
        DIRT: 3,
        WOOD: 4,
        METAL: 5,
        WATER: 6,
        FIRE: 7,

        to_string: function(value)
        {
            for(var key in this)
                if(this[key] == value)
                    return key;
            alert("Invalid tile value, cannot convert to string!");
            return null;
        },

        from_string: function(string)
        {
            for(var key in this)
                if(key == string)
                    return this[key];
            alert("Invalid tile string, cannot convert to enum!");
            return null;
        },

        to_color: function(block)
        {
            switch(block)
            {
                case blocks.EMPTY:
                    return vec4(0., 0., 1., 0.);
                case blocks.STONE:
                    return vec4(0.2, 0.2, 0.2, 1.);
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
    }

    // TODO: Add checks all-over
    function isInt(n)
    {
        return n % 1 === 0;
    }

    function valid_index(x, y)
    {
        if(isInt(x) == false || isInt(y) == false)
        {
            console.log("valid_index called with non-integer arguments!", x, y);
            alert("valid_index called with non-integer arguments!");
        }

        return (x >= 0 && x < worldWidth &&
                y >= 0 && y < worldHeight)
         
    }

    function can_build(x, y)
    {
        // Check that x and y are valid
        if(isInt(x) == false || isInt(y) == false)
        {
            alert("can_build called with non-integer arguments!");
        }
        if(valid_index(x, y) == false)
        {
            return false;
        }

        // Check if the block is free
        if(worldGrid[x][y].tile != blocks.EMPTY)
        {
            return false;
        }
        // Check that an adjecent block exists
        for(var i = -1; i <= 1; i++)
            for(var j = -1; j <= 1; j++)
                // Ensure that the indicies are valid (i.e. within array bounds)
                if(valid_index(x+i, y+j))
                    // If we find one adjecent, we're good
                    if((worldGrid[x+i][y+j].tile != blocks.EMPTY))
                        return true;
                    //console.log(x+i, y+j, worldGrid[x+i][y+j].tile != blocks.EMPTY);

        return false;

    }

    /*
    worldGrid[1][0].tile = blocks.STONE;
    worldGrid[0][0].tile = blocks.STONE;
    console.log(can_build(0,0));
*/

    function setup_initial_world()
    {
        // Generate empty world.
        for (var x = 0; x < worldWidth; x++) {
            worldGrid[x] = [];
            for (var y = 0; y < worldHeight; y++) {
                worldGrid[x][y] = {
                    // Tile
                    tile: blocks.EMPTY,
                    // Center position
                    pos: vec2(x, y)
                }
            }
        }

        // ------------ //
        // Update tiles //
        // ------------ //
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

        // Create lake
        for (var x = Math.floor(worldWidth/4*2); x < Math.floor(worldWidth/4*3); x++) {
            var y = Math.floor(worldHeight/3);
            worldGrid[x][y+1].tile = blocks.WATER;
        }

        // Create fire/lava pit
        for (var x = 0; x < Math.floor(worldWidth/4); x++) {
            var y = Math.floor(worldHeight/3);
            worldGrid[x][y+1].tile = blocks.FIRE;
        }
    }

    setup_initial_world();

    function update_block(x, y, tile)
    {
        worldGrid[x][y].tile = tile;
        var tile_color = blocks.to_color(tile);

        // Get the start offset into world_colors
        var offset = 4 * (y + (x * worldGrid.length));

        rebufferColor(offset, offset+4, tile_color);
    }

    function rebufferColor(start, end, color)
    {
        var replace_values = [];
        for(var i = 0; i < (end - start); i++)
        {
            replace_values.push(color);
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, worldCBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, start*sizeof['vec4'], flatten(replace_values));
    }


    function initialize_block_world()
    {
        var world_centers = [];
        var world_points = [];
        var world_colors = [];
        var world_Dcolors = [];
        for (var x = 0; x < worldGrid.length; x++)
        {
            for (var y = 0; y < worldGrid[x].length; y++)
            {
                var point = worldGrid[x][y];
                var tile_color = blocks.to_color(point.tile);
                var tile_detect = vec4(x, worldGrid[x].length - y, 0., 255.);

                world_points.push(vec2(point.pos[0] - 0.5, point.pos[1] - 0.5));
                world_points.push(vec2(point.pos[0] - 0.5, point.pos[1] + 0.5));
                world_points.push(vec2(point.pos[0] + 0.5, point.pos[1] + 0.5));
                world_points.push(vec2(point.pos[0] + 0.5, point.pos[1] - 0.5));

                for(var i = 0; i < 4; i++)
                {
                    world_colors.push(tile_color);
                    world_Dcolors.push(tile_detect);
                    world_centers.push(vec2(point.pos[0], point.pos[1]));
                }
            }
        }

        // Buffer Color
        gl.bindBuffer(gl.ARRAY_BUFFER, worldCBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(world_colors), gl.STATIC_DRAW);
        // Buffer Detect Color
        gl.bindBuffer(gl.ARRAY_BUFFER, worldDCBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(world_Dcolors), gl.STATIC_DRAW);
        // Buffer Verticies
        gl.bindBuffer(gl.ARRAY_BUFFER, worldVBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(world_points), gl.STATIC_DRAW);
    }

    initialize_block_world();

    function block_by_pos(x, y)
    {
        if(isInt(x) == false || isInt(y) == false)
        {
            alert("block_by_pos called with non-integer arguments!");
        }

        return worldGrid[x][y];
    }

    canvas.addEventListener("mousedown", function (event)
    {
        var ctx = canvas.getContext("experimental-webgl", {preserveDrawingBuffer: true});
        Drender();
        var pixels = new Uint8Array(4);
        gl.readPixels(event.clientX, event.clientY, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
        console.log(pixels[0] - 1, pixels[1]);
//        console.log((pixels[0] * worldWidth / 255), (pixels[1] * worldHeight / 255));
        //console.log(Math.round(pixels[0] * worldWidth / 255), Math.round(pixels[1] * worldHeight / 255));
        
        var mousePoint = vec2((((-1 + 2 * event.clientX / canvas.width)+1)/2)*worldWidth,
                (((-1 + 2 * ( canvas.height - event.clientY ) / canvas.height)+1)/2)*worldHeight);
        //console.log(mousePoint);
        // Get closest block position for rendering
        mousePoint = vec2(Math.round(mousePoint[0]) - 0.5, Math.round(mousePoint[1]) + 0.5);
        // Get block coordinates
        var blockX = Math.floor(mousePoint[0]);
        var blockY = Math.floor(mousePoint[1]);

        console.log(blockX, blockY);
/*
        blockX = Math.round(pixels[0] / 4);
        blockY = Math.round(worldHeight - (pixels[1] / 4));

        // Check if block is free
        var placeable = can_build(blockX, blockY);
        if(placeable && event.shiftKey == false)
        {
            var block_picker = document.getElementById('block_picker');
            var block_string = block_picker.options[block_picker.selectedIndex].value;
            var block_id = blocks.from_string(block_string);
            //console.log(block_string);
            //console.log(block_id);

            update_block(blockX, blockY, block_id);
            shockwave();
            //render();
        }
        else if(worldGrid[blockX][blockY].tile != blocks.EMPTY && event.shiftKey == true)
        {
            update_block(blockX, blockY, blocks.EMPTY);
            shockwave();
            //render();
        }
        */
    });

    function Drender()
    {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // Draw the world
        gl.useProgram(program);

        gl.bindBuffer(gl.ARRAY_BUFFER, worldDCBuffer);
        gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, worldVBuffer);
        gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);

        for (var i = 0; i < worldBlocks; i+=1)
        {
            gl.drawArrays(gl.TRIANGLE_FAN, verts_per_block*i, verts_per_block);
        }
    }

    function render()
    {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // -----------//
        // Draw BOXES //
        // -----------//
        gl.useProgram(boxShaderProgram);
        // Draw the world
        gl.bindBuffer(gl.ARRAY_BUFFER, worldCBuffer);
        gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, worldVBuffer);
        gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);

        for (var i = 0; i < worldBlocks; i+=1)
        {
            gl.drawArrays(gl.TRIANGLE_FAN, verts_per_block*i, verts_per_block);
        }

        window.requestAnimFrame(render, canvas);
    }

    //render();
    //Drender();

    // Initialize WebGL render context.
    function initWebGl()
    {
        canvas = document.getElementById("gl-canvas");
        gl = WebGLUtils.setupWebGL(canvas);
        if (!gl)
        {
            alert("Unable to setup WebGL!");
            return;
        }
        gl.viewport(0, 0, canvas.clientWidth, canvas.clientHeight);
        gl.clearColor(1.0, 1.0, 1.0, 1.0);
        gl.enable(gl.DEPTH_TEST);

        var vertexShader = initShader(gl, 'vertex-shader', gl.VERTEX_SHADER);
        var fragmentShader = initShader(gl, 'fragment-shader', gl.FRAGMENT_SHADER);
        var boxShader = initShader(gl, 'block-fragment-shader', gl.FRAGMENT_SHADER);
        var boxVShader = initShader(gl, 'block-vertex-shader', gl.VERTEX_SHADER);

        program = gl.createProgram();
        gl.attachShader(program, fragmentShader);
        gl.attachShader(program, vertexShader);
        gl.linkProgram(program);

        boxShaderProgram = gl.createProgram();
        gl.attachShader(boxShaderProgram, boxVShader);
        gl.attachShader(boxShaderProgram, boxShader);
        gl.linkProgram(boxShaderProgram);
    }

    // Initialize buffers.
    function initBuffers()
    {
        gl.useProgram(boxShaderProgram);

        // Get Shader variable positions
        vPosition = gl.getAttribLocation(boxShaderProgram, "vPosition");
        vColor = gl.getAttribLocation(boxShaderProgram, "vColor");
        vScalePos = gl.getUniformLocation(boxShaderProgram, "vScale");

        // World Vertex buffer
        worldVBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, worldVBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, sizeof['vec2'] * worldBlocks * 4, gl.STATIC_DRAW);
        gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vPosition);
        // World Color buffer
        worldCBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, worldCBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, sizeof['vec4'] * worldBlocks * 4, gl.STATIC_DRAW);
        gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vColor);
        // World Center buffer
        worldCenterBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, worldCenterBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, sizeof['vec2'] * worldBlocks * 4, gl.STATIC_DRAW);

        // Set the uniform scale variable
        gl.uniform1f(vScalePos, render_scale);

        gl.useProgram(program);

        vPosition = gl.getAttribLocation(program, "vPosition");
        vColor = gl.getAttribLocation(program, "vColor");
        vScalePos = gl.getUniformLocation(program, "vScale");

        worldVBuffer = gl.createBuffer();
        gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vPosition);

        // World Color buffer
        worldDCBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, worldDCBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, sizeof['vec4'] * worldBlocks * 4, gl.STATIC_DRAW);
        gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vColor);
        

        // Set the uniform scale variable
        gl.uniform1f(vScalePos, render_scale);
    }
});
