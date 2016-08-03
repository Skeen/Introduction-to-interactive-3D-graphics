export enum Tile 
{
    EMPTY,
    STONE,
    GRASS,
    DIRT,
    WOOD,
    METAL,
    WATER,
    FIRE
}

export class TileUtil 
{
    // Returns undefined on invalid input
    public static toString(tile : Tile) : string
    {
        return Tile[tile];
    }

    // Returns undefined on invalid input
    public static fromString(str : string) : Tile
    {
        return Tile[str];
    }

    public static is_sink_block(tile : Tile) : boolean
    {
        return tile == Tile.EMPTY || tile == Tile.WATER;
    }

    public static is_jump_block(tile : Tile) : boolean
    {
        return tile == Tile.FIRE;
    }

    public static is_flow_block(tile : Tile) : boolean
    {
        return tile == Tile.FIRE || tile == Tile.WATER;
    }
}
/*
console.log(TileUtil.fromString("STONE"));
console.log(TileUtil.toString(TileUtil.fromString("STONA")));
*/
