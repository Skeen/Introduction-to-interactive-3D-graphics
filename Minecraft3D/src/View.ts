import { Model } from "./Model";
import { Tile, TileUtil } from "./Tile"

declare var vec2: any;
declare var vec3: any;
declare var vec4: any;

declare var flatten: any;

declare var sizeof: any;

declare var WebGLUtils: any;
declare var initShaders: any;

declare var perspective: any;
declare var lookAt: any;

export class View
{
    private model : Model;

    // TODO: Fix type
    private canvas : any;
    private gl : any;

    //private program : any;
    private boxShaderProgram : any;

    // Shader variables
    private vPosition;
    private vColor;
    //private vScalePos;
    private vTranslate;
    //private vClickPos;
    //private vTime;
    //private vStickPos;
    private uPMatrix; 
    private uMVMatrix; 

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
    private stickTranslateBuffer : WebGLBuffer;
    private stickIndexBuffer : WebGLBuffer;
    // Mouse
    private mouseVBuffer : WebGLBuffer;
    private mouseCBuffer : WebGLBuffer;
    private mouseTranslateBuffer : WebGLBuffer;

    // Game related stuff.
    // world variables
    private verts_per_block : number = 24;
    private indicies_per_block : number = 36;


    //private stick_man_num_points : number;

    // Fix this
    private mouse_lines : number = 0;
    private stickman_lines : number = 0;
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

        gl.clearDepth(1.0);
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

        gl.enable(gl.CULL_FACE);
        gl.cullFace(gl.BACK);
/*
        gl.disable(gl.DEPTH_TEST);
        gl.enable( gl.BLEND );
        //gl.blendFunc(gl.DST_COLOR, gl.ZERO);
        //gl.blendFunc(gl.ZERO, gl.DST_COLOR);
        //gl.blendEquation( gl.FUNC_ADD );
        //gl.blendFunc( gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA );
        //gl.blendFunc( gl.DST_COLOR, gl.ONE_MINUS_SRC_ALPHA );
        gl.blendFunc( gl.DST_COLOR, gl.SRC_ALPHA );
        //gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        //gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        //gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
*/
        //this.program = initShaders(gl, "vertex-shader.glsl", "fragment-shader.glsl");
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
        //this.vScalePos  = gl.getUniformLocation(this.boxShaderProgram, "vScale");
        //this.vClickPos  = gl.getUniformLocation(this.boxShaderProgram, "vClickPos");
        //this.vTime      = gl.getUniformLocation(this.boxShaderProgram, "vTime");
        this.uPMatrix = gl.getUniformLocation(this.boxShaderProgram, "uPMatrix");
        this.uMVMatrix = gl.getUniformLocation(this.boxShaderProgram, "uMVMatrix");

        // World Vertex buffer
        this.worldVBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.worldVBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, sizeof['vec3'] * model.worldSize * this.verts_per_block, gl.STATIC_DRAW);
        gl.vertexAttribPointer(this.vPosition, 3, gl.FLOAT, false, 0, 0);
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
        gl.bufferData(gl.ARRAY_BUFFER, sizeof['vec3'] * model.worldSize * this.verts_per_block, gl.STATIC_DRAW);
        gl.vertexAttribPointer(this.vTranslate, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.vTranslate);
        // World Index buffer
        this.worldIndexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.worldIndexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, Uint32Array.BYTES_PER_ELEMENT * model.worldSize * this.indicies_per_block, gl.STATIC_DRAW);

        // Mouse Vertex buffer
        this.stickVBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.stickVBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, sizeof['vec2'] * 5 * 2, gl.STATIC_DRAW);
        gl.vertexAttribPointer(this.vPosition, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.vPosition);
        // Mouse Color buffer
        this.stickCBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.stickCBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, sizeof['vec4'] * 5 * 2, gl.STATIC_DRAW);
        gl.vertexAttribPointer(this.vColor, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.vColor);
        // Mouse Translate buffer
        this.stickTranslateBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.stickTranslateBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, sizeof['vec2'] * 5 * 4, gl.STATIC_DRAW);
        gl.vertexAttribPointer(this.vTranslate, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.vTranslate);


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
        // Mouse Translate buffer
        this.mouseTranslateBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.mouseTranslateBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, sizeof['vec2'] * 5 * 4, gl.STATIC_DRAW);
        gl.vertexAttribPointer(this.vTranslate, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.vTranslate);
