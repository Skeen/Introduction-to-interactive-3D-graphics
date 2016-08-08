///<reference path="../typings/globals/node/index.d.ts" />
import { Model } from "./Model";
import { Tile, TileUtil } from "./Tile"

declare var normalize: any;
declare var scale: any;
declare var vec2: any;
declare var vec3: any;
declare var $: any;
declare var vec3: any;
declare var add: any;

export class Controller
{
    private model : Model;
/*
    private block_stonify() : void
    {
        var model = this.model;

        function flip_material(tile : Tile)
        {
            if(tile != undefined)
            {
                if(tile == Tile.FIRE)
                    return Tile.WATER;
                else if (tile == Tile.WATER)
                    return Tile.FIRE;
                else
                    alert("Invalid usage!");
            }
            else console.log("tile undefined in flip_material")
        }

        for (var x = 0; x < model.worldX; x++) 
        {
            for (var y = 0; y < model.worldY; y++) 
            {
                for (var z = 0; z < model.worldZ; z++)
                {
                    var tile = model.get_tile(x, y, z);
                    // Not fire or water? - Meh
                    if(!(tile == Tile.FIRE || tile == Tile.WATER))
                        continue;

                    // Check adjacent blocks
                    //console.log("check blocks")
                    for(var i = -1; i <= 1; i++)
                    {
                        for(var j = -1; j <= 1; j++)
                        {
                            for(var k = -1; k <= 1; k++)
                            {
                                if((i == j) || (model.valid_index(x+i, y+j, z+k) == false))
                                    continue;

                                if(model.get_tile(x+i, y+j, z+k) == flip_material(tile))
                                {
                                    model.update_tile(x+i, y+j, z+k, Tile.STONE);
                                }
                            }

                        }
                    }
                }

            }
        }
    }

    // Let blocks flow onto empty blocks
    private block_flow() : void
    {
        /*
        var model = this.model;

        // Array to buffer changes
        // (We cannot change the world while processing it)
        var changes = [];
        // Loop through the world
        for (var x = 0; x < model.worldX; x++) 
        {
            for (var y = 0; y < model.worldY; y++)
            {
                for (var z = 0; y < model.worldZ; z++)
                {
                    /*
                    var tile = model.get_tile(x, y, z);

                    if(TileUtil.is_flow_block(tile) == false)
                        continue;
                        */
                    //x-1
                    /*
                    if(model.valid_index(x-1, y,z) && model.get_tile(x-1, y, z) == Tile.EMPTY)
                    {
                        changes.push({'x': x-1, 'y': y, 'z': z, 'tile': tile});
                    }
                    //x+1
                    if(model.valid_index(x+1, y,z) && model.get_tile(x+1,y,z) == Tile.EMPTY)
                    {
                        changes.push({'x': x+1, 'y': y, 'z': z, 'tile': tile});
                    }
                    //y-1
                    if(model.valid_index(x, y-1, z) && model.get_tile(x, y-1, z) == Tile.EMPTY)
                    {
                        changes.push({'x': x, 'y': y-1, 'z': z, 'tile': tile});
                    }
                    */
                    /*
                    if(model.valid_index(x, y,z-1) && model.get_tile(x+1,y,z-1) == Tile.EMPTY)
                    {
                        changes.push({'x': x, 'y': y, 'z': z-1, 'tile': tile});
                    }
                    if(model.valid_index(x, y-1, z) && model.get_tile(x, y-1, z) == Tile.EMPTY)
                    {
                        changes.push({'x': x, 'y': y-1, 'z': z, 'tile': tile});
                    }

                }

            }

        }
        // Apply any changes required
        for(var change of changes)
        {
            model.update_tile(change.x, change.y, change.z, change.tile);
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
        var new_z = zPos;

        //row 1 one above
        var col11 = model.get_tile(Math.round(new_x), Math.floor(new_y)+5, Math.floor(new_z));
        var col12 = model.get_tile(Math.floor(new_x)+1, Math.floor(new_y)+5, Math.floor(new_z));
        //row 2
        var col21 = model.get_tile(Math.round(new_x), Math.floor(new_y)+6, Math.floor(new_z));
        var col22 = model.get_tile(Math.floor(new_x)+1, Math.floor(new_y)+6, Math.floor(new_z));
        //row 3
        var col31 = model.get_tile(Math.round(new_x), Math.floor(new_y)+7, Math.floor(new_z));
        var col32 = model.get_tile(Math.floor(new_x)+1, Math.floor(new_y)+7, Math.floor(new_z));
        //row 4
        var col41 = model.get_tile(Math.round(new_x), Math.floor(new_y)+8, Math.floor(new_z));
        var col42 = model.get_tile(Math.floor(new_x)+1, Math.floor(new_y)+8, Math.floor(new_z));

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

    private flyMode:boolean = false;

    constructor(model : Model)
    {
        this.model = model;
        var self:any = this;

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
            keyState[id] = keyState[id] || {};
            keyState[id].state = false;

            if (e.keyCode === 48)
                self.flyMode = !self.flyMode;
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
            return true;
            /*
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
            */

        }.bind(this);

        // Blocks / time-interval
        var move_force = 0.1;
        // Blocks / Jump
        var jump_force = 0.2;
        // Blocks / time-interval
        var gravity_force = 0.005;
        var friction_force = 0.5;
        // Blocks / time-interval
        var terminal_velocity = 0.1;

        setInterval(function()
        {
            function jump()
            {
                var stick_pos = model.get_stickman_position();
                if(can_jump(vec3(stick_pos[0], stick_pos[1] - 0.1, stick_pos[2])))
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
                var old_y = velocity[1];
                velocity = scale(friction_force, velocity);
                velocity[1] = old_y;
            }

            function move_straight(direction : number)
            {
                var mouse_pos = model.get_mouse_position();

                velocity[0] = mouse_pos[0] * move_force * direction;
                velocity[2] = mouse_pos[2] * move_force * direction;

                //console.log(velocity);
            }

            function move_strafe(direction : number)
            {
                var mouse_pos = normalize(model.get_mouse_position());

                velocity[0] = -mouse_pos[2] / 10 * direction;
                velocity[2] = mouse_pos[0] / 10 * direction;
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

        var place_block = function(event)
        {
            var model = this.model;
/*
            function shockwave()
            {
                model.update_shockwave(vec3(x, y,z));
            }

            // Get block coordinates
            var blockX = Math.floor(x);
            var blockY = Math.floor(y);
            var blockZ = Math.floor(z);
*/
            var stick_pos = model.get_stickman_position().map(Math.round);
            var mouse_pos = model.get_mouse_position();
            var block_pos = add(stick_pos, mouse_pos).map(Math.round);

            if(model.valid_index(block_pos) == false)
                return;

            // Check if block is free
            var placeable = model.can_build(block_pos);
            if(placeable && event.shiftKey == false)
            {
                /*
                var block_picker : any = document.getElementById('block_picker');
                var block_string = block_picker.options[block_picker.selectedIndex].value;
                var block_id = TileUtil.fromString(block_string);
                */
                var tile_id = Tile.STONE;

                model.update_destroyed(block_pos, 0);
                model.update_tile(block_pos, tile_id);
                //shockwave();
            }
            else if(TileUtil.is_destroyable(model.get_tile(block_pos)) && event.shiftKey == true)
            {
                model.update_destroyed(block_pos, 10);
                //model.update_tile(block_pos, Tile.EMPTY);
                //shockwave();
            }
            else
            {
                var current_destroyed = model.get_destroyed(block_pos);
                if(current_destroyed != 10)
                    model.update_destroyed(block_pos, current_destroyed + 1);
            }
        }.bind(this);

        this.model.on("stickman_move", function(stickman_pos)
        {
            var block_pos = stickman_pos.map(Math.round);

            if(model.valid_index(block_pos) == false)
                return;

            if(this.model.get_destroyed(block_pos) == 10)
            {
                console.log("Picked up block!");
                this.model.update_destroyed(block_pos, 0);
                this.model.update_tile(block_pos, Tile.EMPTY);
            }
        }.bind(this));

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
                $(canvas).on("click", place_block);
            }
            else
            {
                console.log('The pointer lock status is now unlocked');
                $(canvas).on("click", capture_mouse);
                $(document).off("mousemove", handler);
                $(canvas).off("click", place_block);
            }
        }

        var yaw = 0;
        var pitch = 0;
        var mouse_speed = 0.001;

        function canvasLoop(e) 
        {
            e = e.originalEvent;
            // Get relative mouse movements
            var movementX = e.movementX || 0;
            var movementY = e.movementY || 0;
            // Append to our movement variables
            yaw += movementX * mouse_speed;
            pitch -= movementY * mouse_speed;

            // Clamp us from looking directly up
            if(pitch > Math.PI / 2 * 0.9)
                pitch = Math.PI / 2 * 0.9;
            // Clamp us from looking directly down
            if(pitch < -Math.PI / 2 * 0.9)
                pitch = -Math.PI / 2 * 0.9;

            // Normalize our yaw
            if(yaw > Math.PI * 2)
                yaw -= Math.PI * 2;
            if(yaw < -Math.PI * 2)
                yaw += Math.PI * 2;

            // Calculate view vector [-1,1] on all axis
            var x = Math.cos(yaw) * Math.cos(pitch)
            var y = Math.sin(pitch)
            var z = Math.sin(yaw) * Math.cos(pitch)

            // Let everyone know
            this.model.update_mouse_position(vec3(x, y, z));

            //console.log(vec3(x,y,z));
        }
    }
};
