import { Model } from "./Model";
import { Tile, TileUtil } from "./Tile"

declare var vec2: any;
declare var vec3: any;
declare var vec4: any;

declare var flatten: any;

declare var sizeof: any;

declare var WebGLUtils: any;
declare var initShaders: any;

export class View
{
    private model : Model;

    // TODO: Fix type
    private canvas : any;
    private gl : any;

    private program : any;
    private boxShaderProgram : any;

    // Shader variables
    private vPosition;
    private vColor;
    private vScalePos;
    private vTranslate;
    private vClickPos;
    private vTime;
    private vStickPos;

    // Buffers
    //--------
    // Blocks
    private worldVBuffer : WebGLBuffer;
    private worldCBuffer : WebGLBuffer;
    private worldTranslateBuffer : WebGLBuffer;
    private worldIndexBuffer : WebGLBuffer;
    // Stick figure
    private stickVBuffer : WebGLBuffer;
    private stickCBuffer : WebGLBuffer;
    // Mouse
    private mouseVBuffer : WebGLBuffer;
    private mouseCBuffer : WebGLBuffer;
    private mouseTranslateBuffer : WebGLBuffer;

    // Game related stuff.
    // world variables
    private verts_per_block : number = 6;

    // Stickman stuff
    private stick_man_num_points : number;

    // Fix this
    private mouse_lines : number = 0;

    // Shockwave variables
    private shockwave_duration : number = 1000;
    private timerId;

    // Render stuf
    private render_scale : number;
    
    private rebufferColor(start, end, color) : void
    {
        var gl = this.gl;

        var replace_values = [];
        for(var i = 0; i < (end - start); i++)
        {
            replace_values.push(color);
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, this.worldCBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, start*sizeof['vec4'], flatten(replace_values));
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

        this.program = initShaders(gl, "vertex-shader.glsl", "fragment-shader.glsl");
        this.boxShaderProgram = initShaders(gl, "block-vertex-shader.glsl", "block-fragment-shader.glsl");
        this.canvas = canvas;
        this.gl = gl;
    }

