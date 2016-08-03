// TODO: Send stickman as buffer, then move via uniform variable?

declare var $: any;

import { Model } from "./Model";
import { View } from "./View";
import { Controller } from "./Controller";
import { Tile, TileUtil } from "./Tile"

$(function() {
    var model = new Model();
    var controller = new Controller(model);
    var view = new View(model);
    view.run();
});