/*
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
        */
    }

    private idx_to_offset(pos) : number
    {
        var model = this.model;

        var x = pos[0];
        var y = pos[1];
        var z = pos[2];

        // Column major
        var offset = ((x*model.worldY+y) * model.worldZ + z) * this.verts_per_block;
        // Row major
        //var offset = ((z*model.worldY+y) * model.worldX + x) * this.verts_per_block;

        return offset;
    }

    private initialize_block_world() : void
    {
        var gl = this.gl;
        var model = this.model;

        var world_points = [];
        var world_colors = [];
        var world_translate = [];
        var world_indices = [];

        for (var x = 0; x < model.worldX; x++)
        {
            for (var y = 0; y < model.worldY; y++)
            {
                for (var z = 0; z < model.worldZ; z++)
                {
                    var tile = model.get_tile(vec3(x, y, z));
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
                    var offset = this.idx_to_offset(vec3(x,y,z));
                    //console.log(offset);

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
                        world_indices.push(cubeVertexIndices[i] + offset);
                    }

                    for(var i = 0; i < this.verts_per_block; i++)
                    {
                        world_points.push(vec3(vertices[i]));
                        world_colors.push(tile_color);
                        //world_colors.push(colors[i]);
                        world_translate.push(vec3(x, y, z));
                    }
                }
            }
        }
        console.log(world_indices.length);

        // Buffer Color
        gl.bindBuffer(gl.ARRAY_BUFFER, this.worldTranslateBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(world_translate), gl.STATIC_DRAW);
        // Buffer Color
        gl.bindBuffer(gl.ARRAY_BUFFER, this.worldCBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(world_colors), gl.STATIC_DRAW);
        // Buffer Verticies
        gl.bindBuffer(gl.ARRAY_BUFFER, this.worldVBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(world_points), gl.STATIC_DRAW);
        // Buffer Indicies
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.worldIndexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(world_indices), gl.STATIC_DRAW);
    }

    // Stickman stuff
    private initialize_stick_man(pos) : any
    {
        var gl = this.gl;

        var stick_points = [];

        /*
         // Front face
         [-0.5, -0.5,  0.5],
         [ 0.5, -0.5,  0.5],
         [ 0.5,  0.5,  0.5],
         [-0.5,  0.5,  0.5],
         */
        stick_points.push(vec3(-1.0, -1.0,  1.0));
        stick_points.push(vec3(1.0, -1.0,  1.0));
        stick_points.push(vec3(1.0,  1.0,  1.0));
        stick_points.push(vec3(-1.0,  1.0,  1.0));
        /*
         // Back face
         [-0.5, -0.5, -0.5],
         [-0.5,  0.5, -0.5],
         [ 0.5,  0.5, -0.5],
         [ 0.5, -0.5, -0.5],
         */
            // Back face
        stick_points.push(vec3(-1.0, -1.0, -1.0));
        stick_points.push(vec3(-1.0,  1.0, -1.0));
        stick_points.push(vec3(1.0,  1.0, -1.0));
        stick_points.push(vec3(1.0, -1.0, -1.0));
        /*
         // Top face
         [-0.5,  0.5, -0.5],
         [-0.5,  0.5,  0.5],
         [ 0.5,  0.5,  0.5],
         [ 0.5,  0.5, -0.5],
         */
            // Top face
        stick_points.push(vec3(-1.0,  1.0, -1.0));
        stick_points.push(vec3(-1.0,  1.0,  1.0));
        stick_points.push(vec3(1.0,  1.0,  1.0));
        stick_points.push(vec3(1.0,  1.0, -1.0));
        /*
         // Bottom face
         [-0.5, -0.5, -0.5],
         [ 0.5, -0.5, -0.5],
         [ 0.5, -0.5,  0.5],
         [-0.5, -0.5,  0.5],
         */
            // Bottom face
        stick_points.push(vec3(-1.0, -1.0, -1.0));
        stick_points.push(vec3(1.0, -1.0, -1.0));
        stick_points.push(vec3(1.0, -1.0,  1.0));
        stick_points.push(vec3(-1.0, -1.0,  1.0));
        /*
         // Right face
         [ 0.5, -0.5, -0.5],
         [ 0.5,  0.5, -0.5],
         [ 0.5,  0.5,  0.5],
         [ 0.5, -0.5,  0.5],
         */
            // Right face
        stick_points.push(vec3(1.0, -1.0, -1.0));
        stick_points.push(vec3(1.0,  1.0, -1.0));
        stick_points.push(vec3(1.0,  1.0,  1.0));
        stick_points.push(vec3(1.0, -1.0,  1.0));
        /*
         // Left face
         [-0.5, -0.5, -0.5],
         [-0.5, -0.5,  0.5],
         [-0.5,  0.5,  0.5],
         [-0.5,  0.5, -0.5]
         // Front face
         */
            // Left face
        stick_points.push(vec3(-1.0, -1.0, -1.0));
        stick_points.push(vec3(-1.0, -1.0,  1.0));
        stick_points.push(vec3(-1.0,  1.0,  1.0));
        stick_points.push(vec3(-1.0,  1.0, -1.0));

        var stick_colors = [];
        var stick_translate = [];
        for(var i = 0; i < stick_points.length; i++)
        {
            stick_translate.push(pos);
            //skin color
            stick_colors.push(vec4(1,0.68,0.38,1));
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, this.stickCBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(stick_colors), gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.stickVBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(stick_points), gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.stickTranslateBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(stick_translate), gl.STATIC_DRAW);

        this.stickman_lines = stick_points.length;
    }

    private render() : void
    {
        var gl = this.gl;
        var canvas = this.canvas;

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // Draw the world
        gl.bindBuffer(gl.ARRAY_BUFFER, this.mouseCBuffer);
        gl.vertexAttribPointer(this.vColor, 4, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.mouseVBuffer);
        gl.vertexAttribPointer(this.vPosition, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.mouseTranslateBuffer);
        gl.vertexAttribPointer(this.vTranslate, 3, gl.FLOAT, false, 0, 0);

        gl.drawArrays(gl.LINES, 0, this.mouse_lines);

        // Draw the stickman
        gl.bindBuffer(gl.ARRAY_BUFFER, this.stickCBuffer);
        gl.vertexAttribPointer(this.vColor, 4, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.stickVBuffer);
        gl.vertexAttribPointer(this.vPosition, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.stickTranslateBuffer);
        gl.vertexAttribPointer(this.vTranslate, 3, gl.FLOAT, false, 0, 0);

        gl.drawArrays(gl.TRIANGLE_FAN, 0, this.stickman_lines);


        // Draw the world
        gl.bindBuffer(gl.ARRAY_BUFFER, this.worldCBuffer);
        gl.vertexAttribPointer(this.vColor, 4, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.worldVBuffer);
        gl.vertexAttribPointer(this.vPosition, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.worldTranslateBuffer);
        gl.vertexAttribPointer(this.vTranslate, 3, gl.FLOAT, false, 0, 0);

        var ext = gl.getExtension("OES_element_index_uint");

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.worldIndexBuffer);
        gl.drawElements(gl.TRIANGLES, this.indicies_per_block * this.model.worldSize, gl.UNSIGNED_INT, 0);

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
                return vec4(0., 0., 1., 0.4);
            case Tile.FIRE:
                return vec4(1., 0., 0., 0.4);
            default:
                alert("Invalid tile, cannot convert to color!");
        }
    }

    private index_to_position(x, y, z) : any
    {
        return vec3(x + 0.5, y + 0.5, z+ 0.5);
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
        stick_points.push(vec3(0,0,0), vec3(1,1,0));
        stick_points.push(vec3(2,0,0), vec3(1,1,0));
        // Body
        stick_points.push(vec3(1,1,0), vec3(1,3,0));
        // Arms
        stick_points.push(vec3(0,2.5,0), vec3(2,2.5,0));
        // Face
        stick_points.push(vec3(1,3,0), vec3(0.5,4,0));
        stick_points.push(vec3(1,3,0), vec3(1.5,4,0));
        stick_points.push(vec3(0.5,4,0), vec3(1.5,4,0));

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
        gl.uniform3fv(this.vStickPos, flatten(model.get_stickman_position()));
    }
