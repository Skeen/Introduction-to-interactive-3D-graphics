import { Model } from "./Model";
import { Tile, TileUtil } from "./Tile"

declare var vec2: any;
declare var vec3: any;
declare var vec4: any;

declare var flatten: any;
declare var add: any;
declare var scale: any;

declare var sizeof: any;

declare var WebGLUtils: any;
declare var initShaders: any;

declare var perspective: any;
declare var lookAt: any;

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
    private vDestroyed;
    //private vClickPos;
    //private vTime;
    //private vStickPos;
    private uPMatrix; 
    private uMVMatrix; 
    private uTheta;

    // Buffers
    //--------
    // Blocks
    private worldVBuffer : WebGLBuffer;
    private worldCBuffer : WebGLBuffer;
    private worldDBuffer : WebGLBuffer;
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
    private block_indicies : number = 0;
    private block_verts : number = 0;
    private vec_to_offset;
    private theta : number = 0;

    private stickman_lines : number = 0;
    // Shockwave variables
    //private shockwave_duration : number = 1000;
    //private timerId;

    private gen_indicies(arr, offset)
    {
        for(var i = 0; i < this.indicies_per_block; i++)
        {
            arr.push(cubeVertexIndices[i] + offset);
        }
    }

    private gen_buffers(arr_p, arr_c, arr_t, tile_color, pos)
    {
        for(var i = 0; i < this.verts_per_block; i++)
        {
            arr_p.push(vec3(vertices[i]));

            var watr = this.tile_to_color(Tile.WATER);
            if (watr[0] == tile_color[0] && watr[1] == tile_color[1] && watr[2] == tile_color[2])
                arr_c.push(tile_color);
            else
                arr_c.push(colors[i]);
            arr_t.push(pos);
        }
    }

    private render_block(x, y, z)
    {
        var model = this.model;
        var tile = model.get_tile(vec3(x, y, z));

        // No tile, don't render
        if(tile === Tile.EMPTY)
            return false;

        var empty_found = false;
        // Check for adjacent Empty or water
        for(var i = -1; i <= 1; i+=2)
        {
            var pos = vec3(x+i, y, z);
            if(model.valid_index(pos) == false)
                continue;
            var tile = model.get_tile(pos);
            empty_found = empty_found || TileUtil.is_sink_block(tile) || model.get_destroyed(pos);
        }
        for(var j = -1; j <= 1; j+=2)
        {
            var pos = vec3(x, y+j, z);
            if(model.valid_index(pos) == false)
                continue;
            var tile = model.get_tile(pos);
            empty_found = empty_found || TileUtil.is_sink_block(tile) || model.get_destroyed(pos);
        }
        for(var k = -1; k <= 1; k+=2)
        {
            var pos = vec3(x, y, z+k);
            if(model.valid_index(pos) == false)
                continue;
            var tile = model.get_tile(pos);
            empty_found = empty_found || TileUtil.is_sink_block(tile) || model.get_destroyed(pos);
        }
        // No empty blocks? - Noone will see this block then, so skip it
        if(empty_found == false)
            return false;

        return true;
    }

    private new_block(pos)
    {
        var model = this.model;
        var gl = this.gl;

        var points = [];
        var colors = [];
        var translate = [];
        var indicies = [];

        var offset = this.block_verts + this.verts_per_block;
        this.vec_to_offset[pos] = offset;
        this.block_verts = offset;

        console.log("New block at offset =", offset);

        this.gen_indicies(indicies, offset);
        var tile = model.get_tile(pos);
        var tile_color = this.tile_to_color(tile);
        this.gen_buffers(points, colors, translate, tile, pos);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.worldVBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, offset * sizeof['vec3'], flatten(points));

        gl.bindBuffer(gl.ARRAY_BUFFER, this.worldCBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, offset * sizeof['vec4'], flatten(colors));

        gl.bindBuffer(gl.ARRAY_BUFFER, this.worldTranslateBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, offset * sizeof['vec3'], flatten(translate));

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.worldIndexBuffer);
        gl.bufferSubData(gl.ELEMENT_ARRAY_BUFFER, (this.block_indicies)*Uint32Array.BYTES_PER_ELEMENT, new Uint32Array(indicies));

        this.block_indicies = this.block_indicies + this.indicies_per_block;
    }

    private update_block(pos)
    {
        var model = this.model;
        var gl = this.gl;

        var offset = this.vec_to_offset[pos];
        if(offset == undefined)
        {
            this.new_block(pos);
            //console.log("CRITICAL ISSUE!");
            return;
        }
        else
        {
            // TODO: Handle this, I have no idea why or how
            //console.log("UPDATE BLOCK!");
        }
    }

    private rebufferBlocks(pos)
    {
        var x = pos[0];
        var y = pos[1];
        var z = pos[2];

        for(var i = -1; i <= 1; i++)
        {
            for(var j = -1; j <= 1; j++)
            {
                for(var k = -1; k <= 1; k++)
                {
                    if(i == 0 && j == 0 && k == 0)
                        continue;

                    if(this.render_block(x+i, y+j, z+k) == false)
                        continue;

                    this.update_block(vec3(x+i, y+j, z+k));
                }
            }
        }
    }

    private updateColor(start, end, color) : void
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

    private updateDestroyed(start, end, destroyed) : void
    {
        var gl = this.gl;

        var replace_values = [];
        for(var i = 0; i < (end - start); i++)
        {
            replace_values.push(destroyed ? 1. : 0.);
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, this.worldDBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, start*Float32Array.BYTES_PER_ELEMENT, flatten(replace_values));
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
        gl.depthFunc(gl.LEQUAL);            

        gl.enable(gl.CULL_FACE);
        gl.cullFace(gl.BACK);

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
        this.vDestroyed = gl.getAttribLocation(this.boxShaderProgram, "vDestroyed");
        this.uPMatrix = gl.getUniformLocation(this.boxShaderProgram, "uPMatrix");
        this.uMVMatrix = gl.getUniformLocation(this.boxShaderProgram, "uMVMatrix");
        this.uTheta     = gl.getUniformLocation(this.boxShaderProgram, "uTheta");

        // World Vertex buffer
        this.worldVBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.worldVBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, sizeof['vec3'] * model.worldX * model.worldZ * 6 * this.verts_per_block, gl.STATIC_DRAW);
        gl.vertexAttribPointer(this.vPosition, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.vPosition);
        var worldVBufferSize = Math.round(gl.getBufferParameter(gl.ARRAY_BUFFER, gl.BUFFER_SIZE) / 1000 / 1000);
        // World Color buffer
        this.worldCBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.worldCBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, sizeof['vec4'] * model.worldX * model.worldZ * 6 * this.verts_per_block, gl.STATIC_DRAW);
        gl.vertexAttribPointer(this.vColor, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.vColor);
        var worldCBufferSize = Math.round(gl.getBufferParameter(gl.ARRAY_BUFFER, gl.BUFFER_SIZE) / 1000 / 1000);
        // World Translate buffer
        this.worldTranslateBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.worldTranslateBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, sizeof['vec3'] * model.worldX * model.worldZ * 6 * this.verts_per_block, gl.STATIC_DRAW);
        gl.vertexAttribPointer(this.vTranslate, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.vTranslate);
        var worldTranslateBufferSize = Math.round(gl.getBufferParameter(gl.ARRAY_BUFFER, gl.BUFFER_SIZE) / 1000 / 1000);
        // World Destroyed buffer
        this.worldDBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.worldDBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, Float32Array.BYTES_PER_ELEMENT * model.worldX * model.worldZ * 6 * this.verts_per_block, gl.STATIC_DRAW);
        gl.vertexAttribPointer(this.vDestroyed, 1, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.vDestroyed);
        var worldDBufferSize = Math.round(gl.getBufferParameter(gl.ARRAY_BUFFER, gl.BUFFER_SIZE) / 1000 / 1000);
        // World Index buffer
        this.worldIndexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.worldIndexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, Uint32Array.BYTES_PER_ELEMENT * model.worldX * model.worldZ * 6 * this.indicies_per_block, gl.STATIC_DRAW);
        var worldIndexBufferSize = Math.round(gl.getBufferParameter(gl.ELEMENT_ARRAY_BUFFER, gl.BUFFER_SIZE) / 1000 / 1000);

        // Output memory usage information
        console.log("Total World Vertex memory consumption:",       worldVBufferSize,           "MB");
        console.log("Total World Color memory consumption:",        worldCBufferSize,           "MB");
        console.log("Total World Translate memory consumption:",    worldTranslateBufferSize,   "MB");
        console.log("Total World Indicies memory consumption:",     worldIndexBufferSize,       "MB");
        console.log("Total World GPU memory consumption:",          (worldVBufferSize + worldCBufferSize + worldTranslateBufferSize + worldIndexBufferSize), "MB");

        // Stick Vertex buffer
        this.stickVBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.stickVBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, sizeof['vec3'] * 5 * 2, gl.STATIC_DRAW);
        gl.vertexAttribPointer(this.vPosition, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.vPosition);
        // Stick Color buffer
        this.stickCBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.stickCBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, sizeof['vec4'] * 5 * 2, gl.STATIC_DRAW);
        gl.vertexAttribPointer(this.vColor, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.vColor);
        // Stick Translate buffer
        this.stickTranslateBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.stickTranslateBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, sizeof['vec3'] * 5 * 4, gl.STATIC_DRAW);
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
        var world_destroyed = [];
        var world_indices = [];

        this.vec_to_offset = {};

        var x = 0;
        var y = 0;
        var z = 0;
        var start = new Date().getTime();
        for (var x = 0; x < model.worldX; x++)
        {
            for (var y = 0; y < model.worldY; y++)
            {
                for (var z = 0; z < model.worldZ; z++)
                {
                    if(this.render_block(x, y, z) == false)
                        continue;

                    // Get the start offset into world_colors
                    //var offset = this.idx_to_offset(vec3(x,y,z));
                    var offset = world_points.length;
                    //console.log(offset);

                    this.vec_to_offset[vec3(x,y,z)] = offset;
                    this.gen_indicies(world_indices, offset);

                    var tile = model.get_tile(vec3(x, y, z));
                    var tile_color = this.tile_to_color(tile);
                    this.gen_buffers(world_points, world_colors, world_translate, tile_color, vec3(x,y,z));

                    for(var i = 0; i < this.verts_per_block; i++)
                        world_destroyed.push(model.get_destroyed(vec3(x,y,z)) ? 1. : 0.);
                }
            }
        }
        var forLoopTs = new Date().getTime() - start;
        console.log("Buffer filling loop done. It took", forLoopTs, "ms.");

        console.log("Number of rendered vertices:", world_indices.length);
        console.log("Number of stored vertices:", world_points.length);

        this.block_indicies = world_indices.length;
        this.block_verts = world_points.length;

        var tsStart = new Date().getTime();
        // Buffer Color
        gl.bindBuffer(gl.ARRAY_BUFFER, this.worldTranslateBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(world_translate));
        // Buffer Color
        gl.bindBuffer(gl.ARRAY_BUFFER, this.worldCBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(world_colors));
        // Buffer Verticies
        gl.bindBuffer(gl.ARRAY_BUFFER, this.worldVBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(world_points));
        // Buffer Destroyed
        gl.bindBuffer(gl.ARRAY_BUFFER, this.worldDBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(world_destroyed));
        // Buffer Indicies
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.worldIndexBuffer);
        gl.bufferSubData(gl.ELEMENT_ARRAY_BUFFER, 0, new Uint32Array(world_indices));
        var tsDone = new Date().getTime() - tsStart;
        console.log('Buffer transfer finished in', tsDone, 'ms.');
    }

    // Stickman stuff
    private initialize_stick_man(pos) : any
    {
        var gl = this.gl;
        var height : number = 1.0 ;
        var back : number = 0.3;
        var front : number = 0.1;
        var feet : number = 0.2;
        var stick_points = [];

         // Front face
        stick_points.push(vec3(-back, feet,  front));
        stick_points.push(vec3(front, feet,  front));
        stick_points.push(vec3(front,  height,  front));
        stick_points.push(vec3(-back,  height,  front));

        // Back face
        stick_points.push(vec3(-back, feet, -back));
        stick_points.push(vec3(-back,  height, -back));
        stick_points.push(vec3(front,  height, -back));
        stick_points.push(vec3(front, feet, -back));

        // Top face
        stick_points.push(vec3(-back,  height, -back));
        stick_points.push(vec3(-back,  height,  front));
        stick_points.push(vec3(front,  height,  front));
        stick_points.push(vec3(front,  height, -back));

            // Bottom face
        stick_points.push(vec3(-back, feet, -back));
        stick_points.push(vec3(front, feet, -back));
        stick_points.push(vec3(front, feet,  front));
        stick_points.push(vec3(-back, feet,  front));

        // Right face
        stick_points.push(vec3(front, feet, -back));
        stick_points.push(vec3(front,  height, -back));
        stick_points.push(vec3(front,  height,  front));
        stick_points.push(vec3(front, feet,  front));

        // Left face
        stick_points.push(vec3(-back, feet, -back));
        stick_points.push(vec3(-back, feet,  front));
        stick_points.push(vec3(-back,  height,  front));
        stick_points.push(vec3(-back,  height, -back));

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

        this.theta += 0.1;
        gl.uniform1f(this.uTheta, this.theta);

        // Draw the mouse block
        if(this.mouse_lines != 0)
        {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.mouseCBuffer);
            gl.vertexAttribPointer(this.vColor, 4, gl.FLOAT, false, 0, 0);

            gl.bindBuffer(gl.ARRAY_BUFFER, this.mouseVBuffer);
            gl.vertexAttribPointer(this.vPosition, 3, gl.FLOAT, false, 0, 0);

            gl.bindBuffer(gl.ARRAY_BUFFER, this.mouseTranslateBuffer);
            gl.vertexAttribPointer(this.vTranslate, 3, gl.FLOAT, false, 0, 0);

            gl.drawArrays(gl.LINES, 0, this.mouse_lines);
        }

        // Draw the stickman
        if(this.stickman_lines != 0)
        {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.stickCBuffer);
            gl.vertexAttribPointer(this.vColor, 4, gl.FLOAT, false, 0, 0);

            gl.bindBuffer(gl.ARRAY_BUFFER, this.stickVBuffer);
            gl.vertexAttribPointer(this.vPosition, 3, gl.FLOAT, false, 0, 0);

            gl.bindBuffer(gl.ARRAY_BUFFER, this.stickTranslateBuffer);
            gl.vertexAttribPointer(this.vTranslate, 3, gl.FLOAT, false, 0, 0);

            gl.drawArrays(gl.TRIANGLE_FAN, 0, this.stickman_lines);
        }

        // Draw the world
        gl.bindBuffer(gl.ARRAY_BUFFER, this.worldCBuffer);
        gl.vertexAttribPointer(this.vColor, 4, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.worldVBuffer);
        gl.vertexAttribPointer(this.vPosition, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.worldTranslateBuffer);
        gl.vertexAttribPointer(this.vTranslate, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.worldDBuffer);
        gl.vertexAttribPointer(this.vDestroyed, 1, gl.FLOAT, false, 0, 0);

        // Extension for UNSIGNED INT element indicies
        // TODO: Check availability
        var ext = gl.getExtension("OES_element_index_uint");

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.worldIndexBuffer);
        gl.drawElements(gl.TRIANGLES, this.block_indicies, gl.UNSIGNED_INT, 0);

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
            case Tile.BEDROCK:
                return vec4(1., 1., 1., 1.);
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

        gl.bindBuffer(gl.ARRAY_BUFFER, this.worldVBuffer);
        var usage = sizeof['vec3'] * this.block_verts;
        var percentage = usage / gl.getBufferParameter(gl.ARRAY_BUFFER, gl.BUFFER_SIZE);
        console.log("vertex buffer usage: ", Math.round(percentage * 100), "%");

        gl.bindBuffer(gl.ARRAY_BUFFER, this.worldCBuffer);
        var usage = sizeof['vec4'] * this.block_verts;
        var percentage = usage / gl.getBufferParameter(gl.ARRAY_BUFFER, gl.BUFFER_SIZE);
        console.log("color buffer usage: ", Math.round(percentage * 100), "%");

        gl.bindBuffer(gl.ARRAY_BUFFER, this.worldTranslateBuffer);
        var usage = sizeof['vec3'] * this.block_verts;
        var percentage = usage / gl.getBufferParameter(gl.ARRAY_BUFFER, gl.BUFFER_SIZE);
        console.log("translate buffer usage: ", Math.round(percentage * 100), "%");

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.worldIndexBuffer);
        var usage = Uint32Array.BYTES_PER_ELEMENT * this.block_indicies;
        var percentage = usage / gl.getBufferParameter(gl.ELEMENT_ARRAY_BUFFER, gl.BUFFER_SIZE);
        console.log("index buffer usage: ", Math.round(percentage * 100), "%");
        
        var perspectiveMatrix = perspective(60, canvas.clientWidth / canvas.clientHeight, 0.1, 100.0);
        gl.uniformMatrix4fv(this.uPMatrix, false, flatten(perspectiveMatrix));

        this.model.on("update_tile", function(pos, tile)
        {
            var offset = this.vec_to_offset[pos];
            if(offset == undefined)
            {
                this.new_block(pos);
            }
            else
            {
                // Redraw the color of a block
                var tile_color = this.tile_to_color(tile);
                this.updateColor(offset, offset+this.verts_per_block, tile_color);
                // Update all adjacent blocks
                this.rebufferBlocks(pos);
            }

        }.bind(this));

        this.model.on("update_destroyed", function(pos, destroyed : boolean)
        {
            var offset = this.vec_to_offset[pos];
            if(offset == undefined)
            {
                console.log("DESTROYED NON EXISITING BLOCK!");
                alert("WHAT");
            }
            else
            {
                // Redraw the destroyed status of the block
                this.updateDestroyed(offset, offset+this.verts_per_block, destroyed);
                // Update all adjacent blocks
                this.rebufferBlocks(pos);
            }
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

        var update_placeblock = function() : void
        {
            var stick_pos = model.get_stickman_position().map(Math.round);
            var mouse_pos   = model.get_mouse_position();
            var block_pos = add(stick_pos, mouse_pos).map(Math.round);
            if(stick_pos == block_pos)
            {
                this.mouse_lines = 0;
            }
            else
            {
                //console.log(block_pos);
                var placeable = this.model.can_build(block_pos);
                this.initialize_mouse(block_pos, placeable);
            }
        }.bind(this);

        this.model.on("stickman_move", update_placeblock);
        this.model.on("mouse_move", update_placeblock);

/*
        this.model.on("stickman_move", function(stickman_pos)
        {
            var stick_pos = model.get_stickman_position().map(Math.round);
            var block_pos = stick_pos;
            if(stick_pos == block_pos)
            {
                this.stickman_lines = 0;
            }
            else
            {
                //console.log("Block pos: " + scale(0.5,block_pos));
                //console.log("Stickman Pos: " + model.get_stickman_position());
                this.initialize_stick_man(scale(0.5,block_pos));
            }

        }.bind(this));
        */
        update_camera();

        this.initialize_mouse(vec3(0,5,0), false);
        // Setup stickman
        //this.initialize_stick_man(model.get_stickman_position());

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
