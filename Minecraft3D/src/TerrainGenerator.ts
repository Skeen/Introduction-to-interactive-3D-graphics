/**
 * Created by dkchokk on 05/08/16.
 */
///<reference path="../typings/globals/node/index.d.ts" />
var seedrandom = require('seedrandom');
export interface TerrainGenerator {
    generate(roughness:number): Float32Array;
}

export class DiamondTerrainGenerator implements TerrainGenerator {

    private size:number;
    private max:number;
    private map:Float32Array;
    private randomFunc: any;

    constructor(mapSize:number, randomSeed:string) {
        this.size = Math.pow(2, mapSize) + 1;
        this.max = this.size - 1;
        this.map = new Float32Array(Math.pow(this.size, 2));
        this.randomFunc = seedrandom(randomSeed);
        console.log('Random seed was', '"' + randomSeed + '"');
    }

    private get(x:number, y:number):number {
        if (x < 0 || x > this.max || y < 0 || y > this.max)
            return -1;
        return this.map[x + this.size * y];
    }

    private set(x:number, y:number, value:number):void {
        this.map[x + this.size * y] = value;
    }

    public generate(roughness:number):Float32Array {

        this.set(0, 0, this.max / 2);
        this.set(this.max, 0, this.max / 2);
        this.set(this.max, this.max, 0);
        this.set(0, this.max, this.max / 2);

        this.divide(this.max, roughness);

        return this.map;
    }

    private divide(size:number, roughness:number):void {
        var x:number, y:number, half:number = size / 2;
        var scale = roughness * size;
        if (half < 1)
            return;
        for (y = half; y < this.max; y += size)
            for (x = half; x < this.max; x += size)
                this.square(x, y, half, this.randomFunc() * scale * 2 - scale);
        for (y = 0; y <= this.max; y += half)
            for (x = (y + half) % size; x <= this.max; x += size)
                this.diamond(x, y, half, this.randomFunc() * scale * 2 - scale);
        this.divide(size / 2, roughness);
    }

    private square(x:number, y:number, size:number, offset:number) {
        var ave = this.average([
            this.get(x - size, y - size),
            this.get(x + size, y - size),
            this.get(x + size, y + size),
            this.get(x - size, y + size)
        ]);
        this.set(x, y, ave + offset);
    }

    private diamond(x:number, y:number, size:number, offset:number) {
        var ave = this.average([
            this.get(x, y - size),
            this.get(x + size, y),
            this.get(x, y + size),
            this.get(x - size, y)
        ]);
        this.set(x, y, ave + offset);
    }

    private average(values:Array<number>):number {
        var valid = values.filter(function(val:number){return val !== -1;});
        var total = valid.reduce(function(sum, val){return sum + val;}, 0);
        return total / valid.length;
    }
}