*/
    private initialize_mouse(pos, placeable : boolean) : void
    {
        var gl = this.gl;

        var mouse_points = [];
        // Left edge
        mouse_points.push(vec3(- 0.5, - 0.5, - 0.5));
        mouse_points.push(vec3(- 0.5, + 0.5, - 0.5));
        // Right edge
        mouse_points.push(vec3(+ 0.5, + 0.5, - 0.5));
        mouse_points.push(vec3(+ 0.5, - 0.5, - 0.5));
        // Top edge
        mouse_points.push(vec3(- 0.5, + 0.5, - 0.5));
        mouse_points.push(vec3(+ 0.5, + 0.5, - 0.5));
        // Bot edge
        mouse_points.push(vec3(- 0.5, - 0.5, - 0.5));
        mouse_points.push(vec3(+ 0.5, - 0.5, - 0.5));

        // Left edge
        mouse_points.push(vec3(- 0.5, - 0.5, + 0.5));
        mouse_points.push(vec3(- 0.5, + 0.5, + 0.5));
        // Right edge
        mouse_points.push(vec3(+ 0.5, + 0.5, + 0.5));
        mouse_points.push(vec3(+ 0.5, - 0.5, + 0.5));
        // Top edge
        mouse_points.push(vec3(- 0.5, + 0.5, + 0.5));
        mouse_points.push(vec3(+ 0.5, + 0.5, + 0.5));
        // Bot edge
        mouse_points.push(vec3(- 0.5, - 0.5, + 0.5));
        mouse_points.push(vec3(+ 0.5, - 0.5, + 0.5));

        // Edges
        mouse_points.push(vec3(- 0.5, - 0.5, - 0.5));
        mouse_points.push(vec3(- 0.5, - 0.5, + 0.5));
        mouse_points.push(vec3(+ 0.5, - 0.5, - 0.5));
        mouse_points.push(vec3(+ 0.5, - 0.5, + 0.5));
        mouse_points.push(vec3(+ 0.5, + 0.5, - 0.5));
        mouse_points.push(vec3(+ 0.5, + 0.5, + 0.5));
        mouse_points.push(vec3(- 0.5, + 0.5, - 0.5));
        mouse_points.push(vec3(- 0.5, + 0.5, + 0.5));

        var color = (placeable ? vec4(0., 0., 0., 1.) : vec4(1., 0., 0., 1.));

        var mouse_colors = [];
        var mouse_translate = [];
        for(var i = 0; i < mouse_points.length; i++)
        {
            mouse_colors.push(color);
            mouse_translate.push(pos);
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
        // Setup WebGL context
        this.initWebGl();
        // Setup buffers
        this.initBuffers();
        // Setup world
        this.initialize_block_world();


        var canvas = this.canvas;
        var gl = this.gl;
        
        var perspectiveMatrix = perspective(60, canvas.clientWidth / canvas.clientHeight, 0.1, 100.0);
        gl.uniformMatrix4fv(this.uPMatrix, false, flatten(perspectiveMatrix));

        this.model.on("update_tile", function(pos, tile)
        {
            console.log("update tile!");
            var tile_color = this.tile_to_color(tile);

            // Get the start offset into world_colors
            var offset = this.idx_to_offset(pos);
            console.log(offset);

            this.rebufferColor(offset, offset+this.verts_per_block, tile_color);
        }.bind(this));

        var height = 1;
        var update_camera = function() : void
        {
            var stick_pos = model.get_stickman_position();
            var cam_pos   = model.get_mouse_position();

            if(model.is_map_active())
            {
                var modelMatrix = lookAt(vec3(stick_pos[0],
                                              stick_pos[1] + 50,
                                              stick_pos[2]),
                                         vec3(stick_pos[0],
                                              stick_pos[1],
                                              stick_pos[2]),
                                         vec3(1,0,0));
                gl.uniformMatrix4fv(this.uMVMatrix, false, flatten(modelMatrix));
            }
            else
            {
                var modelMatrix = lookAt(vec3(stick_pos[0],
                                              stick_pos[1] + height,
                                              stick_pos[2]),
                                         vec3(stick_pos[0] + cam_pos[0],
                                              stick_pos[1] + cam_pos[1] + height,
                                              stick_pos[2] + cam_pos[2]),
                                         vec3(0,1,0));
                gl.uniformMatrix4fv(this.uMVMatrix, false, flatten(modelMatrix));
            }
        }.bind(this);

        this.model.on("stickman_move", update_camera);
        this.model.on("mouse_move", update_camera);
        this.model.on("map_active", update_camera);

        this.model.on("stickman_move", function(pos)
        {
            this.model.update_tile(vec3(Math.round(pos[0]), Math.round(pos[1])-1, Math.round(pos[2])), Tile.STONE);
        }.bind(this));

        update_camera();

        this.initialize_mouse(vec3(0,5,0), true);
        // Setup stickman
        this.initialize_stick_man(model.get_stickman_position());

/*
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
            gl.uniform3fv(this.vClickPos, flatten(pos));

            if (this.timerId)
                clearInterval(this.timerId);

            this.timerId = setInterval(doClickExplosion.bind(this), 1);

        }.bind(this));
        */
    }
};
