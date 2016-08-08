// TODO: Send stickman as buffer, then move via uniform variable?

declare var $: any;

import { Model } from "./Model";
import { View } from "./View";
import { Controller } from "./Controller";
import { Tile, TileUtil } from "./Tile"

function time(func, str_start : string, str_end : string, callback)
{
    console.log(str_start);
    var start = new Date().getTime();
    func(function(result)
    {
        var elapsed = new Date().getTime() - start;
        console.log("");
        console.log(str_end, "It took", elapsed, "ms.");
        callback(result);
    });
}

function initGame(optionalSeed?: string) 
{
    time(function(outer_callback)
    {
        time(function(callback) 
            { new Model(optionalSeed, callback);},
        "Generating Model\n----------------", 
        "Done generating model.",
        function(model)
        {
            console.log("");

            time(function(callback) 
                { new View(model, callback);}, 
            "Generating View\n---------------",
            "Done generating view.",
            function(view)
            {
                console.log("");

                time(function(callback)
                    { new Controller(model, callback); },
                "Generating Controller\n---------------------", 
                "Done generating controller.",
                function(controller)
                {
                    outer_callback([model, view, controller]);
                });
            });
        });
    }, 
    "Loading game...", 
    "Load complete! Ready to rock!",
    function(input)
    {
        var model = input[0];
        var view  = input[1];
        var ctrl  = input[2];

        view.run();
    });
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

    (function() {
        // milliseconds
        var lastTime = (new Date).getTime()
        ,   acceptableDelta = 500
        ,   tick = 1000
        ,   hung = false;

        function hangman() {
            var now = (new Date).getTime();
            if(now - lastTime > (tick + acceptableDelta)) {
                hung = true;
            } else if(hung) {
                hung = false;
                console.warn('Possible browser hangup detected.');
            }
            lastTime = now;
        }

        setInterval(hangman, tick);
    }());

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
