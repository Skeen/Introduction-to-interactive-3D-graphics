import { Model } from "./Model";
import { Tile, TileUtil } from "./Tile"
import {ShaderProgram} from "./ShaderProgram";

declare var vec2: any;
declare var vec3: any;
declare var vec4: any;

declare var WebGLUtils: any;

export class View
{
    private model : Model;

    // TODO: Fix type
    private canvas : any;
    private gl : any;

    // Shader programs.
    private stickProgram : ShaderProgram;
    private boxProgram : ShaderProgram;

    // Game related stuff.
    // world variables
    private verts_per_block : number = 4;
    private indicies_per_block : number = 6;

    // Stickman stuff
    private stick_man_num_points : number = 7;

    // Fix this
    private mouse_lines : number = 0;

    // Shockwave variables
    private shockwave_duration : number = 1000;
    private timerId;

    // Render stuf
    private renderScale: number;
    
    private rebufferColor(start, end, color) : void
    {
        var gl = this.gl;

        var replace_values = [];
        for(var i = 0; i < (end - start); i++)
        {
            replace_values.push(color);
        }
        this.boxProgram.setAttributeSubData('vColor', 'world', replace_values, start);
    }

    // Initialize WebGL render context.
    private initWebGl() : void
    {
        var canvas = document.getElementById("gl-canvas");
        var gl = WebGLUtils.setupWebGL(canvas);

        if (!gl)
        {
            alert("Unable to setup WebGL!");
            return;
        }
        gl.viewport(0, 0, canvas.clientWidth, canvas.clientHeight);
        gl.clearColor(1.0, 1.0, 1.0, 1.0);
        gl.enable(gl.DEPTH_TEST);

        this.stickProgram = new ShaderProgram(gl, "vertex-shader.glsl", "fragment-shader.glsl");
        this.boxProgram = new ShaderProgram(gl, "block-vertex-shader.glsl", "block-fragment-shader.glsl");

        this.canvas = canvas;
        this.gl = gl;
    }

    // Initialize buffers.
    private initBuffers() : void
    {
        // World.
        this.boxProgram.createAttribute('vPosition', 'world', 'vec2');
        this.boxProgram.createAttribute('vColor', 'world', 'vec4');
        this.boxProgram.createAttribute('vCenterPos', 'world', 'vec2');

        this.boxProgram.setAttributeData('vPosition', 'world', this.model.worldSize * this.vertsPerBlock);
        this.boxProgram.setAttributeData('vColor', 'world', this.model.worldSize * this.vertsPerBlock);
        this.boxProgram.setAttributeData('vCenterPos', 'world', this.model.worldSize * this.vertsPerBlock);

        // Mouse.
        this.boxProgram.createAttribute('vPosition', 'mouse', 'vec2');
        this.boxProgram.createAttribute('vColor', 'mouse', 'vec4');
        this.boxProgram.createAttribute('vTranslate', 'mouse', 'vec2');

        this.boxProgram.setAttributeData('vPosition', 'mouse', 5 * 2);
        this.boxProgram.setAttributeData('vColor', 'mouse', 5 * 2);
        this.boxProgram.setAttributeData('vCenterPos', 'mouse', 4 * 5);

        // Uniforms.
        this.boxProgram.createUniform('vScale');
        this.boxProgram.createUniform('vClickPos');
        this.boxProgram.createUniform('vTime');

        this.boxProgram.uniform1f('vScale', this.renderScale);


        // Stickman program.

        this.stickProgram.createAttribute('vPosition', 'default', 'vec2');
        this.stickProgram.createAttribute('vColor', 'default', 'vec4');

        this.stickProgram.setAttributeData('vPosition', 'default', this.stick_man_num_points * 2);
        this.stickProgram.setAttributeData('vColor', 'default', this.stick_man_num_points * 2);

        this.stickProgram.createUniform('vScale');
        this.stickProgram.createUniform('vStickPos');


        // Set the uniform scale variable
        this.stickProgram.uniform1f('vScale', this.renderScale);
    }

