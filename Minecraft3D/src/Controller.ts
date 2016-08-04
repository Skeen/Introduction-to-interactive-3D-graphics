import { Model } from "./Model";
import { Tile, TileUtil } from "./Tile"

declare var vec2: any;
declare var vec3: any;
declare var $: any;

export class Controller
{
    private model : Model;
/*
    private block_stonify() : void
    {
        var model = this.model;

        function flip_material(tile : Tile)
        {
            if(tile == Tile.FIRE)
                return Tile.WATER;
            else if (tile == Tile.WATER)
                return Tile.FIRE;
            else
                alert("Invalid usage!");
        }

        for (var x = 0; x < model.worldX; x++) 
        {
            for (var y = 0; y < model.worldY; y++) 
            {
                var tile = model.get_tile(x, y);
                // Not fire or water? - Meh
                if(!(tile == Tile.FIRE || tile == Tile.WATER))
                    continue;

                // Check adjacent blocks
                for(var i = -1; i <= 1; i++)
                {
                    for(var j = -1; j <= 1; j++)
                    {
                        if((i == j) || (model.valid_index(x+i, y+j) == false))
                            continue;

                        if(model.get_tile(x+i, y+j) == flip_material(tile))
                        {
                            model.update_tile(x+i, y+j, Tile.STONE);
                        }
                    }
                }
            }
        }
    }

    // Let blocks flow onto empty blocks
    private block_flow() : void
    {
        var model = this.model;

        // Array to buffer changes
        // (We cannot change the world while processing it)
        var changes = [];

        // Loop through the world
        for (var x = 0; x < model.worldX; x++) 
        {
            for (var y = 0; y < model.worldY; y++) 
            {
                var tile = model.get_tile(x, y);

                if(TileUtil.is_flow_block(tile) == false)
                    continue;

                if(model.valid_index(x-1, y) && model.get_tile(x-1, y) == Tile.EMPTY)
                {
                    changes.push({'x': x-1, 'y': y, 'tile': tile});
                }
                if(model.valid_index(x+1, y) && model.get_tile(x+1,y) == Tile.EMPTY)
                {
                    changes.push({'x': x+1, 'y': y, 'tile': tile});
                }
                if(model.valid_index(x, y-1) && model.get_tile(x, y-1) == Tile.EMPTY)
                {
                    changes.push({'x': x, 'y': y-1, 'tile': tile});
                }
            }
        }

        // Apply any changes required
        for(var change of changes)
        {
            model.update_tile(change.x, change.y, change.tile);
        }
    }

    // stick-man variables  
    private move_length : number = 0.5;
    private jump_height : number = 5;
    private gravity_check : number = 0.1;
*/
    private get_stickman_blocks(pos)
    {
        var model = this.model;

        // Check that x and y are valid
        if(model.valid_index(pos) == false)
        {
            return [];
        }

        var x = pos[0];
        var y = pos[1];
        var z = pos[2];

        // Collect adjacent blocks
        var blocks = [];
        for(var i = -1; i <= 1; i++)
        {
            for(var k = -1; k <= 1; k++)
            {
                // Ensure that the indicies are valid (i.e. within array bounds)
                if(model.valid_index(vec3(x+i, y, z+k)) == false)
                    continue;

                blocks.push(model.get_tile(vec3(x+i, y, z+k)));
            }
        }
        return blocks;
    }

    private get_stickman_direction(pos)
    {
        var model = this.model;

        // Check that x and y are valid
        if(model.valid_index(pos) == false)
        {
            return [];
        }

        var x = pos[0];
        var y = pos[1];
        var z = pos[2];

        // Collect adjacent blocks
        var blocks = [];
        for(var i = -1; i <= 1; i++)
        {
            for(var j = 0; j <= 1; j++)
            {
                for(var k = -1; k <= 1; k++)
                {
                    // Ensure that the indicies are valid (i.e. within array bounds)
                    if(model.valid_index(vec3(x+i, y+j, z+k)) == false)
                        continue;

                    blocks.push(model.get_tile(vec3(x+i, y+j, z+k)));
                }
            }
        }
        return blocks;
    }
/*
    private reduced_jump_height(xPos, yPos)
    {
        var model = this.model;

        var new_x = xPos;
        var new_y = yPos;

        //row 1 one above
        var col11 = model.get_tile(Math.round(new_x), Math.floor(new_y)+5);
        var col12 = model.get_tile(Math.floor(new_x)+1, Math.floor(new_y)+5);
        //row 2
        var col21 = model.get_tile(Math.round(new_x), Math.floor(new_y)+6);
        var col22 = model.get_tile(Math.floor(new_x)+1, Math.floor(new_y)+6);
        //row 3
        var col31 = model.get_tile(Math.round(new_x), Math.floor(new_y)+7);
        var col32 = model.get_tile(Math.floor(new_x)+1, Math.floor(new_y)+7);
        //row 4
        var col41 = model.get_tile(Math.round(new_x), Math.floor(new_y)+8);
        var col42 = model.get_tile(Math.floor(new_x)+1, Math.floor(new_y)+8);

        //var col51 = model.get_tile(Math.round(new_x), Math.floor(new_y)+9);
        //var col52 = model.get_tile(Math.floor(new_x)+1, Math.floor(new_y)+9);
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
            above_sink = above_sink && TileUtil.is_sink_block(blocksAbove[j]);
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
    */

