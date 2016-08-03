import { Model } from "./Model";
import { Tile, TileUtil } from "./Tile"

export class Controller
{
    private model : Model;

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

    constructor(model : Model)
    {
        this.model = model;

        setInterval(this.block_flow.bind(this), 300);
    }
};
