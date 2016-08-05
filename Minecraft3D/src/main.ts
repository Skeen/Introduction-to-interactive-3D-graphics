// TODO: Send stickman as buffer, then move via uniform variable?

declare var $: any;

import { Model } from "./Model";
import { View } from "./View";
import { Controller } from "./Controller";
import { Tile, TileUtil } from "./Tile"

function time(func, str_start : string, str_end : string)
{
    console.log(str_start);
    var start = new Date().getTime();
    var return_value = func();
    var elapsed = new Date().getTime() - start;
    console.log("");
    console.log(str_end, "It took", elapsed, "ms.");
    return return_value;
}

$(function() 
{
    var model, view, controller;

    time(function()
    {
        model = time(function() { return new Model(); }, "Generating Model\n----------------", "Done generating model.");
        console.log("");
        view = time(function() { return new View(model); }, "Generating View\n---------------", "Done generating view.");
        console.log("");
        controller = time(function() { return new Controller(model); }, "Generating Controller\n---------------------", "Done generating controller.");
    }, "Loading game...", "Load complete! Ready to rock!");

    view.run();
});
