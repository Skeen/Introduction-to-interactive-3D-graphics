///<reference path="../typings/globals/node/index.d.ts" />
import { Model } from "./Model";
import { Tile, TileUtil } from "./Tile"
import Timer = NodeJS.Timer;

declare var normalize: any;
declare var scale: any;
declare var vec2: any;
declare var vec3: any;
declare var $: any;
declare var vec3: any;
declare var add: any;
declare var subtract: any;

export class Controller
{
    private model : Model;
    private canvas:any;

    // Control vars.
    private noClip:boolean = false;
    private keyController:KeyboardController;
    private pointerLock:boolean = false;

    // Update vars.
    private previousTime:number;
    private deltaMs:number;
    private deltaS:number;
    private updateTimer:number;

    // Player vars.
    private movementSpeed:number = 10.;
    private jumpHeight:number = .1;

    private update():void {
        this.deltas();
        this.physics();
        this.logic();
    }

    private deltas():void {
        var currentTime = new Date().getTime();
        this.deltaMs = currentTime - this.previousTime;
        this.deltaS = this.deltaMs / 1000;
        this.previousTime = currentTime;
    }

    // Physics vars.
    private gravity:any = vec3(0, 0, 0);
    private acceleration:any = vec3(0, .1, 0);
    private terminalVelocity:number = 10;
    private jumpAcceleration:number = .5;
    private isJumping:boolean = false;
    private canJump:boolean = false;
    private jumpStartHeight:any;

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
                for (var z = 0; z < model.worldZ; z++)
                {
                    var tile = model.get_tile(vec3(x, y, z));

                    if(TileUtil.is_flow_block(tile) == false)
                        continue;
                    //x-1
                    if(model.valid_index(vec3(x-1, y, z)) && model.get_tile(vec3(x-1, y, z)) == Tile.EMPTY)
                    {
                        changes.push({'x': x-1, 'y': y, 'z': z, 'tile': tile});
                    }
                    //x+1
                    if(model.valid_index(vec3(x+1, y, z)) && model.get_tile(vec3(x+1, y, z)) == Tile.EMPTY)
                    {
                        changes.push({'x': x+1, 'y': y, 'z': z, 'tile': tile});
                    }
                    //y-1
                    if(model.valid_index(vec3(x, y-1, z)) && model.get_tile(vec3(x, y-1, z)) == Tile.EMPTY)
                    {
                        changes.push({'x': x, 'y': y-1, 'z': z, 'tile': tile});
                    }
                    //z-1
                    if(model.valid_index(vec3(x, y, z-1)) && model.get_tile(vec3(x, y, z-1)) == Tile.EMPTY)
                    {
                        changes.push({'x': x, 'y': y, 'z': z-1, 'tile': tile});
                    }
                    //z+1
                    if(model.valid_index(vec3(x, y, z+1)) && model.get_tile(vec3(x, y, z+1)) == Tile.EMPTY)
                    {
                        changes.push({'x': x, 'y': y, 'z': z+1, 'tile': tile});
                    }
                }
            }
        }
        // Apply any changes required
        for(var change of changes)
        {
            model.update_tile(vec3(change.x, change.y, change.z), change.tile);
        }
    }

    private physics():void {
        var deltaTime = this.deltaS;
        if (this.noClip) {
            return;
        }
        var currentPos = this.model.get_stickman_position();
        if (this.isJumping) {
            var currentHeight = currentPos[1];
            if (currentHeight >= this.jumpStartHeight + this.jumpHeight) {
                this.isJumping = false;
            }
            else {
                if (this.gravity[1] == 0)
                    this.gravity[1] = -0.03;
                var velocity = this.jumpAcceleration * deltaTime;
                this.gravity[1] -= velocity;
            }
        } else if (!this.physics_isGrounded(currentPos)) {
            if (this.gravity[1] == 0)
                this.gravity[1] = 0.03;
            var velocity = this.acceleration[1] * deltaTime;
            if (this.gravity[1] + velocity > this.terminalVelocity)
                this.gravity[1] = this.terminalVelocity;
            else
                this.gravity[1] += velocity;
        }
        else
        {
            this.canJump = true;
            this.gravity[1] = 0;
        }
        var newPos = vec3(currentPos[0], currentPos[1] - this.gravity[1], currentPos[2]);
        this.model.update_stickman_position(newPos);
    }

    private physics_isGrounded(position:any):boolean {
        var blocksBelow = this.get_stickman_blocks(vec3(Math.round(position[0]), Math.floor(position[1]), Math.round(position[2])));
        for (var i = 0; i < blocksBelow.length; i++) {
            if (!TileUtil.is_sink_block(blocksBelow[i]))
                return true;
        }
        return false;
    }

    private logic():void {
        var deltaTime = this.deltaS;
        var velocity = vec3(0, 0, 0);
        var mousePos = normalize(this.model.get_mouse_position());
        var old_position = this.model.get_stickman_position();

        if (this.keyController.forward()) {
            velocity[0] += mousePos[0] * this.movementSpeed;
            velocity[2] += mousePos[2] * this.movementSpeed;
            if (this.noClip)
                velocity[1] += mousePos[1] * this.movementSpeed;
        }
        if (this.keyController.backward()) {
            velocity[0] += mousePos[0] * -this.movementSpeed;
            velocity[2] += mousePos[2] * -this.movementSpeed;
            if (this.noClip)
                velocity[1] += mousePos[1] * -this.movementSpeed;
        }
        if (this.keyController.left()) {
            velocity[0] += -mousePos[2] * -this.movementSpeed;
            velocity[2] += mousePos[0] * -this.movementSpeed;
        }
        if (this.keyController.right()) {
            velocity[0] += -mousePos[2] * this.movementSpeed;
            velocity[2] += mousePos[0] * this.movementSpeed;
        }
        if (this.keyController.jump()) {
            if (this.noClip)
                velocity[1] += this.movementSpeed;
            else {
                if (this.canJump) {
                    this.canJump = false;
                    this.isJumping = true;
                    this.jumpStartHeight = old_position[1];
                }
            }
        }
        if (this.keyController.crouch()) {
            if (this.noClip)
                velocity[1] -= this.movementSpeed;
        }
        var new_x = old_position[0] + velocity[0] * deltaTime;
        var new_y = old_position[1] + velocity[1] * deltaTime;
        var new_z = old_position[2] + velocity[2] * deltaTime;
        this.model.update_stickman_position(vec3(new_x, new_y, new_z));
    }

    private setKeyListeners():void {
        var self = this;
        $(window).on('keydown', function(e){
            if (!self.pointerLock)
                return;
            var key = String.fromCharCode(e.which).toLowerCase();
            if (key === ' ' || e.ctrlKey || e.metaKey || e.key.toLowerCase() === 'control')
                key = String(e.which).toLowerCase();
            self.keyController.setActive(key);
        });

        $(window).on('keyup', function(e){
            if (!self.pointerLock)
                return;
            var key = String.fromCharCode(e.which).toLowerCase();
            if (key === ' ' || e.ctrlKey || e.metaKey || e.key.toLowerCase() === 'control')
                key = String(e.which).toLowerCase();
            self.keyController.setInactive(key);
        });
    }

    private setMouseListeners():void {
        $(this.canvas).on('click', this.captureListener.bind(this));
        $(this.canvas).on('mousemove', this.mouseMoveListener.bind(this));
        $(document).on('pointerlockchange mozpointerlockchange', this.pointerLockListener.bind(this));

        $('#noclip').click(function(e) {
            this.noClip = $('#noclip').prop('checked');
        }.bind(this));
    }

    private pointerLockListener(e) {
        this.pointerLock = !this.pointerLock;
    }

    private yaw = 0;
    private pitch = 0;
    private mouse_speed = 0.001;

    private mouseMoveListener(e):void {

        if (!this.pointerLock)
            return;
        e = e.originalEvent;

        // Get relative mouse movements
        var movementX = e.movementX || 0;
        var movementY = e.movementY || 0;
        // Append to our movement variables
        this.yaw += movementX * this.mouse_speed;
        this.pitch -= movementY * this.mouse_speed;

        // Clamp us from looking directly up
        if(this.pitch > Math.PI / 2 * 0.9)
            this.pitch = Math.PI / 2 * 0.9;
        // Clamp us from looking directly down
        if(this.pitch < -Math.PI / 2 * 0.9)
            this.pitch = -Math.PI / 2 * 0.9;

        // Normalize our yaw
        if(this.yaw > Math.PI * 2)
            this.yaw -= Math.PI * 2;
        if(this.yaw < -Math.PI * 2)
            this.yaw += Math.PI * 2;

        // Calculate view vector [-1,1] on all axis
        var x = Math.cos(this.yaw) * Math.cos(this.pitch);
        var y = Math.sin(this.pitch);
        var z = Math.sin(this.yaw) * Math.cos(this.pitch);

        // Let everyone know
        this.model.update_mouse_position(vec3(x, y, z));
    }

    private captureListener(e):void {
        if (document.pointerLockElement != this.canvas) {
            this.canvas.requestPointerLock();
        }
        var model = this.model;
        var stick_pos = model.get_stickman_position().map(Math.round);
        var mouse_pos = model.get_mouse_position();
        var block_pos = add(stick_pos, mouse_pos).map(Math.round);

        if(model.valid_index(block_pos) == false)
            return;

        // Check if block is free
        var placeable = model.can_build(block_pos);
        if(placeable && e.shiftKey == false)
        {

            var block_picker : any = document.getElementById('block_picker');
            var block_string = block_picker.options[block_picker.selectedIndex].value;
            var tile_id = TileUtil.fromString(block_string);

            model.update_destroyed(block_pos, 0);
            model.update_tile(block_pos, tile_id);
        }
        else if(TileUtil.is_destroyable(model.get_tile(block_pos)) && e.shiftKey == true)
        {
            model.update_destroyed(block_pos, 10);
        }
         else
         {
             var current_destroyed = model.get_destroyed(block_pos);
             if(current_destroyed != 10)
                model.update_destroyed(block_pos, current_destroyed + 1);
         }
        if(this.model.get_destroyed(block_pos) == 10)
        {
            console.log("Picked up block!");
            this.model.update_destroyed(block_pos, 0);
            this.model.update_tile(block_pos, Tile.EMPTY);
        }
    }

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

    constructor(model : Model)
    {
        this.model = model;
        this.keyController = new KeyboardController();

        this.canvas = document.getElementById('gl-canvas');
        if (!this.canvas) {
            alert('Need canvas id in controller');
            return;
        }

        // Configure controls.
        this.setKeyListeners();
        this.setMouseListeners();

        // Configure update loop.
        this.previousTime = new Date().getTime();
        this.updateTimer = setInterval(this.update.bind(this), 0);


        //
        //
        //
        //
        //
        // var keyState = [];
        // window.addEventListener('keydown',function(e)
        // {
        //     var id = e.keyCode || e.which;
        //     keyState[id] = keyState[id] || {};
        //     keyState[id].state = true;
        //     keyState[id].click_time = keyState[id].click_time || 0;
        // },true);
        //
        // window.addEventListener('keyup',function(e)
        // {
        //     var id = e.keyCode || e.which;
        //     keyState[id] = keyState[id] || {};
        //     keyState[id].state = false;
        // },true);
        //
        // var velocity = vec3(0,0,0);
        //
        // var can_jump = function(pos)
        // {
        //     // Get blocks below stickman
        //     var blocks = this.get_stickman_blocks(vec3(Math.round(pos[0]), Math.floor(pos[1]), Math.round(pos[2])));
        //     if(blocks.length == 0)
        //         return undefined;
        //
        //     // Check if all blocks below us are sink blocks
        //     var all_sink = true;
        //     for(var i = 0; i < blocks.length; i++) {
        //         all_sink = all_sink && TileUtil.is_sink_block(blocks[i]);
        //     }
        //     return (all_sink == false);
        //
        // }.bind(this);
        //
        // var can_move = function(pos)
        // {
        //     return true;
        //     // Get blocks below stickman
        //     var blocks = this.get_stickman_direction(vec3(Math.round(pos[0]), Math.floor(pos[1]), Math.round(pos[2])));
        //     if(blocks.length == 0)
        //         return undefined;
        //
        //     // Check if all blocks below us are sink blocks
        //     var all_sink = true;
        //     for(var i = 0; i < blocks.length; i++) {
        //         all_sink = all_sink && TileUtil.is_sink_block(blocks[i]);
        //     }
        //     return all_sink;
        //
        // }.bind(this);
        //
        // // Blocks / time-interval
        // var move_force = 0.1;
        // // Blocks / Jump
        // var jump_force = 0.2;
        // // Blocks / time-interval
        // var gravity_force = 0.005;
        // var friction_force = 0.5;
        // // Blocks / time-interval
        // var terminal_velocity = 0.1;
        //
        // setInterval(function()
        // {
        //     function jump()
        //     {
        //         var stick_pos = model.get_stickman_position();
        //         if(can_jump(vec3(stick_pos[0], stick_pos[1] - 0.1, stick_pos[2])))
        //         {
        //             console.log("JUMP");
        //             velocity[1] = jump_force;
        //         }
        //     }
        //
        //     function gravity()
        //     {
        //         if(velocity[1] > -terminal_velocity)
        //         {
        //             velocity[1] -= gravity_force;
        //         }
        //     }
        //
        //     function killY()
        //     {
        //         var stick_pos = model.get_stickman_position();
        //         if(stick_pos[1] < 0)
        //         {
        //             model.update_stickman_position(
        //                     vec3(model.worldX/3,
        //                          model.worldY/3 + 10,
        //                         (model.worldZ - 1)/2));
        //         }
        //     }
        //
        //     function friction()
        //     {
        //         var old_y = velocity[1];
        //         velocity = scale(friction_force, velocity);
        //         velocity[1] = old_y;
        //     }
        //
        //     function move_straight(direction : number)
        //     {
        //         var mouse_pos = model.get_mouse_position();
        //
        //         velocity[0] = mouse_pos[0] * move_force * direction;
        //         velocity[2] = mouse_pos[2] * move_force * direction;
        //
        //         //console.log(velocity);
        //     }
        //
        //     function move_strafe(direction : number)
        //     {
        //         var mouse_pos = normalize(model.get_mouse_position());
        //
        //         velocity[0] = -mouse_pos[2] / 10 * direction;
        //         velocity[2] = mouse_pos[0] / 10 * direction;
        //     }
        //
        //     function update_position()
        //     {
        //         var old_position = model.get_stickman_position();
        //
        //         var new_x = old_position[0] + velocity[0];
        //         var new_y = old_position[1] + velocity[1];
        //         var new_z = old_position[2] + velocity[2];
        //
        //         // If we can jump, i.e. stand on ground disable gravity
        //         if(can_jump(vec3(new_x, new_y-0.1, new_z)) == true)
        //             new_y = old_position[1];
        //
        //         if(can_move(vec3(new_x, new_y, new_z)) == false)
        //         {
        //             console.log("NO MOVE");
        //             new_x = old_position[0];
        //             new_z = old_position[0];
        //         }
        //         else
        //         {
        //             model.update_stickman_position(vec3(new_x, new_y, new_z));
        //         }
        //     }
        //     //------------------//
        //     // Apply velocities //
        //     //------------------//
        //     var cur_time = new Date().getTime();
        //     function is_pressed(key)
        //     {
        //         if(keyState[key] == undefined)
        //             return false;
        //         return keyState[key].state;
        //     }
        //     function recently_pressed(key, time)
        //     {
        //         return (cur_time - keyState[key].click_time) < time;
        //     }
        //     function just_pressed(key)
        //     {
        //         keyState[key].click_time = cur_time;
        //     }
        //
        //     // Left, A
        //     if (is_pressed(37) || is_pressed(65))
        //     {
        //         move_strafe.bind(this)(-1);
        //     }
        //     // Right, D
        //     if (is_pressed(39) || is_pressed(68))
        //     {
        //         move_strafe.bind(this)(1);
        //     }
        //     // Forward, W
        //     if (is_pressed(38) || is_pressed(87))
        //     {
        //         move_straight.bind(this)(1);
        //     }
        //     // Backwards, S
        //     if (is_pressed(40) || is_pressed(83))
        //     {
        //         move_straight.bind(this)(-1);
        //     }
        //     // Space (jump)
        //     if (is_pressed(32) && recently_pressed(32, 500) == false)
        //     {
        //         just_pressed(32);
        //         jump.bind(this)();
        //     }
        //     // Space (jump)
        //     if (is_pressed(77) && recently_pressed(77, 500) == false)
        //     {
        //         just_pressed(77);
        //         model.update_map_active(!model.is_map_active());
        //     }
        //     // Apply gravity and friction
        //     gravity.bind(this)();
        //     friction.bind(this)();
        //
        //     // Update position via velocities
        //     update_position.bind(this)();
        //
        //     // If we fall off the world
        //     killY.bind(this)();
        // }.bind(this), 10);
        //





        // KLIK
        //
        // var place_block = function(event)
        // {
        //     var model = this.model;
        //     var stick_pos = model.get_stickman_position().map(Math.round);
        //     var mouse_pos = model.get_mouse_position();
        //     var block_pos = add(stick_pos, mouse_pos).map(Math.round);
        //
        //     if(model.valid_index(block_pos) == false)
        //         return;
        //
        //     // Check if block is free
        //     var placeable = model.can_build(block_pos);
        //     if(placeable && event.shiftKey == false)
        //     {
        //         /*
        //         var block_picker : any = document.getElementById('block_picker');
        //         var block_string = block_picker.options[block_picker.selectedIndex].value;
        //         var block_id = TileUtil.fromString(block_string);
        //         */
        //         var tile_id = Tile.STONE;
        //
        //         model.update_tile(block_pos, tile_id);
        //         //shockwave();
        //     }
        //     else if(TileUtil.is_destroyable(model.get_tile(block_pos)) && event.shiftKey == true)
        //     {
        //         model.update_tile(block_pos, Tile.EMPTY);
        //         //shockwave();
        //     }
        // }.bind(this);
        //
    }
}




