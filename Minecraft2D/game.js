/**
 * Created by dkchokk on 27-07-2016.
 */
$(function() {
    // WebGL stuff.
    var canvas, gl, program, boxShaderProgram;

    // Initialization of WebGL.
    initWebGl();

    // Buffers
    //--------
    // Blocks
    var worldVBuffer;
    var worldCBuffer;
    // Stick figure
    var stickVBuffer;
    var stickCBuffer;
    // Mouse
    var mouseVBuffer;
    var mouseCBuffer;

    // Initialize buffers.


    // Game related stuff.
    var worldWidth = 40;
    var worldHeight = 40;
    var worldBlocks = worldWidth * worldHeight;
    //var squareSize = canvas.clientWidth / 10;
    var worldGrid = [];
    // world render
    var world_points = [];
    var world_colors = [];
    // world variables
    var verts_per_block = 4;
    // stick-man variables
    var move_length = 0.5;
    var jump_height = 5;
    var gravity_check = 0.1;
    var stick_man_pos;
    var stick_points = [];
    var stick_colors = [];
    // mouse
    var mouse_points = [];
    var mouse_colors = [];

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

    // TODO: Throw inside blocks
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

    // TODO: Add checks all-over
    function isInt(n)
    {
        return n % 1 === 0;
    }

    function valid_index(x, y)
    {
        if(isInt(x) == false || isInt(y) == false)
        {
            alert("valid_index called with non-integer arguments!");
        }

        return (x >= 0 && x < worldWidth &&
                y >= 0 && y < worldHeight)
         
    }

    function can_build(x, y)
    {
        if(isInt(x) == false || isInt(y) == false)
        {
            alert("can_build called with non-integer arguments!");
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

    function flatten2dArray(pointsArray) {
        for (var x = 0; x < pointsArray.length; x++) {
            for (var y = 0; y < pointsArray[x].length; y++) {
                var point = pointsArray[x][y];
                //if(point.tile != blocks.EMPTY)
                {
                    var tile_color = tile_to_color(point.tile);
/*
                    world_points.push(point.pos);
                    world_colors.push(vec4(0., 0., 0., tile_color[3]));
*/
                    world_points.push(vec2(point.pos[0] - 0.5, point.pos[1] - 0.5));
                    world_colors.push(tile_color);
                    world_points.push(vec2(point.pos[0] - 0.5, point.pos[1] + 0.5));
                    world_colors.push(tile_color);
                    world_points.push(vec2(point.pos[0] + 0.5, point.pos[1] + 0.5));
                    world_colors.push(tile_color);
                    world_points.push(vec2(point.pos[0] + 0.5, point.pos[1] - 0.5));
                    world_colors.push(tile_color);
/*                  
                    world_points.push(vec2(point.pos[0] - 0.5, point.pos[1] - 0.5));
                    world_colors.push(tile_color);
*/                   
                }
            }
        }
    }

    flatten2dArray(worldGrid);

    function update_stick_man(x, y)
    {
        stick_man_pos = vec2(x,y);
        stick_points = [];
        stick_colors = [];
        // Legs
        stick_points.push(vec2(0,0), vec2(1,1));
        stick_points.push(vec2(2,0), vec2(1,1));
        // Body
        stick_points.push(vec2(1,1), vec2(1,3));
        // Arms
        stick_points.push(vec2(0,2.5), vec2(2,2.5));
        // Face
        stick_points.push(vec2(1,3), vec2(0.5,4));
        stick_points.push(vec2(1,3), vec2(1.5,4));
        stick_points.push(vec2(0.5,4), vec2(1.5,4));

        for(var i = 0; i < stick_points.length; i++)
        {
            // Update points
            stick_points[i][0] += x;
            stick_points[i][1] += y;
            // Add color
            stick_colors.push(vec4(0., 0., 0., 1.));
        }
    }

    update_stick_man(0.5 + Math.floor(worldHeight/3), Math.floor(worldHeight/3)+10);

    function block_by_pos(x, y)
    {
        if(isInt(x) == false || isInt(y) == false)
        {
            alert("block_by_pos called with non-integer arguments!");
        }

        return worldGrid[x][y];
    }

    function is_sink_block(block)
    {
        return block.tile == blocks.EMPTY || block.tile == blocks.WATER;
    }

    function is_jump_block(block)
    {
        return block.tile == blocks.FIRE;
    }

    setInterval(function gravity()
    {
        // Get blocks below stickman (left and right)
        var block_left = block_by_pos(Math.floor(stick_man_pos[0]), Math.floor(stick_man_pos[1] - gravity_check));
        var block_right = block_by_pos(1 + Math.ceil(stick_man_pos[0]), Math.floor(stick_man_pos[1] - gravity_check));
        // If both are sinkable, we sink
        if(is_sink_block(block_left) && is_sink_block(block_right))
        {
            update_stick_man(stick_man_pos[0], stick_man_pos[1] - gravity_check);
            render();
        }
        // If one is fire we jump
        else if(is_jump_block(block_left) || is_jump_block(block_right))
        {
            update_stick_man(stick_man_pos[0], stick_man_pos[1] + jump_height);
            render();
        }
    }, 10);

    window.addEventListener("keydown", function (e) {
        var key = String.fromCharCode(e.keyCode);

        var x = stick_man_pos[0];
        var y = stick_man_pos[1];

        function valid_rindex(x, y)
        {
            return valid_index(Math.round(x), Math.floor(y));
        }

        function jump()
        {
            var new_x = x;
            var new_y = y + jump_height;
            var check_y = y - gravity_check;

            if(valid_rindex(new_x, check_y) == false)
                return;

            // Get blocks below stickman (left and right)
            var block_left = block_by_pos(Math.floor(new_x), Math.floor(check_y));
            var block_right = block_by_pos(1 + Math.ceil(new_x), Math.floor(check_y));
            // If we stand on any of the block, we can jump
            if(is_sink_block(block_left) == false || is_sink_block(block_right) == false)
            {
                update_stick_man(new_x, new_y);
                render();
            }
        }

        function move(new_x, new_y, rounder)
        {
            if(valid_rindex(new_x, new_y) == false)
                return;

            // Check that we can stand in the new position
            var block = block_by_pos(rounder(new_x), Math.floor(new_y));
            if(is_sink_block(block))
            {
                update_stick_man(new_x, new_y);
                render();
            }
        }

        function move_left()
        {
            // We only need to check the left block (i.e. floor(x))
            move(x - move_length, y, Math.floor);
        }

        function move_right()
        {
            // We only need to check the right block (i.e. 1+ceil(x))
            move(x + move_length, y, function(x) { return 1 + Math.ceil(x) });
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

    //MouseListener with a point that follows the mouse
    canvas.addEventListener("mousemove", function (event)
    {
        var mousePoint = vec2((((-1 + 2 * event.clientX / canvas.width)+1)/2)*worldWidth,
                (((-1 + 2 * ( canvas.height - event.clientY ) / canvas.height)+1)/2)*worldHeight);
        // Get closest block position for rendering
        mousePoint = vec2(Math.round(mousePoint[0]) - 0.5, Math.round(mousePoint[1]) + 0.5);

        mouse_points = [];
        // Left edge
        mouse_points.push(vec2(mousePoint[0] - 0.5, mousePoint[1] - 0.5));
        mouse_points.push(vec2(mousePoint[0] - 0.5, mousePoint[1] + 0.5));
        // Right edge
        mouse_points.push(vec2(mousePoint[0] + 0.5, mousePoint[1] + 0.5));
        mouse_points.push(vec2(mousePoint[0] + 0.5, mousePoint[1] - 0.5));
        // Top edge
        mouse_points.push(vec2(mousePoint[0] - 0.5, mousePoint[1] + 0.5));
        mouse_points.push(vec2(mousePoint[0] + 0.5, mousePoint[1] + 0.5));
        // Bot edge
        mouse_points.push(vec2(mousePoint[0] - 0.5, mousePoint[1] - 0.5));
        mouse_points.push(vec2(mousePoint[0] + 0.5, mousePoint[1] - 0.5));
        // Diagonal edge
        mouse_points.push(vec2(mousePoint[0] - 0.5, mousePoint[1] - 0.5));
        mouse_points.push(vec2(mousePoint[0] + 0.5, mousePoint[1] + 0.5));

        var placeable = can_build(Math.floor(mousePoint[0]), Math.floor(mousePoint[1]));

        var color = (placeable ? vec4(0., 0., 0., 1.) : vec4(1., 0., 0., 1.));

        mouse_colors = [];
        for(var i = 0; i < mouse_points.length; i++)
        {
            mouse_colors.push(color);
        }

        // gl.bindBuffer(gl.ARRAY_BUFFER, mouseBuffer);
        // gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(mousePoint));

        render();
    });

    function render()
    {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.useProgram(program);

        // Draw the mouse block outline
        if(mouse_points.length != 0)
        {
            gl.bindBuffer(gl.ARRAY_BUFFER, worldCBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, flatten(mouse_colors), gl.STATIC_DRAW);
            gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);

            gl.bindBuffer(gl.ARRAY_BUFFER, mouseVBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, flatten(mouse_points), gl.STATIC_DRAW);
            gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);

            gl.drawArrays(gl.LINES, 0, mouse_points.length);
        }

        // Draw the stick figure
        gl.bindBuffer(gl.ARRAY_BUFFER, stickCBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(stick_colors), gl.STATIC_DRAW);
        gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, stickVBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(stick_points), gl.STATIC_DRAW);
        gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
        gl.drawArrays(gl.LINES, 0, stick_points.length);

        gl.useProgram(boxShaderProgram);

        // Draw the world
        gl.bindBuffer(gl.ARRAY_BUFFER, worldCBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(world_colors), gl.STATIC_DRAW);
        gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, worldVBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(world_points), gl.STATIC_DRAW);
        gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);

        gl.useProgram(boxShaderProgram);

        for (var i = 0; i < world_points.length/verts_per_block; i+=1)
        {
            gl.drawArrays(gl.TRIANGLE_FAN, verts_per_block*i, verts_per_block);
        }
    }
    render();

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

        program = gl.createProgram();
        gl.attachShader(program, fragmentShader);
        gl.attachShader(program, vertexShader);
        gl.linkProgram(program);

        boxShaderProgram = gl.createProgram();
        gl.attachShader(boxShaderProgram, vertexShader);
        gl.attachShader(boxShaderProgram, boxShader);
        gl.linkProgram(boxShaderProgram, boxShader);
    }

    var vPosition;
    var vColor;
    var vScalePos;

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
        gl.bufferData(gl.ARRAY_BUFFER, sizeof['vec2'] * worldBlocks, gl.STATIC_DRAW);
        gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vPosition);
        // World Color buffer
        worldCBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, worldCBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, sizeof['vec4'] * worldBlocks, gl.STATIC_DRAW);
        gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vColor);

        // Set the uniform scale variable
        gl.uniform1f(vScalePos, render_scale);

        gl.useProgram(program);

        vPosition = gl.getAttribLocation(program, "vPosition");
        vColor = gl.getAttribLocation(program, "vColor");
        vScalePos = gl.getUniformLocation(program, "vScale");

        // Stickman Vertex buffer
        stickVBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, stickVBuffer);
        stickBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, stickBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, sizeof['vec2'] * 7 * 2, gl.STATIC_DRAW);
        gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vPosition);
        // Stickman Color buffer
        stickCBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, stickCBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, sizeof['vec4'] * worldBlocks, gl.STATIC_DRAW);
        gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vColor);

        // Mouse Vertex buffer
        mouseVBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, mouseVBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, sizeof['vec2'] * 5 * 2, gl.STATIC_DRAW);
        gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vPosition);
        // Mouse Color buffer
        mouseCBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, mouseCBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, sizeof['vec4'] * 5 * 2, gl.STATIC_DRAW);
        gl.vertexAttribPointer(vColor, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vColor);

        // Set the uniform scale variable
        gl.uniform1f(vScalePos, render_scale);
    }
});
