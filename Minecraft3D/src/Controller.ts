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

export class Controller {
    private model:Model;
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

    // Environment vars.
    private translateSun:boolean = true;
    private sunSpeed:number = 50;

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

    private physics():void {
        var deltaTime = this.deltaS;
        if (this.noClip) {
            return;
        }
        if (this.translateSun) {
            var sun = this.model.getSunValue();
            this.model.updateSunValue(sun + (deltaTime * this.sunSpeed));
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
        else {
            this.canJump = true;
            this.gravity[1] = 0;
        }
        var newPos = vec3(currentPos[0], currentPos[1] - this.gravity[1], currentPos[2]);
        this.model.update_stickman_position(newPos);
    }

    private physics_isGrounded(position:any):boolean {
        var blocksBelow = this.get_stickman_blocks(vec3(Math.round(position[0]), Math.floor(position[1]), Math.round(position[2])));
        for (var i = 0; i < blocksBelow.length; i++) {
            var block = blocksBelow[i];
            if (!TileUtil.is_sink_block(block))
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
        $(window).on('keydown', function (e) {
            if (!self.pointerLock)
                return;
            var key = String.fromCharCode(e.which).toLowerCase();
            if (key === ' ' || e.ctrlKey || e.metaKey || e.key.toLowerCase() === 'control')
                key = String(e.which).toLowerCase();
            self.keyController.setActive(key);
        });

        $(window).on('keyup', function (e) {
            if (!self.pointerLock)
                return;
            var key = String.fromCharCode(e.which).toLowerCase();
            if (key === ' ' || e.ctrlKey || e.metaKey || e.key.toLowerCase() === 'control')
                key = String(e.which).toLowerCase();
            if (self.keyController.map()) {
                self.model.toggleMap();
            }
            if (self.keyController.projection()) {
                self.model.toggleProjection();
            }
            self.keyController.setInactive(key);
        });
    }

    private setMouseListeners():void {
        $(this.canvas).on('click', this.captureListener.bind(this));
        $(this.canvas).on('mousemove', this.mouseMoveListener.bind(this));
        $(document).on('pointerlockchange mozpointerlockchange', this.pointerLockListener.bind(this));

        $('#noclip').click(function (e) {
            this.noClip = $('#noclip').prop('checked');
        }.bind(this));

        $('#time_slider').on('input', function (e) {
            this.translateSun = false;
            var value = $('#time_slider').val();
            this.model.updateSunValue(value);
        }.bind(this));

        $('#time_slider').on('change', function (e) {
            this.translateSun = true;
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
        if (this.pitch > Math.PI / 2 * 0.9)
            this.pitch = Math.PI / 2 * 0.9;
        // Clamp us from looking directly down
        if (this.pitch < -Math.PI / 2 * 0.9)
            this.pitch = -Math.PI / 2 * 0.9;

        // Normalize our yaw
        if (this.yaw > Math.PI * 2)
            this.yaw -= Math.PI * 2;
        if (this.yaw < -Math.PI * 2)
            this.yaw += Math.PI * 2;

        // Calculate view vector [-1,1] on all axis
        var x = Math.cos(this.yaw) * Math.cos(this.pitch);
        var y = Math.sin(this.pitch);
        var z = Math.sin(this.yaw) * Math.cos(this.pitch);

        // Let everyone know
        this.model.update_mouse_position(vec3(x, y, z), this.yaw);
    }

    private captureListener(e):void {
        if (document.pointerLockElement != this.canvas) {
            this.canvas.requestPointerLock();
            return;
        }
        if (this.keyController.select()) {
            this.model.triggerOffscreenRender(e);
        }
        else {
            var model = this.model;
            var stick_pos = model.get_stickman_position().map(Math.round);
            var mouse_pos = model.get_mouse_position();
            var block_pos = add(stick_pos, mouse_pos).map(Math.round);

            if (model.valid_index(block_pos) == false)
                return;

            // Check if block is free
            var placeable = model.can_build(block_pos);
            if (placeable && e.shiftKey == false) {
                var block_picker:any = document.getElementById('block_picker');
                var block_string = block_picker.options[block_picker.selectedIndex].value;
                var tile_id = TileUtil.fromString(block_string);

                model.update_destroyed(block_pos, 0);
                model.update_tile(block_pos, tile_id);
            }
            else if (TileUtil.is_destroyable(model.get_tile(block_pos)) && e.shiftKey == true) {
                model.update_destroyed(block_pos, model.FULLY_DESTROYED);
            }
            else {
                var current_destroyed = model.get_destroyed(block_pos);
                if (current_destroyed != model.FULLY_DESTROYED)
                    model.update_destroyed(block_pos, current_destroyed + 1);
            }
        }
    }

    private get_stickman_blocks(pos) {
        var model = this.model;

        // Check that x and y are valid
        if (model.valid_index(pos) == false) {
            return [];
        }

        var x = pos[0];
        var y = pos[1];
        var z = pos[2];

        // Collect adjacent blocks
        var blocks = [];
        for (var i = -1; i <= 1; i++) {
            for (var k = -1; k <= 1; k++) {
                // Ensure that the indicies are valid (i.e. within array bounds)
                if (model.valid_index(vec3(x + i, y, z + k)) == false)
                    continue;

                blocks.push(model.get_tile(vec3(x + i, y, z + k)));
            }
        }
        return blocks;
    }

    private get_stickman_direction(pos) {
        var model = this.model;

        // Check that x and y are valid
        if (model.valid_index(pos) == false) {
            return [];
        }

        var x = pos[0];
        var y = pos[1];
        var z = pos[2];

        // Collect adjacent blocks
        var blocks = [];
        for (var i = -1; i <= 1; i++) {
            for (var j = 0; j <= 1; j++) {
                for (var k = -1; k <= 1; k++) {
                    // Ensure that the indicies are valid (i.e. within array bounds)
                    if (model.valid_index(vec3(x + i, y + j, z + k)) == false)
                        continue;

                    blocks.push(model.get_tile(vec3(x + i, y + j, z + k)));
                }
            }
        }
        return blocks;
    }

    constructor(model:Model) {
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

        this.model.on("stickman_move", function (pos) {
            var block_pos = vec3(Math.round(pos[0]), Math.round(pos[1]), Math.round(pos[2]));
            if (this.model.valid_index(block_pos) == false) {
                return;
            }
            if (this.model.get_destroyed(block_pos) == model.FULLY_DESTROYED) {
                console.log("Picked up block!");
                this.model.update_destroyed(block_pos, 0);
                this.model.update_tile(block_pos, Tile.EMPTY);
            }
        }.bind(this));

        this.model.on('sunchange', function(newVal:number) {
            $('#time_slider').val(newVal);
        });
    }
}

export class KeyboardController {

    private keys:Array<string>;
    private keyMap:any;
    private buttons:Array<string>;
    private mouseMap:any;

    constructor() {
        this.keys = [];
        this.keyMap = {
            forward: ['w', '38'],
            backward: ['s', '40'],
            left: ['a', '37'],
            right: ['d', '39'],
            map: ['m'],
            projection: ['p'],
            select: ['t'],
            jump: ['32'], // Space.
            crouch: ['c']
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

    public map():boolean {
        return this.getAction('map');
    }

    public projection():boolean {
        return this.getAction('projection');
    }

    public select():boolean {
        return this.getAction('select');
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