    // Initialize buffers.
    private initBuffers() : void
    {
        var gl = this.gl;
        var model = this.model;

        gl.useProgram(this.boxShaderProgram);

        // Get Shader variable positions
        this.vPosition  = gl.getAttribLocation(this.boxShaderProgram, "vPosition");
        this.vColor     = gl.getAttribLocation(this.boxShaderProgram, "vColor");
        this.vTranslate = gl.getAttribLocation(this.boxShaderProgram, 'vTranslate');
        this.vScalePos  = gl.getUniformLocation(this.boxShaderProgram, "vScale");
        this.vClickPos  = gl.getUniformLocation(this.boxShaderProgram, "vClickPos");
        this.vTime      = gl.getUniformLocation(this.boxShaderProgram, "vTime");

        // World Vertex buffer
        this.worldVBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.worldVBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, sizeof['vec2'] * model.worldSize * this.verts_per_block, gl.STATIC_DRAW);
        gl.vertexAttribPointer(this.vPosition, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.vPosition);
        // World Color buffer
        this.worldCBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.worldCBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, sizeof['vec4'] * model.worldSize * this.verts_per_block, gl.STATIC_DRAW);
        gl.vertexAttribPointer(this.vColor, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.vColor);
        // World Translate buffer
        this.worldTranslateBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.worldTranslateBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, sizeof['vec4'] * model.worldSize * this.verts_per_block, gl.STATIC_DRAW);
        gl.vertexAttribPointer(this.vTranslate, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.vTranslate);
        // World Index buffer
        this.worldIndexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.worldIndexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, Uint16Array.BYTES_PER_ELEMENT * model.worldSize * this.verts_per_block, gl.STATIC_DRAW);
 
        // Mouse Vertex buffer
        this.mouseVBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.mouseVBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, sizeof['vec2'] * 5 * 2, gl.STATIC_DRAW);
        gl.vertexAttribPointer(this.vPosition, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.vPosition);
        // Mouse Color buffer
        this.mouseCBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.mouseCBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, sizeof['vec4'] * 5 * 2, gl.STATIC_DRAW);
        gl.vertexAttribPointer(this.vColor, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.vColor);
        // World Translate buffer
        this.mouseTranslateBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.mouseTranslateBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, sizeof['vec2'] * 5 * 4, gl.STATIC_DRAW);
        gl.vertexAttribPointer(this.vTranslate, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.vTranslate);

        // Set the uniform scale variable
        gl.uniform1f(this.vScalePos, this.render_scale);

        gl.useProgram(this.program);

        this.vPosition  = gl.getAttribLocation(this.program, "vPosition");
        this.vColor     = gl.getAttribLocation(this.program, "vColor");
        this.vScalePos  = gl.getUniformLocation(this.program, "vScale");
        this.vStickPos  = gl.getUniformLocation(this.program, "vStickPos");

        // Stickman Vertex buffer
        this.stickVBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.stickVBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, sizeof['vec2'] * 7 * 2, gl.STATIC_DRAW);
        gl.vertexAttribPointer(this.vPosition, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.vPosition);
        // Stickman Color buffer
        this.stickCBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.stickCBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, sizeof['vec4'] * model.worldSize, gl.STATIC_DRAW);
        gl.vertexAttribPointer(this.vColor, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.vColor);

        // Set the uniform scale variable
        gl.uniform1f(this.vScalePos, this.render_scale);
    }

    private initialize_block_world() : void
    {
        var gl = this.gl;
        var model = this.model;

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

                /*
                world_points.push(vec2(- 0.5, + 0.5));
                world_points.push(vec2(+ 0.5, - 0.5));
                */
                world_points.push(vec2(+ 0.5, + 0.5));

                world_indicies.push(0);
                world_indicies.push(1);
                world_indicies.push(2);
                world_indicies.push(1);
                world_indicies.push(2);
                world_indicies.push(3);

                for(var i = 0; i < 4; i++)
                {
                    world_colors.push(tile_color);
                    world_translate.push(vec2(x + 0.5, y + 0.5));
                }
            }
        }
        // Buffer Color
        gl.bindBuffer(gl.ARRAY_BUFFER, this.worldTranslateBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(world_translate), gl.STATIC_DRAW);
        // Buffer Color
        gl.bindBuffer(gl.ARRAY_BUFFER, this.worldCBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(world_colors), gl.STATIC_DRAW);
        // Buffer Verticies
        gl.bindBuffer(gl.ARRAY_BUFFER, this.worldVBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(world_points), gl.STATIC_DRAW);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.worldIndexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(world_indicies), gl.STATIC_DRAW);
    }

    private render() : void
    {
        var gl = this.gl;

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // ---------------/
        // Draw STICKMAN -/
        // ---------------/
        gl.useProgram(this.program);
        // Draw the stick figure
        gl.bindBuffer(gl.ARRAY_BUFFER, this.stickCBuffer);
        gl.vertexAttribPointer(this.vColor, 4, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.stickVBuffer);
        gl.vertexAttribPointer(this.vPosition, 2, gl.FLOAT, false, 0, 0);

        gl.drawArrays(gl.LINES, 0, this.stick_man_num_points);

        // -----------//
        // Draw BOXES //
        // -----------//
        gl.useProgram(this.boxShaderProgram);

        // Draw the mouse block outline
        if(this.mouse_lines != 0)
        {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.mouseCBuffer);
            gl.vertexAttribPointer(this.vColor, 4, gl.FLOAT, false, 0, 0);

            gl.bindBuffer(gl.ARRAY_BUFFER, this.mouseVBuffer);
            gl.vertexAttribPointer(this.vPosition, 2, gl.FLOAT, false, 0, 0);

            gl.bindBuffer(gl.ARRAY_BUFFER, this.mouseTranslateBuffer);
            gl.vertexAttribPointer(this.vTranslate, 2, gl.FLOAT, false, 0, 0);

            gl.drawArrays(gl.LINES, 0, this.mouse_lines);
        }

        // Draw the world
        gl.bindBuffer(gl.ARRAY_BUFFER, this.worldCBuffer);
        gl.vertexAttribPointer(this.vColor, 4, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.worldVBuffer);
        gl.vertexAttribPointer(this.vPosition, 2, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.worldTranslateBuffer);
        gl.vertexAttribPointer(this.vTranslate, 2, gl.FLOAT, false, 0, 0);

        //gl.drawArrays(gl.TRIANGLES, 0, this.verts_per_block*this.model.worldSize);
        gl.drawElements(gl.TRIANGLES, this.verts_per_block*this.model.worldSize, gl.UNSIGNED_SHORT, 0);

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
        gl.bindBuffer(gl.ARRAY_BUFFER, this.stickCBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(stick_colors), gl.STATIC_DRAW);
        // Buffer Verticies
        gl.bindBuffer(gl.ARRAY_BUFFER, this.stickVBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(stick_points), gl.STATIC_DRAW);

        gl.useProgram(this.program);
        gl.uniform2fv(this.vStickPos, model.get_stickman_position());
    }

    private initialize_mouse(pos, placeable : boolean) : void
    {
        var gl = this.gl;

        var mouse_points = [];
        // Left edge
        mouse_points.push(vec2(- 0.5, - 0.5));
        mouse_points.push(vec2(- 0.5, + 0.5));
        // Right edge
        mouse_points.push(vec2(+ 0.5, + 0.5));
        mouse_points.push(vec2(+ 0.5, - 0.5));
        // Top edge
        mouse_points.push(vec2(- 0.5, + 0.5));
        mouse_points.push(vec2(+ 0.5, + 0.5));
        // Bot edge
        mouse_points.push(vec2(- 0.5, - 0.5));
        mouse_points.push(vec2(+ 0.5, - 0.5));
        // Diagonal edge
        mouse_points.push(vec2(- 0.5, - 0.5));
        mouse_points.push(vec2(+ 0.5, + 0.5));

        var color = (placeable ? vec4(0., 0., 0., 1.) : vec4(1., 0., 0., 1.));

        var mouse_colors = [];
        var mouse_translate = [];
        for(var i = 0; i < mouse_points.length; i++)
        {
            mouse_colors.push(color);
            mouse_translate.push(vec2(pos[0], pos[1]));
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, this.mouseCBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(mouse_colors), gl.STATIC_DRAW);
         
        gl.bindBuffer(gl.ARRAY_BUFFER, this.mouseVBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(mouse_points), gl.STATIC_DRAW);
         
        gl.bindBuffer(gl.ARRAY_BUFFER, this.mouseTranslateBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(mouse_translate), gl.STATIC_DRAW);

        this.mouse_lines = mouse_points.length;
    }

    constructor(model : Model)
    {
        this.model = model;
        this.render_scale = 2 / Math.max(model.worldX, model.worldY);

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
            var gl = this.gl;

            gl.useProgram(this.program);
            gl.uniform2fv(this.vStickPos, pos);
        }.bind(this));

        this.model.on("mouse_move", function(pos, placeable : boolean)
        {
            this.initialize_mouse(pos, placeable);
        }.bind(this));

        this.model.on("shockwave", function(pos)
        {
            var gl = this.gl;

            var startTime = new Date().getTime();

            function doClickExplosion()
            {
                var delta = new Date().getTime() - startTime;
                if (delta > this.shockwave_duration)
                {
                    delta = 0;
                    clearInterval(this.timerId);
                }
                gl.useProgram(this.boxShaderProgram);
                gl.uniform1f(this.vTime, delta);
            }

            gl.useProgram(this.boxShaderProgram);
            gl.uniform2fv(this.vClickPos, pos);

            if (this.timerId)
                clearInterval(this.timerId);

            this.timerId = setInterval(doClickExplosion.bind(this), 1);

        }.bind(this));
    }
};