//setInterval(this.block_flow.bind(this), 300);
//setInterval(this.block_stonify.bind(this), 10);

//setInterval(this.stickman_gravity.bind(this), 10);


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

export class KeyboardController {

    private keys:Array<string>;
    private keyMap:any;
    private buttons:Array<string>;
    private mouseMap:any;

    constructor() {
        this.keys = [];
        this.keyMap = {
            forward: ['w'],
            backward: ['s'],
            left: ['a'],
            right: ['d'],
            jump: ['32'], // Space.
            crouch: ['17'] // Ctrl.
        };
        this.buttons = [];
        this.mouseMap = {
            left: false,
            right: false,
            middle: false
        };
    }

    public setMouseDown(button:string) {
        this.buttons[button] = true;
    }

    public setMouseUp(button:string) {
        this.buttons[button] = false;
    }

    public setActive(key:string) {
        this.keys[key] = true;
    }

    public setInactive(key:string) {
        this.keys[key] = false;
    }

    public forward():boolean {
        return this.getAction('forward');
    }

    public backward():boolean {
        return this.getAction('backward');
    }

    public left():boolean {
        return this.getAction('left');
    }

    public right():boolean {
        return this.getAction('right');
    }

    public jump():boolean {
        return this.getAction('jump');
    }

    public crouch():boolean {
        return this.getAction('crouch');
    }

    private getAction(action:string):boolean {
        var self = this;
        var active = false;
        $.each(this.keyMap[action], function(index, key) {
            self.keys;
            if (self.keys[key])
                active = true;
        });
        return active;
    }
}

/*

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
                if(current_destroyed != model.FULLY_DESTROYED)
                    model.update_destroyed(block_pos, current_destroyed + 1);
            }
        }.bind(this);


            if(this.model.get_destroyed(block_pos) == model.FULLY_DESTROYED)
            {
                console.log("Picked up block!");
                this.model.update_destroyed(block_pos, 0);
                this.model.update_tile(block_pos, Tile.EMPTY);
            }
        }.bind(this));



};

 }.bind(this));
 */
