///<reference path="../typings/globals/node/index.d.ts" />
import events = require('events');

declare var vec2: any;
declare var vec3: any;

import { Tile } from "./Tile"

export class Model extends events.EventEmitter
{
    public worldX : number = 500;
    public worldY : number = 5;
    public worldZ : number = 500;

    public worldSize : number = this.worldX * this.worldY * this.worldZ;

    private worldGrid : any[] = [];

    private stickman_position;
    private mouse_position;
    private map_active : boolean = false;

    // Checks whether x and y are valid indicies
    // TODO: Make private
    public valid_index(pos) : boolean
    {
        function isInt(n : number)
        {
            return n % 1 === 0;
        }

        var x = pos[0];
        var y = pos[1];
        var z = pos[2];

        if(isInt(x) == false || isInt(y) == false || isInt(z) == false)
        {
            console.log("valid_index called with non-integer arguments!", x, y, z);
            alert("valid_index called with non-integer arguments!");
            return false;
        }

        return (x >= 0 && x < this.worldX &&
                y >= 0 && y < this.worldY &&
                z >= 0 && z < this.worldZ)
    }

    public get_tile(pos) : Tile
    {
        this.valid_index(pos);

        var x = pos[0];
        var y = pos[1];
        var z = pos[2];

        return this.worldGrid[x][y][z];
    }

    private set_tile(pos, tile : Tile) : void
    {
        var x = pos[0];
        var y = pos[1];
        var z = pos[2];

        this.worldGrid[x][y][z] = tile;
    }

    // Checks whether a block can be built at x,y
    public can_build(pos) : boolean
    {
        // Check that x and y are valid
        if(this.valid_index(pos) == false)
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
        if(this.get_tile(pos) != Tile.EMPTY)
        {
            return false;
        }
        // Check that an adjecent block exists
        var x = pos[0];
        var y = pos[1];
        var z = pos[2];
        for(var i = -1; i <= 1; i++)
        {
            for(var j = -1; j <= 1; j++)
            {
                for(var k = -1; k <= 1; k++)
                {
                    // Ensure that the indicies are valid (i.e. within array bounds)
                    if(this.valid_index(vec3(x+i, y+j, z+k)) == false)
                        continue;

                    // If we find one adjecent, we're good
                    if(this.get_tile(vec3(x+i, y+j, z+k)) != Tile.EMPTY)
                        return true;
                }
            }
        }
        return false;
    }

    public update_tile(pos, tile : Tile)
    {
        if(this.valid_index(pos) == false)
            return false;

        this.set_tile(pos, tile);
        this.emit("update_tile", pos, tile);
        return true;
    }

    /*
    private create_stickman() : any
    {

    }
*/
    public get_stickman_position() : any
    {
        return this.stickman_position;
    }

    public update_stickman_position(pos)
    {
        this.stickman_position = pos;
        this.emit("stickman_move", pos);
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
                for(var z = 0; z < this.worldZ; z++)
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
                for(var z = 0; z < this.worldZ; z++)
                {
                    this.set_tile(vec3(x, y, z), Tile.DIRT);
                }
            }
        }

        // Create grass
        for (var x = 0; x < this.worldX; x++) 
        {
            var y = Math.floor(this.worldY/3);
            for(var z = 0; z < this.worldZ; z++)
            {
                this.set_tile(vec3(x, y, z), Tile.GRASS);
                this.set_tile(vec3(x, y+1, z), Tile.GRASS);
            }
        }

        // Create lake
        for (var x = Math.floor(this.worldX/4*2); x < Math.floor(this.worldX/4*3); x++)
        {
            var y = Math.floor(this.worldY/3);
            for(var z = 0; z < this.worldZ; z++)
            {
                this.set_tile(vec3(x, y+1, z), Tile.WATER);
            }
        }

        // Create fire/lava pit
        for (var x = 0; x < Math.floor(this.worldX/4); x++) 
        {
            var y = Math.floor(this.worldY/3);
            for(var z = 0; z < this.worldZ; z++)
            {
                this.set_tile(vec3(x, y+1, z), Tile.FIRE);
            }
        }
    }

    public get_mouse_position()
    {
        return this.mouse_position;
    }

    private update_mouse_position(pos)
    {
        this.mouse_position = pos;
        this.emit("mouse_move", pos);
    }

    private update_shockwave(pos)
    {
        this.emit("shockwave", pos);
    }

    public is_map_active()
    {
        return this.map_active;
    }

    public update_map_active(map_active : boolean)
    {
        this.map_active = map_active;
        this.emit("map_active", map_active);
    }

    constructor()
    {
        super();
        this.setup_world();
        this.update_stickman_position(vec3(this.worldX/3, this.worldY/3 + 10, (this.worldZ - 1)/2));
        this.update_mouse_position(vec3(1, -0.5, 0));

        this.emit('ready');
    }
};