    private initialize_block_world() : void
    {
        var gl = this.gl;
        var model = this.model;

        var world_centers = [];
        var world_points = [];
        var world_colors = [];
        var world_translate = [];
        var world_indicies = [];
        for (var x = 0; x < model.worldX; x++)
        {
            for (var y = 0; y < model.worldY; y++)
            {
                var tile = model.get_tile(x, y);
                var tile_color = this.tile_to_color(tile);

                var pos = this.index_to_position(x, y);

                world_points.push(vec2(- 0.5, - 0.5));
                world_points.push(vec2(- 0.5, + 0.5));
                world_points.push(vec2(+ 0.5, - 0.5));
                world_points.push(vec2(+ 0.5, + 0.5));

                // Get the start offset into world_colors
                var offset = this.verts_per_block * (y + (x * model.worldX));

                world_indicies.push(0 + offset);
                world_indicies.push(1 + offset);
                world_indicies.push(2 + offset);
                world_indicies.push(1 + offset);
                world_indicies.push(2 + offset);
                world_indicies.push(3 + offset);

                for(var i = 0; i < this.verts_per_block; i++)
                {
                    world_colors.push(tile_color);
                    world_translate.push(vec2(x + 0.5, y + 0.5));
                }
            }
        }

        this.boxProgram.setAttributeData('vPosition', 'world', world_points);
        this.boxProgram.setAttributeData('vColor', 'world', world_colors);
        this.boxProgram.setAttributeData('vCenterPos', 'world', world_centers);
    }

    private render() : void
    {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        this.stickProgram.setBindings('default');
        this.gl.drawArrays(this.gl.LINES, 0, this.stick_man_num_points);

        // Draw the mouse block outline
        if(this.mouse_lines != 0)
        {
            this.boxProgram.setBindings('mouse');
            this.gl.drawArrays(this.gl.LINES, 0, this.mouse_lines);
        }

        // Draw the world
        this.boxProgram.setBindings('world');

        for (var i = 0; i < this.model.worldSize; i+=1)
        {
            this.gl.drawArrays(this.gl.TRIANGLE_FAN, this.vertsPerBlock*i, this.vertsPerBlock);
        }

        (<any>window).requestAnimFrame(this.render.bind(this), this.canvas);
    }

    private tile_to_color(tile : Tile) : any
    {
        switch(tile)
        {
            case Tile.EMPTY:
                return vec4(0., 0., 1., 0.);
            case Tile.STONE:
                return vec4(0.2, 0.2, 0.2, 1.);
            case Tile.GRASS:
                return vec4(0., 1., 0., 1.);
            case Tile.DIRT:
                return vec4(0.55, 0.27, 0.07, 1.);
            case Tile.WOOD:
                return vec4(0.87, 0.72, 0.53, 1.);
            case Tile.METAL:
                return vec4(0.82, 0.82, 0.82, 1.);
            case Tile.WATER:
                return vec4(0., 0., 1., 1.);
            case Tile.FIRE:
                return vec4(1., 0., 0., 1.);
            default:
                alert("Invalid tile, cannot convert to color!");
        }
    }

    private index_to_position(x, y) : any
    {
        return vec2(x + 0.5, y + 0.5);
    }

    public run() : void
    {
        this.render();
    }

    private initialize_stick_man() : void
    {
        var stick_points = [];
        var stick_colors = [];
        // Legs
        stick_points.push(vec2(0,0), vec2(1,1));
        stick_points.push(vec2(2,0), vec2(1,1));
        // Body
        stick_points.push(vec2(1,1), vec2(1,3));
        // Arms
        stick_points.push(vec2(0,2.5), vec2(2,2.5));
        // Face
        stick_points.push(vec2(1,3), vec2(0.5,4));
        stick_points.push(vec2(1,3), vec2(1.5,4));
        stick_points.push(vec2(0.5,4), vec2(1.5,4));

        // We need to know number of points in render
        this.stick_man_num_points = stick_points.length;
        for(var i = 0; i < this.stick_man_num_points; i++)
        {
            // Add color
            stick_colors.push(vec4(0., 0., 0., 1.));
        }

        // Buffer Color
        this.stickProgram.setAttributeData('vColor', 'default', stick_colors);

        // Buffer Vertices.
        this.stickProgram.setAttributeData('vPosition', 'default', stick_points);

        this.stickProgram.uniform2fv('vStickPos', this.model.get_stickman_position());
    }

