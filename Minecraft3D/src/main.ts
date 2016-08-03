// TODO: Send stickman as buffer, then move via uniform variable?

declare var $: any;

import { Model } from "./Model";
import { View } from "./View";
import { Controller } from "./Controller";
import { Tile, TileUtil } from "./Tile"

$(function() {
    var model = new Model();
    var controller = new Controller(model);
    var view = new View(model);
    view.run();

    var canvas = document.getElementById("gl-canvas");

    // TODO: Handle mouse stuff
    // mouse
    var mouse_points = [];
    var mouse_colors = [];
    var mouse_centers = [];
    // Shockwave variables
    var shockwave_duration = 1000;
    var timerId;

/*
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
                all_sink = all_sink && TileUtil.is_sink_block(blocks[i]);
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
            if(TileUtil.is_sink_block(block) && TileUtil.is_sink_block(block2) && TileUtil.is_sink_block(block3) && TileUtil.is_sink_block(block4))
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
*/
/*
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
    */
});
