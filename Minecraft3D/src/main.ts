// TODO: Send stickman as buffer, then move via uniform variable?

declare var $: any;

import { Model } from "./Model";
import { View } from "./View";
import { Controller } from "./Controller";
import { Tile, TileUtil } from "./Tile"

$(function() 
{
    var start = new Date().getTime();
    var model = new Model();
    var modelTs = new Date().getTime() - start;
    console.log("Done generating model. It took", modelTs, "ms.");
    var view = new View(model);
    var viewTs = new Date().getTime() - start;
    console.log("Done generating view. It took", viewTs, "ms.");
    var controller = new Controller(model);

    console.log("Load complete! Ready to rock!");
    view.run();
});
