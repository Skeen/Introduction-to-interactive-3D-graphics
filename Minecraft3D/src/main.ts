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

function initGame(optionalSeed?: string) {
    var model, view, controller;

    time(function()
    {
        model = time(function() { return new Model(optionalSeed); }, "Generating Model\n----------------", "Done generating model.");
        console.log("");
        view = time(function() { return new View(model); }, "Generating View\n---------------", "Done generating view.");
        console.log("");
        controller = time(function() { return new Controller(model); }, "Generating Controller\n---------------------", "Done generating controller.");
    }, "Loading game...", "Load complete! Ready to rock!");

    view.run();
}

var getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
};

$(function( ) {
    var seed = getUrlParameter('world');
    if (!seed) {
        seed = String(Math.random());
    }
    $('#seed').val(seed);
    $('#seedClick').on('click', function(e){
        window.location.href = window.location.origin + '?world=' + $('#seed').val();
    });
    initGame(seed);
});