    constructor(model : Model)
    {
        this.model = model;

        //setInterval(this.block_flow.bind(this), 300);
        //setInterval(this.block_stonify.bind(this), 10);

        //setInterval(this.stickman_gravity.bind(this), 10);

        var keyState = [];
        window.addEventListener('keydown',function(e)
        {
            var id = e.keyCode || e.which;
            keyState[id] = keyState[id] || {};
            keyState[id].state = true;
            keyState[id].click_time = keyState[id].click_time || 0;
        },true);    

        window.addEventListener('keyup',function(e)
        {
            var id = e.keyCode || e.which;
            keyState[id].state = false;
        },true);

        var velocity = vec3(0,0,0);

        var can_jump = function(pos)
        {
            // Get blocks below stickman
            var blocks = this.get_stickman_blocks(vec3(Math.round(pos[0]), Math.floor(pos[1]), Math.round(pos[2])));
            if(blocks.length == 0)
                return undefined;

            // Check if all blocks below us are sink blocks
            var all_sink = true;
            for(var i = 0; i < blocks.length; i++) {
                all_sink = all_sink && TileUtil.is_sink_block(blocks[i]);
            }
            return (all_sink == false);

        }.bind(this);

        var can_move = function(pos)
        {
            // Get blocks below stickman
            var blocks = this.get_stickman_direction(vec3(Math.round(pos[0]), Math.floor(pos[1]), Math.round(pos[2])));
            if(blocks.length == 0)
                return undefined;

            // Check if all blocks below us are sink blocks
            var all_sink = true;
            for(var i = 0; i < blocks.length; i++) {
                all_sink = all_sink && TileUtil.is_sink_block(blocks[i]);
            }
            return all_sink;

        }.bind(this);

        // Blocks / time-interval
        var move_force = 0.1;
        // Blocks / Jump
        var jump_force = 0.2;
        // Blocks / time-interval
        var gravity_force = 0.005;
        var friction_force = 0.005;
        // Blocks / time-interval
        var terminal_velocity = 0.1;

        setInterval(function() 
        {
            function jump()
            {
                var stick_pos = model.get_stickman_position();
                stick_pos[1] -= 0.1;
                if(can_jump(stick_pos))
                {
                    console.log("JUMP");
                    velocity[1] = jump_force;
                }
            }

            function gravity()
            {
                if(velocity[1] > -terminal_velocity)
                {
                    velocity[1] -= gravity_force;
                }
            }

            function killY()
            {
                var stick_pos = model.get_stickman_position();
                if(stick_pos[1] < 0)
                {
                    model.update_stickman_position(
                            vec3(model.worldX/3,
                                 model.worldY/3 + 10, 
                                (model.worldZ - 1)/2));
                }
            }

            function friction()
            {
                // Friction velocity X
                if(Math.abs(velocity[0]) < move_force/2)
                    velocity[0] = 0;
                if(velocity[0] > 0)
                    velocity[0] -= friction_force;
                if(velocity[0] < 0)
                    velocity[0] += friction_force;
                // Friction velocity Z
                if(Math.abs(velocity[2]) < move_force/2)
                    velocity[2] = 0;
                if(velocity[2] > 0)
                    velocity[2] -= friction_force;
                if(velocity[2] < 0)
                    velocity[2] += friction_force;
            }

            function move_straight(direction : number)
            {
                var mouse_pos = normalize(model.get_mouse_position());

                velocity[0] = mouse_pos[0] * move_force * direction;
                velocity[2] = mouse_pos[2] * move_force * direction;
            }

            function move_strafe(direction : number)
            {
                var mouse_pos = normalize(model.get_mouse_position());

                velocity[2] = mouse_pos[0] / 10 * direction;
                velocity[0] = mouse_pos[2] / 10 * direction;
            }

            function update_position()
            {
                var old_position = model.get_stickman_position();

                var new_x = old_position[0] + velocity[0];
                var new_y = old_position[1] + velocity[1];
                var new_z = old_position[2] + velocity[2];

                // If we can jump, i.e. stand on ground disable gravity
                if(can_jump(vec3(new_x, new_y-0.1, new_z)) == true)
                    new_y = old_position[1];

                if(can_move(vec3(new_x, new_y, new_z)) == false)
                {
                    console.log("NO MOVE");
                    new_x = old_position[0];
                    new_z = old_position[0];
                }
                else
                {
                    model.update_stickman_position(vec3(new_x, new_y, new_z));
                }
            }
            //------------------//
            // Apply velocities //
            //------------------//
            var cur_time = new Date().getTime();
            function is_pressed(key)
            {
                if(keyState[key] == undefined)
                    return false;
                return keyState[key].state;
            }
            function recently_pressed(key, time)
            {
                return (cur_time - keyState[key].click_time) < time;
            }
            function just_pressed(key)
            {
                keyState[key].click_time = cur_time;
            }

            // Left, A
            if (is_pressed(37) || is_pressed(65))
            {
                move_strafe.bind(this)(-1);
            }
            // Right, D
            if (is_pressed(39) || is_pressed(68))
            {
                move_strafe.bind(this)(1);
            }
            // Forward, W
            if (is_pressed(38) || is_pressed(87))
            {
                move_straight.bind(this)(1);
            }
            // Backwards, S
            if (is_pressed(40) || is_pressed(83))
            {
                move_straight.bind(this)(-1);
            }
            // Space (jump)
            if (is_pressed(32) && recently_pressed(32, 500) == false)
            {
                just_pressed(32);
                jump.bind(this)();
            }
            // Space (jump)
            if (is_pressed(77) && recently_pressed(77, 500) == false)
            {
                just_pressed(77);
                model.update_map_active(!model.is_map_active());
            }
            // Apply gravity and friction
            gravity.bind(this)();
            friction.bind(this)();

            // Update position via velocities
            update_position.bind(this)();

            // If we fall off the world
            killY.bind(this)();
        }.bind(this), 10);

        //window.addEventListener("keydown", this.stickman_move.bind(this));

        var canvas : any = document.getElementById("gl-canvas");
/*
        var place_block = function(event)
        {
            var model = this.model;

            function shockwave()
            {
                model.update_shockwave(vec2(x, y));
            }

            // Get block coordinates
            var blockX = Math.floor(x);
            var blockY = Math.floor(y);

            // Check if block is free
            var placeable = model.can_build(blockX, blockY);
            if(placeable && event.shiftKey == false)
            {
                var block_picker : any = document.getElementById('block_picker');
                var block_string = block_picker.options[block_picker.selectedIndex].value;
                var block_id = TileUtil.fromString(block_string);
            
                model.update_tile(blockX, blockY, block_id);
                shockwave();
            }
            else if(model.get_tile(blockX, blockY) != Tile.EMPTY && event.shiftKey == true)
            {
                model.update_tile(blockX, blockY, Tile.EMPTY);
                shockwave();
            }
        }.bind(this);
*/
        // Setup Printer Lock
        canvas.requestPointerLock = canvas.requestPointerLock;
        document.exitPointerLock = document.exitPointerLock;

        var capture_mouse = function()
        {
            canvas.requestPointerLock();
        };

        // When we click on the canvas, lock the mouse
        $(canvas).on("click", capture_mouse);
        // Hook pointer lock state change events for different browsers
        document.addEventListener('pointerlockchange', lockChangeAlert.bind(this), false);
        document.addEventListener('mozpointerlockchange', lockChangeAlert.bind(this), false);

        var handler = canvasLoop.bind(this);

        function lockChangeAlert() {
            if(document.pointerLockElement === canvas)
            {
                console.log('The pointer lock status is now locked');
                $(canvas).off("click", capture_mouse);
                $(document).on("mousemove", handler);
                //$(canvas).on("click", place_block);
            }
            else 
            {
                console.log('The pointer lock status is now unlocked');  
                $(canvas).on("click", capture_mouse);
                $(document).off("mousemove", handler);
                //$(canvas).off("click", place_block);
            }
        }

        var yaw = 0;
        var pitch = 0;

        var mouse_speed = 0.001;

        function canvasLoop(e) 
        {
            e = e.originalEvent;
            var movementX = e.movementX ||
                            e.mozMovementX          ||
                            0;

            var movementY = e.movementY ||
                            e.mozMovementY      ||
                            0;

            yaw += movementX * mouse_speed;
            pitch -= movementY * mouse_speed;

            var x = Math.cos(yaw) * Math.cos(pitch)
            var y = Math.sin(pitch)
            var z = Math.sin(yaw) * Math.cos(pitch)

            this.model.update_mouse_position(vec3(x, y, z));
        }
    }
};
