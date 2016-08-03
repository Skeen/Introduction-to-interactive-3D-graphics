import { Model } from "./Model";
import { Tile, TileUtil } from "./Tile"

export class Controller
{
    private model : Model;

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
                {
                    break;
                }
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

    private get_stickman_blocks(x, y)
    {
        var model = this.model;

        if( model.valid_index(Math.floor(x), Math.floor(y))     == false &&
            model.valid_index(Math.ceil(x), Math.floor(y))      == false &&
            model.valid_index(1 + Math.floor(x), Math.floor(y)) == false &&
            model.valid_index(1 + Math.ceil(x), Math.floor(y))  == false)
            return;

        // Get all the blocks under the stickman
        // Only ever 3 unique points
        var block_left          = model.get_tile(Math.floor(x), Math.floor(y));
        var block_center_left   = model.get_tile(Math.ceil(x), Math.floor(y));
        //var block_center_right = model.get_tile(1 + Math.floor(x), Math.floor(y));
        var block_right         = model.get_tile(1 + Math.ceil(x), Math.floor(y));

        return [block_left,
                block_center_left,
                //block_center_right,
                block_right];
    }

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

    // Apply gravity to stick-man
    private stickman_gravity() : void
    {
        var model = this.model;

        var old_position = model.get_stickman_position();
        var new_x = old_position[0];
        var new_y = old_position[1] - this.gravity_check;

        // Get blocks below stickman
        var blocks = this.get_stickman_blocks(new_x, new_y);

        // Check if all blocks below us are sink blocks
        var all_sink = true;
        //TODO can't jump if blocks are undefined
        if(blocks != undefined)
        {
            for(var x = 0; x < blocks.length; x++)
            {
                all_sink = all_sink && TileUtil.is_sink_block(blocks[x]);
            }
            if(all_sink)
            {
                model.update_stickman_position(new_x, new_y);
            }

            // Check if any blocks below us are fire blocks
            var any_fire = false;
            for(var x = 0; x < blocks.length; x++)
            {
                any_fire = any_fire || TileUtil.is_jump_block(blocks[x]);
            }
            if(any_fire)
            {
                new_y = old_position[1] + (this.jump_height - this.reduced_jump_height(new_x, new_y));
                model.update_stickman_position(new_x, new_y);
            }
        }
    }

    private stickman_move(e)
    {
        var model = this.model;

        var key = String.fromCharCode(e.keyCode);

        var old_position = model.get_stickman_position();
        var x = old_position[0];
        var y = old_position[1];

        function jump()
        {
            var new_x = x;
            var new_y = y - this.gravity_check;

            // Get blocks below stickman
            var blocks = this.get_stickman_blocks(new_x, new_y);
            if(blocks == undefined)
                return;

            // Check if all blocks below us are sink blocks
            var all_sink = true;
            for(var i = 0; i < blocks.length; i++) {
                all_sink = all_sink && TileUtil.is_sink_block(blocks[i]);
            }

            if(all_sink == false) // We can jump off something and nothing is above us
            {
                new_y = old_position[1] + (this.jump_height - this.reduced_jump_height(new_x,new_y));
                model.update_stickman_position(new_x, new_y);
            }
        }

        function move(new_x, new_y, rounder)
        {
            if(model.valid_index(rounder(new_x), Math.floor(new_y)) == false)
                return;

            // Check that we can stand in the new position
            var block1  = model.get_tile(rounder(new_x), Math.floor(new_y));
            var block2  = model.get_tile(rounder(new_x), Math.floor(new_y)+1);
            var block3  = model.get_tile(rounder(new_x), Math.floor(new_y)+2);
            var block4  = model.get_tile(rounder(new_x), Math.floor(new_y)+3);
            if(TileUtil.is_sink_block(block1) &&
               TileUtil.is_sink_block(block2) && 
               TileUtil.is_sink_block(block3) && 
               TileUtil.is_sink_block(block4))
            {
                model.update_stickman_position(new_x, new_y);
            }
        }

        function move_left()
        {
            // We only need to check the left block (i.e. floor(x))
            move(x - this.move_length, y, Math.floor);
        }

        function move_right()
        {
            // We only need to check the right block (i.e. 1+ceil(x))
            move(x + this.move_length, y, function(x) { return 1 + Math.ceil(x) });
        }

        switch(key) {
            case "W":
                jump.bind(this)();
                break;
            case "A":
                move_left.bind(this)();
                break;
            case "D":
                move_right.bind(this)();
                break;
        }
    }

    constructor(model : Model)
    {
        this.model = model;

        setInterval(this.block_flow.bind(this), 300);
        setInterval(this.block_stonify.bind(this), 10);

        setInterval(this.stickman_gravity.bind(this), 10);

        window.addEventListener("keydown", this.stickman_move.bind(this));
    }
};
