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
