// TODO: Send stickman as buffer, then move via uniform variable?

declare var vec2: any;
declare var vec3: any;
declare var vec4: any;

declare var flatten: any;

declare var sizeof: any;

declare var initShaders: any;
declare var $: any;

declare var WebGLUtils: any;

import { Model } from "./Model";
import { Tile, TileUtil } from "./Tile"

/**
 * Created by dkchokk on 27-07-2016.
 */
$(function() {
    var model = new Model();

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
    var worldCenterBuffer;
    // Stick figure
    var stickVBuffer;
    var stickCBuffer;
    // Mouse
    var mouseVBuffer;
    var mouseCBuffer;
    var mouseCenterBuffer;

    // Game related stuff.
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
    var render_scale = 2 / Math.max(model.worldX, model.worldY);

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

        /*
    model.worldGrid[1][0] = Tile.STONE;
    model.worldGrid[0][0] = Tile.STONE;
    console.log(model.can_build(0,0));
*/

    function tile_to_color(tile : Tile)
    {
        switch(tile)
        {
            case Tile.EMPTY:
                return vec4(0., 0., 1., 0.);
            case Tile.STONE:
                return vec4(0.2, 0.2, 0.2, 1.);
            case Tile.GRASS:
                return vec4(0., 1., 0., 1.);
            case Tile.DIRT:
                return vec4(0.55, 0.27, 0.07, 1.);
            case Tile.WOOD:
                return vec4(0.87, 0.72, 0.53, 1.);
            case Tile.METAL:
                return vec4(0.82, 0.82, 0.82, 1.);
            case Tile.WATER:
                return vec4(0., 0., 1., 1.);
            case Tile.FIRE:
                return vec4(1., 0., 0., 1.);
            default:
                alert("Invalid tile, cannot convert to color!");
        }
    }

    function index_to_position(x, y)
    {
        return vec2(x + 0.5, y + 0.5);
    }

    model.on("update_tile", function(x, y, tile)
    {
        var tile_color = tile_to_color(tile);

        // Get the start offset into world_colors
        var offset = 4 * (y + (x * model.worldX));

        rebufferColor(offset, offset+4, tile_color);
    });

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
        for (var x = 0; x < model.worldGrid.length; x++)
        {
            for (var y = 0; y < model.worldGrid[x].length; y++)
            {
                var point = model.worldGrid[x][y];
                var tile_color = tile_to_color(point);

                var pos = index_to_position(x, y);

                    world_points.push(vec2(pos[0] - 0.5, pos[1] - 0.5));
                    world_points.push(vec2(pos[0] - 0.5, pos[1] + 0.5));
                    world_points.push(vec2(pos[0] + 0.5, pos[1] + 0.5));
                    world_points.push(vec2(pos[0] + 0.5, pos[1] - 0.5));

                    for(var i = 0; i < 4; i++)
                    {
                        world_colors.push(tile_color);
                        world_centers.push(vec2(pos[0], pos[1]));
                    }
            }
        }

        // Buffer Color
        gl.bindBuffer(gl.ARRAY_BUFFER, worldCBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(world_colors), gl.STATIC_DRAW);
        // Buffer Verticies
        gl.bindBuffer(gl.ARRAY_BUFFER, worldVBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(world_points), gl.STATIC_DRAW);
        // Buffer Centers
        gl.bindBuffer(gl.ARRAY_BUFFER, worldCenterBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(world_centers), gl.STATIC_DRAW);
    }

    initialize_block_world();

    function initialize_stick_man()
    {
        var stick_points = [];
        var stick_colors = [];
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

        // We need to know number of points in render
        stick_man_num_points = stick_points.length;
        for(var i = 0; i < stick_man_num_points; i++)
        {
            // Add color
            stick_colors.push(vec4(0., 0., 0., 1.));
        }

        // Buffer Color
        gl.bindBuffer(gl.ARRAY_BUFFER, stickCBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(stick_colors), gl.STATIC_DRAW);
        // Buffer Verticies
        gl.bindBuffer(gl.ARRAY_BUFFER, stickVBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(stick_points), gl.STATIC_DRAW);
    }

    function update_stick_man(x, y)
    {
        // Set the stickman position variable
        stick_man_pos = vec2(x,y);
        gl.useProgram(program);
        gl.uniform2fv(vStickPos, stick_man_pos);
    }

    initialize_stick_man();
    update_stick_man(0.5 + Math.floor(model.worldY/3), Math.floor(model.worldY/3)+10);

    function block_by_pos(x, y)
    {
        /*
        if(isInt(x) == false || isInt(y) == false)
        {
            alert("block_by_pos called with non-integer arguments!");
        }
        */

        return model.worldGrid[x][y];
    }

    function is_sink_block(block)
    {
        return block == Tile.EMPTY || block == Tile.WATER;
    }

    function is_jump_block(block)
    {
        return block == Tile.FIRE;
    }

    function is_flow_block(block)
    {
        return block == Tile.FIRE || block == Tile.WATER;
    }

    // Let blocks flow onto empty blocks
    setInterval(function block_flow()
    {
        var old_world = JSON.parse(JSON.stringify(model.worldGrid));
        for (var x = 0; x < model.worldX; x++) {
            for (var y = 0; y < model.worldY; y++) {
                var point = old_world[x][y];
                if(is_flow_block(point))
                {
                    if(model.valid_index(x-1, y) && old_world[x-1][y] == Tile.EMPTY)
                    {
                        model.update_tile(x-1, y, point);
                    }
                    if(model.valid_index(x+1, y) && old_world[x+1][y] == Tile.EMPTY)
                    {
                        model.update_tile(x+1, y, point);
                    }
                    if(model.valid_index(x, y-1) && old_world[x][y-1] == Tile.EMPTY)
                    {
                        model.update_tile(x, y-1, point);
                    }
                }
            }
        }
        //render();
    }, 300);

    setInterval(function stonify()
    {
        function flip_material(block)
        {
            if(block == Tile.FIRE)
                return Tile.WATER;
            else if (block == Tile.WATER)
                return Tile.FIRE;
            else
                alert("Invalid usage!");
        }

        for (var x = 0; x < model.worldX; x++) {
            for (var y = 0; y < model.worldY; y++) {
                var point = model.worldGrid[x][y];
                if(point == Tile.FIRE || point == Tile.WATER)
                {
                    for(var i = -1; i <= 1; i++)
                    {
                        for(var j = -1; j <= 1; j++)
                        {
                            if(i == j) continue;

                            if(model.valid_index(x+i, y+j) && model.worldGrid[x+i][y+j] == flip_material(point))
                            {
                                model.update_tile(x+i, y+j, Tile.STONE);
                            }
                        }
                    }
                }
            }
        }
        //render();
    }, 10);

    function get_stickman_blocks(x, y)
    {
        if( model.valid_index(Math.floor(x), Math.floor(y)) == false &&
            model.valid_index(Math.ceil(x), Math.floor(y)) == false &&
            model.valid_index(1 + Math.floor(x), Math.floor(y)) == false &&
            model.valid_index(1 + Math.ceil(x), Math.floor(y)) == false)
            return;

        // Get all the blocks under the stickman
        // Only ever 3 unique points
        var block_left = block_by_pos(Math.floor(x), Math.floor(y));
        var block_center_left = block_by_pos(Math.ceil(x), Math.floor(y));
        //var block_center_right = block_by_pos(1 + Math.floor(x), Math.floor(y));
        var block_right = block_by_pos(1 + Math.ceil(x), Math.floor(y));

        return [block_left, block_center_left, /*block_center_right,*/ block_right];
    }

    function reduced_jump_height(xPos, yPos)
    {
        var new_x = xPos;
        var new_y = yPos;

        //row 1 one above
        var col11 = block_by_pos(Math.round(new_x), Math.floor(new_y)+5);
        var col12 = block_by_pos(Math.floor(new_x)+1, Math.floor(new_y)+5);
        //row 2
        var col21 = block_by_pos(Math.round(new_x), Math.floor(new_y)+6);
        var col22 = block_by_pos(Math.floor(new_x)+1, Math.floor(new_y)+6);
        //row 3
        var col31 = block_by_pos(Math.round(new_x), Math.floor(new_y)+7);
        var col32 = block_by_pos(Math.floor(new_x)+1, Math.floor(new_y)+7);
        //row 4
        var col41 = block_by_pos(Math.round(new_x), Math.floor(new_y)+8);
        var col42 = block_by_pos(Math.floor(new_x)+1, Math.floor(new_y)+8);

        //var col51 = block_by_pos(Math.round(new_x), Math.floor(new_y)+9);
        //var col52 = block_by_pos(Math.floor(new_x)+1, Math.floor(new_y)+9);
        var blocksAbove = [];
        //row 1
        blocksAbove.push(col11);
        blocksAbove.push(col12);
        //row 2
        blocksAbove.push(col21);
        blocksAbove.push(col22);
        //row 3
        blocksAbove.push(col31);
        blocksAbove.push(col32);
        //row 4
        blocksAbove.push(col41);
        blocksAbove.push(col42);
        var reducedJumpHeight = 0;
        var above_sink = true;
        for(var j=0; j < blocksAbove.length; j++){
            above_sink = above_sink && is_sink_block(blocksAbove[j]);
            if(j<2 && !above_sink){
                reducedJumpHeight = 5;
                break;
            }
            else if(j<4 && !above_sink){
                reducedJumpHeight = 4;
                break;
            }
            else if(j<6 && !above_sink){
                reducedJumpHeight = 3;
                break;
            }
            else if(j<8 && !above_sink){
                reducedJumpHeight = 2;
                break;
            }
        }
        return reducedJumpHeight;
    }

    // Apply gravity to stick-man
    setInterval(function gravity()
    {
        var new_x = stick_man_pos[0];
        var new_y = stick_man_pos[1] - gravity_check;

        // Get blocks below stickman
        var blocks = get_stickman_blocks(new_x, new_y);

        // Check if all blocks below us are sink blocks
        var all_sink = true;
        //TODO can't jump if blocks are undefined
        if(blocks != undefined)
        {
            for(var x = 0; x < blocks.length; x++)
            {
                all_sink = all_sink && is_sink_block(blocks[x]);
            }
            if(all_sink)
            {
                update_stick_man(new_x, new_y);
                //render();
            }

            // Check if any blocks below us are fire blocks
            var any_fire = false;
            for(var x = 0; x < blocks.length; x++)
            {
                any_fire = any_fire || is_jump_block(blocks[x]);
            }
            if(any_fire)
            {
                new_y = stick_man_pos[1] + (jump_height-reduced_jump_height(new_x, new_y));
                update_stick_man(new_x, new_y);
                //render();
            }
        }

    }, 10);

    window.addEventListener("keydown", function (e) {
        var key = String.fromCharCode(e.keyCode);

        var x = stick_man_pos[0];
        var y = stick_man_pos[1];

        function jump()
        {
            var new_x = x;
            var new_y = y - gravity_check;

            // Get blocks below stickman
            var blocks = get_stickman_blocks(new_x, new_y);
            if(blocks == undefined)
                return;

            // Check if all blocks below us are sink blocks
            var all_sink = true;
            for(var i = 0; i < blocks.length; i++) {
                all_sink = all_sink && is_sink_block(blocks[i]);
            }

            if(all_sink == false) // We can jump off something and nothing is above us
            {
                new_y = stick_man_pos[1] + (jump_height-reduced_jump_height(new_x,new_y));
                update_stick_man(new_x, new_y);
                //render();
            }
        }

        function move(new_x, new_y, rounder)
        {
            if(model.valid_index(rounder(new_x), Math.floor(new_y)) == false)
                return;

            // Check that we can stand in the new position
            var block = block_by_pos(rounder(new_x), Math.floor(new_y));
            var block2 = block_by_pos(rounder(new_x), Math.floor(new_y)+1);
            var block3 = block_by_pos(rounder(new_x), Math.floor(new_y)+2);
            var block4 = block_by_pos(rounder(new_x), Math.floor(new_y)+3);
            if(is_sink_block(block) && is_sink_block(block2) && is_sink_block(block3) && is_sink_block(block4))
            {
                update_stick_man(new_x, new_y);
                //render();
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

    canvas.addEventListener("mousedown", function (event)
    {
        function shockwave()
        {
            var startTime = new Date().getTime();

            function doClickExplosion()
            {
                var delta = new Date().getTime() - startTime;
                if (delta > shockwave_duration)
                {
                    delta = 0;
                    clearInterval(timerId);
                }
                gl.useProgram(boxShaderProgram);
                gl.uniform1f(vTime, delta);
            }

            gl.useProgram(boxShaderProgram);
            var mouseClickPos = mousePoint;
            gl.uniform2fv(vClickPos, mouseClickPos);

            if (timerId)
                clearInterval(timerId);

            timerId = setInterval(doClickExplosion, 1);
        }

        var mousePoint = vec2((((-1 + 2 * event.clientX / canvas.width)+1)/2)*model.worldX,
                (((-1 + 2 * ( canvas.height - event.clientY ) / canvas.height)+1)/2)*model.worldY);
        //console.log(mousePoint);
        // Get closest block position for rendering
        mousePoint = vec2(Math.round(mousePoint[0]) - 0.5, Math.round(mousePoint[1]) + 0.5);
        // Get block coordinates
        var blockX = Math.floor(mousePoint[0]);
        var blockY = Math.floor(mousePoint[1]);
        // Check if block is free
        var placeable = model.can_build(blockX, blockY);
        if(placeable && event.shiftKey == false)
        {
            var block_picker : any = document.getElementById('block_picker');
            var block_string = block_picker.options[block_picker.selectedIndex].value;
            var block_id = TileUtil.fromString(block_string);
            //console.log(block_string);
            //console.log(block_id);

            model.update_tile(blockX, blockY, block_id);
            shockwave();
            //render();
        }
        else if(model.worldGrid[blockX][blockY] != Tile.EMPTY && event.shiftKey == true)
        {
            model.update_tile(blockX, blockY, Tile.EMPTY);
            shockwave();
            //render();
        }
    });


    //MouseListener with a point that follows the mouse
    canvas.addEventListener("mousemove", function (event)
    {
        var mousePoint = vec2((((-1 + 2 * event.clientX / canvas.width)+1)/2)*model.worldX,
                (((-1 + 2 * ( canvas.height - event.clientY ) / canvas.height)+1)/2)*model.worldY);
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

        var placeable = model.can_build(Math.floor(mousePoint[0]), Math.floor(mousePoint[1]));

        var color = (placeable ? vec4(0., 0., 0., 1.) : vec4(1., 0., 0., 1.));

        mouse_colors = [];
        mouse_centers = [];
        for(var i = 0; i < mouse_points.length; i++)
        {
            mouse_colors.push(color);
            mouse_centers.push(vec2(mousePoint[0], mousePoint[1]));
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, mouseCBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(mouse_colors), gl.STATIC_DRAW);
         
        gl.bindBuffer(gl.ARRAY_BUFFER, mouseVBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(mouse_points), gl.STATIC_DRAW);
         
        gl.bindBuffer(gl.ARRAY_BUFFER, mouseCenterBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(mouse_centers), gl.STATIC_DRAW);
         
        //render();
    });

    function render()
    {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // ---------------/
        // Draw STICKMAN -/
        // ---------------/
        gl.useProgram(program);
        // Draw the stick figure
        gl.bindBuffer(gl.ARRAY_BUFFER, stickCBuffer);
        gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, stickVBuffer);
        gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);

        gl.drawArrays(gl.LINES, 0, stick_man_num_points);

        // -----------//
        // Draw BOXES //
        // -----------//
        gl.useProgram(boxShaderProgram);
        //gl.uniform1f(vTime, 0);

        // Draw the mouse block outline
        if(mouse_points.length != 0)
        {
            gl.bindBuffer(gl.ARRAY_BUFFER, mouseCBuffer);
            gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);

            gl.bindBuffer(gl.ARRAY_BUFFER, mouseVBuffer);
            gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);

            gl.bindBuffer(gl.ARRAY_BUFFER, mouseCenterBuffer);
            gl.vertexAttribPointer(vCenterPos, 2, gl.FLOAT, false, 0, 0);

            gl.drawArrays(gl.LINES, 0, mouse_points.length);
        }

        // Draw the world
        gl.bindBuffer(gl.ARRAY_BUFFER, worldCBuffer);
        gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, worldVBuffer);
        gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, worldCenterBuffer);
        gl.vertexAttribPointer(vCenterPos, 2, gl.FLOAT, false, 0, 0);

        for (var i = 0; i < model.worldSize; i+=1)
        {
            gl.drawArrays(gl.TRIANGLE_FAN, verts_per_block*i, verts_per_block);
        }


        (<any>window).requestAnimFrame(render, canvas);
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

        program = initShaders(gl, "vertex-shader.glsl", "fragment-shader.glsl");
        boxShaderProgram = initShaders(gl, "block-vertex-shader.glsl", "block-fragment-shader.glsl");
    }

    // Initialize buffers.
    function initBuffers()
    {
        gl.useProgram(boxShaderProgram);

        // Get Shader variable positions
        vPosition = gl.getAttribLocation(boxShaderProgram, "vPosition");
        vColor = gl.getAttribLocation(boxShaderProgram, "vColor");
        vScalePos = gl.getUniformLocation(boxShaderProgram, "vScale");
        vCenterPos = gl.getAttribLocation(boxShaderProgram, 'vCenterPos');
        vClickPos = gl.getUniformLocation(boxShaderProgram, 'vClickPos');
        vTime = gl.getUniformLocation(boxShaderProgram, 'vTime');

        // World Vertex buffer
        worldVBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, worldVBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, sizeof['vec2'] * model.worldSize * 4, gl.STATIC_DRAW);
        gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vPosition);
        // World Color buffer
        worldCBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, worldCBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, sizeof['vec4'] * model.worldSize * 4, gl.STATIC_DRAW);
        gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vColor);
        // World Center buffer
        worldCenterBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, worldCenterBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, sizeof['vec2'] * model.worldSize * 4, gl.STATIC_DRAW);
        gl.vertexAttribPointer(vCenterPos, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vCenterPos);

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
        gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vColor);
        // World Center buffer
        mouseCenterBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, mouseCenterBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, sizeof['vec2'] * 5 * 4, gl.STATIC_DRAW);
        gl.vertexAttribPointer(vCenterPos, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vCenterPos);

        // Set the uniform scale variable
        gl.uniform1f(vScalePos, render_scale);

        gl.useProgram(program);

        vPosition = gl.getAttribLocation(program, "vPosition");
        vColor = gl.getAttribLocation(program, "vColor");
        vScalePos = gl.getUniformLocation(program, "vScale");
        vStickPos = gl.getUniformLocation(program, "vStickPos");

        // Stickman Vertex buffer
        stickVBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, stickVBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, sizeof['vec2'] * 7 * 2, gl.STATIC_DRAW);
        gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vPosition);
        // Stickman Color buffer
        stickCBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, stickCBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, sizeof['vec4'] * model.worldSize, gl.STATIC_DRAW);
        gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vColor);

        // Set the uniform scale variable
        gl.uniform1f(vScalePos, render_scale);
    }
});
