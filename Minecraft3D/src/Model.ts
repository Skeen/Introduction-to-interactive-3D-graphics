/// <reference path="../typings/index.d.ts"/>
import events = require('events');

declare var vec2: any;
declare var vec3: any;

import { Tile } from "./Tile"

export class Model extends events.EventEmitter
{
    public worldX : number = 40;
    public worldY : number = 40;
    public worldZ : number = 40;

    public worldSize : number = this.worldX * this.worldY * this.worldZ;

    public worldGrid : any[] = [];

    private stickman_position;

    // Checks whether x and y are valid indicies
    // TODO: Make private
    public valid_index(x : number, y : number, z : number) : boolean
    {
        function isInt(n : number)
        {
            return n % 1 === 0;
        }

        if(isInt(x) == false || isInt(y) == false)
        {
            console.log("valid_index called with non-integer arguments!", x, y);
            alert("valid_index called with non-integer arguments!");
        }

        return (x >= 0 && x < this.worldX &&
                y >= 0 && y < this.worldY)
    }

    public get_tile(x : number, y : number, z : number) : Tile
    {
        this.valid_index(x,y,z);
        return this.worldGrid[x][y][z];
    }

    private set_tile(x : number, y : number, z : number, tile : Tile) : void
    {
        this.worldGrid[x][y][z] = tile;
    }

    // Checks whether a block can be built at x,y
    public can_build(x : number, y : number, z : number) : boolean
    {
        // Check that x and y are valid
        if(this.valid_index(x, y, z) == false)
        {
            return false;
        }

        // Check if stickman is blocking (i.e. if we're inside his sprite)
        /*
        if(x >= stick_man_pos[0] - 0.5 && x < stick_man_pos[0]+2 &&
           y >= stick_man_pos[1] - 0.5 && y < stick_man_pos[1]+4)
            return false;
        */

        // Check if the block is free
        if(this.get_tile(x,y,z) != Tile.EMPTY)
        {
            return false;
        }
        // Check that an adjecent block exists
        for(var i = -1; i <= 1; i++)
        {
            for(var j = -1; j <= 1; j++)
            {
                // Ensure that the indicies are valid (i.e. within array bounds)
                if(this.valid_index(x+i, y+j,z+j) == false)
                    continue;

                // If we find one adjecent, we're good
                if(this.get_tile(x+i, y+j,z+j) != Tile.EMPTY)
                    return true;
            }
        }
        return false;
    }

    public update_tile(x : number, y : number, z : number, tile : Tile)
    {
        this.valid_index(x,y,z);
        this.set_tile(x, y, z, tile);
        this.emit("update_tile", x, y, z, tile);
    }

    public get_stickman_position() : any
    {
        return this.stickman_position;
    }

    public update_stickman_position(x : number, y : number, z : number)
    {
        this.stickman_position = vec3(x, y, z);
        this.emit("stickman_move", this.stickman_position);
    }

    private setup_world() : void
    {
        //this.worldGrid = [];
        // Generate empty world.
        for (var x = 0; x < this.worldX; x++) 
        {
            this.worldGrid[x] = [];
            for (var y = 0; y < this.worldY; y++) 
            {
                this.worldGrid[x][y] = [];
                for (var z = 0; z < this.worldZ; z++)
                {
                    this.worldGrid[x][y][z] = Tile.EMPTY;
                }
            }
        }

        // ------------ //
        // Update tiles //
        // ------------ //
        // Create ground
        for (var x = 0; x < this.worldX; x++) 
        {
            for (var y = 0; y < Math.floor(this.worldY/3); y++) 
            {
                for (var z=0; z< Math.floor(this.worldZ); z++)
                {
                    this.set_tile(x, y, z, Tile.DIRT);
                }
            }
        }

        // Create grass
        for (var x = 0; x < this.worldX; x++) 
        {
            var y = Math.floor(this.worldY/3);
            this.set_tile(x, y, z, Tile.GRASS);
            this.set_tile(x, y+1,z, Tile.GRASS);
        }

        // Create lake
        for (var x = Math.floor(this.worldX/4*2); x < Math.floor(this.worldX/4*3); x++)
        {
            var y = Math.floor(this.worldY/3);
            this.set_tile(x, y+1,z, Tile.WATER);
        }

        // Create fire/lava pit
        for (var x = 0; x < Math.floor(this.worldX/4); x++) 
        {
            var y = Math.floor(this.worldY/3);
            this.set_tile(x, y+1,z, Tile.FIRE);
        }
    }

    private update_mouse_position(pos)
    {
        var placeable = this.can_build(Math.floor(pos[0]), Math.floor(pos[1]), Math.floor(pos[2]));
        this.emit("mouse_move", pos, placeable); 
    }

    private update_shockwave(pos)
    {
        this.emit("shockwave", pos);
    }

    constructor() 
    {
        super();
        this.setup_world();
        this.update_stickman_position(0.5 + Math.floor(this.worldY/3), Math.floor(this.worldY/3)+10, Math.floor(this.worldY/3)+5);

        this.emit('ready');
    }
}
