import { Model } from "./Model";
import { Tile, TileUtil } from "./Tile"
import {ShaderProgram} from "./ShaderProgram";

declare var vec2: any;
declare var vec3: any;
declare var vec4: any;

declare var WebGLUtils: any;

declare var perspective: any;
declare var lookAt: any;

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
    private verts_per_block : number = 24;
    private indicies_per_block : number = 36;

    // Stickman stuff
    //private stick_man_num_points : number;

    // Fix this
    //private mouse_lines : number = 0;

    // Shockwave variables
    //private shockwave_duration : number = 1000;
    //private timerId;

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
        gl.clearDepth(1.0);
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);            // Near things obscure far things
        /*
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
        */

        this.stickProgram = new ShaderProgram(gl, "vertex-shader.glsl", "fragment-shader.glsl");
        this.boxProgram = new ShaderProgram(gl, "block-vertex-shader.glsl", "block-fragment-shader.glsl");

        this.canvas = canvas;
        this.gl = gl;
    }

    // Initialize buffers.
    private initBuffers() : void
    {
        // World.
        this.boxProgram.createAttribute('vPosition', 'world', 'vec3');
        this.boxProgram.createAttribute('vColor', 'world', 'vec4');
        this.boxProgram.createAttribute('vTranslate', 'world', 'vec3');
        this.boxProgram.createIndices('world', Uint16Array.BYTES_PER_ELEMENT * model.worldSize * this.indicies_per_block);

        // this.worldIndexBuffer = gl.createBuffer();
        // gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.worldIndexBuffer);
        // gl.bufferData(gl.ARRAY_BUFFER, Uint16Array.BYTES_PER_ELEMENT * model.worldSize * this.indicies_per_block, gl.STATIC_DRAW);


        this.boxProgram.setAttributeData('vPosition', 'world', this.model.worldSize * this.vertsPerBlock);
        this.boxProgram.setAttributeData('vColor', 'world', this.model.worldSize * this.vertsPerBlock);
        this.boxProgram.setAttributeData('vTranslate', 'world', this.model.worldSize * this.vertsPerBlock);

        // // Mouse.
        // this.boxProgram.createAttribute('vPosition', 'mouse', 'vec3');
        // this.boxProgram.createAttribute('vColor', 'mouse', 'vec4');
        // this.boxProgram.createAttribute('vTranslate', 'mouse', 'vec3');

        this.boxProgram.createUniform('uPMatrix');
        this.boxProgram.createUniform('uMVMatrix');

        // this.boxProgram.setAttributeData('vPosition', 'mouse', 5 * 2);
        // this.boxProgram.setAttributeData('vColor', 'mouse', 5 * 2);
        // this.boxProgram.setAttributeData('vCenterPos', 'mouse', 4 * 5);

        // Uniforms.
        // this.boxProgram.createUniform('vScale');
        // this.boxProgram.createUniform('vClickPos');
        // this.boxProgram.createUniform('vTime');

        // this.boxProgram.uniform1f('vScale', this.renderScale);
        //
        //
        // // Stickman program.
        //
        // this.stickProgram.createAttribute('vPosition', 'default', 'vec2');
        // this.stickProgram.createAttribute('vColor', 'default', 'vec4');
        //
        // this.stickProgram.setAttributeData('vPosition', 'default', this.stick_man_num_points * 2);
        // this.stickProgram.setAttributeData('vColor', 'default', this.stick_man_num_points * 2);
        //
        // this.stickProgram.createUniform('vScale');
        // this.stickProgram.createUniform('vStickPos');
        //
        //
        // // Set the uniform scale variable
        // this.stickProgram.uniform1f('vScale', this.renderScale);
    }

    private initialize_block_world() : void
    {
        var gl = this.gl;
        var model = this.model;
        var world_points = [];
        var world_colors = [];
        var world_translate = [];
        var world_indicies = [];

        var x = 0;
        var y = 0;
        var z = 0;
        for (var x = 0; x < model.worldX; x++)
        {
            for (var y = 0; y < model.worldY; y++)
            {
                var tile = model.get_tile(x, y);
                var tile_color = this.tile_to_color(tile);

                //var pos = this.index_to_position(x, y);

                var vertices = [
                    // Front face
                    [-0.5, -0.5,  0.5],
                    [ 0.5, -0.5,  0.5],
                    [ 0.5,  0.5,  0.5],
                    [-0.5,  0.5,  0.5],

                    // Back face
                    [-0.5, -0.5, -0.5],
                    [-0.5,  0.5, -0.5],
                    [ 0.5,  0.5, -0.5],
                    [ 0.5, -0.5, -0.5],

                    // Top face
                    [-0.5,  0.5, -0.5],
                    [-0.5,  0.5,  0.5],
                    [ 0.5,  0.5,  0.5],
                    [ 0.5,  0.5, -0.5],

                    // Bottom face
                    [-0.5, -0.5, -0.5],
                    [ 0.5, -0.5, -0.5],
                    [ 0.5, -0.5,  0.5],
                    [-0.5, -0.5,  0.5],

                    // Right face
                    [ 0.5, -0.5, -0.5],
                    [ 0.5,  0.5, -0.5],
                    [ 0.5,  0.5,  0.5],
                    [ 0.5, -0.5,  0.5],

                    // Left face
                    [-0.5, -0.5, -0.5],
                    [-0.5, -0.5,  0.5],
                    [-0.5,  0.5,  0.5],
                    [-0.5,  0.5, -0.5]
                ];

                // Get the start offset into world_colors
                var offset = this.verts_per_block * (y + (x * model.worldX));

                var cubeVertexIndices = [
                    0,  1,  2,      0,  2,  3,    // front
                    4,  5,  6,      4,  6,  7,    // back
                    8,  9,  10,     8,  10, 11,   // top
                    12, 13, 14,     12, 14, 15,   // bottom
                    16, 17, 18,     16, 18, 19,   // right
                    20, 21, 22,     20, 22, 23    // left
                ]

                var colors = [
                    [0.0,  1.0,  1.0,  1.0],    // Front face: cyan
                    [0.0,  1.0,  1.0,  1.0],    // Front face: cyan
                    [0.0,  1.0,  1.0,  1.0],    // Front face: cyan
                    [0.0,  1.0,  1.0,  1.0],    // Front face: cyan
                    [1.0,  0.0,  0.0,  1.0],    // Back face: red
                    [1.0,  0.0,  0.0,  1.0],    // Back face: red
                    [1.0,  0.0,  0.0,  1.0],    // Back face: red
                    [1.0,  0.0,  0.0,  1.0],    // Back face: red
                    [0.0,  1.0,  0.0,  1.0],    // Top face: green
                    [0.0,  1.0,  0.0,  1.0],    // Top face: green
                    [0.0,  1.0,  0.0,  1.0],    // Top face: green
                    [0.0,  1.0,  0.0,  1.0],    // Top face: green
                    [0.0,  0.0,  1.0,  1.0],    // Bottom face: blue
                    [0.0,  0.0,  1.0,  1.0],    // Bottom face: blue
                    [0.0,  0.0,  1.0,  1.0],    // Bottom face: blue
                    [0.0,  0.0,  1.0,  1.0],    // Bottom face: blue
                    [1.0,  1.0,  0.0,  1.0],    // Right face: yellow
                    [1.0,  1.0,  0.0,  1.0],    // Right face: yellow
                    [1.0,  1.0,  0.0,  1.0],    // Right face: yellow
                    [1.0,  1.0,  0.0,  1.0],    // Right face: yellow
                    [1.0,  0.0,  1.0,  1.0],    // Left face: purple
                    [1.0,  0.0,  1.0,  1.0],    // Left face: purple
                    [1.0,  0.0,  1.0,  1.0],    // Left face: purple
                    [1.0,  0.0,  1.0,  1.0]     // Left face: purple
                ];

                for(var i = 0; i < this.indicies_per_block; i++)
                {
                    world_indicies.push(cubeVertexIndices[i] + offset);
                }

                for(var i = 0; i < this.verts_per_block; i++)
                {
                    world_points.push(vec3(vertices[i]));
                        //world_colors.push(vec4(1., 1., 1., 0.));
                    //else
                    world_colors.push(tile_color);

                    if(tile == Tile.EMPTY)
                    world_translate.push(vec3(x+1000, y, z));
                    else
                    world_translate.push(vec3(x, y, z));
                }
/*
                for(var i = 8; i < 12; i++)
                {
                    //console.log(tile_color);
                    world_colors[world_colors.length - this.verts_per_block + i] = vec4(0., 0., 0., 1.);
                }
                */
            }
        }

        this.boxProgram.setAttributeData('vPosition', 'world', world_points);
        this.boxProgram.setAttributeData('vColor', 'world', world_colors);
        this.boxProgram.setAttributeData('vCenterPos', 'world', world_centers);

        // // Buffer Indicies
        // gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.worldIndexBuffer);
        // gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(world_indicies), gl.STATIC_DRAW);
    }

    private render() : void
    {
        var gl = this.gl;
        var canvas = this.canvas;

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // Draw the world
        gl.bindBuffer(gl.ARRAY_BUFFER, this.worldCBuffer);
        gl.vertexAttribPointer(this.vColor, 4, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.worldVBuffer);
        gl.vertexAttribPointer(this.vPosition, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.worldTranslateBuffer);
        gl.vertexAttribPointer(this.vTranslate, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.worldIndexBuffer);
        gl.drawElements(gl.TRIANGLES, this.indicies_per_block * this.model.worldSize, gl.UNSIGNED_SHORT, 0);
        //gl.drawElements(gl.TRIANGLES, this.indicies_per_block * 2, gl.UNSIGNED_SHORT, 0);

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
/*
    private initialize_stick_man() : void
    {
        var gl = this.gl;
        var model = this.model;

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
*/
    constructor(model : Model)
    {
        this.model = model;
        // Setup WebGL context
        this.initWebGl();
        // Setup buffers
        this.initBuffers();
        // Setup world
        this.initialize_block_world();
        // Setup stickman
        //this.initialize_stick_man();

        var canvas = this.canvas;
        var gl = this.gl;

        var perspectiveMatrix = perspective(45, canvas.clientWidth / canvas.clientHeight, 0.1, 100.0);
        gl.uniformMatrix4fv(this.uPMatrix, false, flatten(perspectiveMatrix));

/*
        this.model.on("update_tile", function(x, y, tile)
        {
            var tile_color = this.tile_to_color(tile);

            // Get the start offset into world_colors
            var offset = this.verts_per_block * (y + (x * model.worldX));

            this.rebufferColor(offset, offset+this.verts_per_block, tile_color);
        }.bind(this));
        */

        var update_camera = function(stick_pos, cam_pos)
        {
            var modelMatrix = lookAt(vec3(stick_pos[0], stick_pos[1], 0),
                                     vec3(stick_pos[0] + cam_pos[0], stick_pos[1] + cam_pos[1], 0 + cam_pos[2]),
                                     vec3(0,1,0));
            gl.uniformMatrix4fv(this.uMVMatrix, false, flatten(modelMatrix));

        }.bind(this);

        this.model.on("stickman_move", function(pos)
        {
            update_camera(pos, model.get_mouse_position());
        }.bind(this));

        this.model.on("mouse_move", function(pos)
        {
            update_camera(model.get_stickman_position(), pos);
        }.bind(this));
/*
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
        */
    }
}