    private initialize_mouse(pos, placeable : boolean) : void
    {
        var mouse_points = [];
        // Left edge
        mouse_points.push(vec2(pos[0] - 0.5, pos[1] - 0.5));
        mouse_points.push(vec2(pos[0] - 0.5, pos[1] + 0.5));
        // Right edge
        mouse_points.push(vec2(pos[0] + 0.5, pos[1] + 0.5));
        mouse_points.push(vec2(pos[0] + 0.5, pos[1] - 0.5));
        // Top edge
        mouse_points.push(vec2(pos[0] - 0.5, pos[1] + 0.5));
        mouse_points.push(vec2(pos[0] + 0.5, pos[1] + 0.5));
        // Bot edge
        mouse_points.push(vec2(pos[0] - 0.5, pos[1] - 0.5));
        mouse_points.push(vec2(pos[0] + 0.5, pos[1] - 0.5));
        // Diagonal edge
        mouse_points.push(vec2(pos[0] - 0.5, pos[1] - 0.5));
        mouse_points.push(vec2(pos[0] + 0.5, pos[1] + 0.5));

        var color = (placeable ? vec4(0., 0., 0., 1.) : vec4(1., 0., 0., 1.));

        var mouse_colors = [];
        var mouse_translate = [];
        for(var i = 0; i < mouse_points.length; i++)
        {
            mouse_colors.push(color);
            mouse_translate.push(vec2(pos[0], pos[1]));
        }

        this.boxProgram.setAttributeData('vColor', 'mouse', mouse_colors);
        this.boxProgram.setAttributeData('vPosition', 'mouse', mouse_points);
        this.boxProgram.setAttributeData('vCenterPos', 'mouse', mouse_centers);

        this.mouse_lines = mouse_points.length;
    }

    constructor(model : Model)
    {
        this.model = model;
        this.renderScale = 2 / Math.max(model.worldX, model.worldY);

        // Setup WebGL context
        this.initWebGl();
        // Setup buffers
        this.initBuffers();
        // Setup world
        this.initialize_block_world();
        // Setup stickman
        this.initialize_stick_man();

        this.model.on("update_tile", function(x, y, tile)
        {
            var tile_color = this.tile_to_color(tile);

            // Get the start offset into world_colors
            var offset = this.verts_per_block * (y + (x * model.worldX));

            this.rebufferColor(offset, offset+this.verts_per_block, tile_color);
        }.bind(this));

        this.model.on("stickman_move", function(pos)
        {
            this.stickProgram.uniform2fv('vStickPos', pos);
        }.bind(this));

        this.model.on("mouse_move", function(pos, placeable : boolean)
        {
            this.initialize_mouse(pos, placeable);
        }.bind(this));

        this.model.on("shockwave", function(pos)
        {
            var gl = this.gl;
            var that = this;

            var startTime = new Date().getTime();

            function doClickExplosion()
            {
                var delta = new Date().getTime() - startTime;
                if (delta > this.shockwave_duration)
                {
                    delta = 0;
                    clearInterval(this.timerId);
                }
                that.boxProgram.uniform1f('vTime', delta);
            }
            that.boxProgram.uniform2fv('vClickPos', pos);

            if (this.timerId)
                clearInterval(this.timerId);

            this.timerId = setInterval(doClickExplosion.bind(this), 1);

        }.bind(this));

    }
}
