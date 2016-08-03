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
}
/*
console.log(TileUtil.fromString("STONE"));
console.log(TileUtil.toString(TileUtil.fromString("STONA")));
*/
