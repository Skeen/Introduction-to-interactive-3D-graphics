import { Model } from "./Model";
import { Tile, TileUtil } from "./Tile"

declare var vec2: any;
declare var vec3: any;
declare var vec4: any;

declare var flatten: any;
declare var add: any;
declare var scale: any;
declare var radians: any;

declare var $:any;

declare var rotate: any;
declare var sizeof: any;
declare var mult: any;
declare var subtract: any;

declare var WebGLUtils: any;
declare var initShaders: any;

declare var ortho: any;
declare var perspective: any;
declare var lookAt: any;
/*
var colors = [
    [0.0,  1.0,  1.0,  1.0],    // Front face: cyan
    [1.0,  0.0,  0.0,  1.0],    // Back face: red
    [0.0,  1.0,  0.0,  1.0],    // Top face: green
    [0.0,  0.0,  1.0,  1.0],    // Bottom face: blue
    [1.0,  1.0,  0.0,  1.0],    // Right face: yellow
    [1.0,  0.0,  1.0,  1.0]     // Left face: purple
];
*/
var normals = [
    // Front face
    [0.0, 0.0,  1.0],
    [0.0, 0.0,  1.0],
    [0.0, 0.0,  1.0],
    [0.0, 0.0,  1.0],
    [0.0, 0.0,  1.0],
    [0.0, 0.0,  1.0],

    // Back face
    [0.0, 0.0,  -1.0],
    [0.0, 0.0,  -1.0],
    [0.0, 0.0,  -1.0],
    [0.0, 0.0,  -1.0],
    [0.0, 0.0,  -1.0],
    [0.0, 0.0,  -1.0],

    // Top face
    [0.0, 1.0,  0.0],
    [0.0, 1.0,  0.0],
    [0.0, 1.0,  0.0],
    [0.0, 1.0,  0.0],
    [0.0, 1.0,  0.0],
    [0.0, 1.0,  0.0],

    // Bottom face
    [0.0, -1.0,  0.0],
    [0.0, -1.0,  0.0],
    [0.0, -1.0,  0.0],
    [0.0, -1.0,  0.0],
    [0.0, -1.0,  0.0],
    [0.0, -1.0,  0.0],

    // Right face
    [1.0, 0.0,  0.0],
    [1.0, 0.0,  0.0],
    [1.0, 0.0,  0.0],
    [1.0, 0.0,  0.0],
    [1.0, 0.0,  0.0],
    [1.0, 0.0,  0.0],

    // Left face
    [-1.0, 0.0,  0.0],
    [-1.0, 0.0,  0.0],
    [-1.0, 0.0,  0.0],
    [-1.0, 0.0,  0.0],
    [-1.0, 0.0,  0.0],
    [-1.0, 0.0,  0.0],
];
var vertices = [
    // Front face (1)
    [-0.5, -0.5,  0.5],
    [ 0.5, -0.5,  0.5],
    [ 0.5,  0.5,  0.5],
    // Front face (2)
    [-0.5, -0.5,  0.5],
    [ 0.5,  0.5,  0.5],
    [-0.5,  0.5,  0.5],

    // Back face (1)
    [-0.5, -0.5, -0.5],
    [-0.5,  0.5, -0.5],
    [ 0.5,  0.5, -0.5],
    // Back face (2)
    [-0.5, -0.5, -0.5],
    [ 0.5,  0.5, -0.5],
    [ 0.5, -0.5, -0.5],

    // Top face (1)
    [-0.5,  0.5, -0.5],
    [-0.5,  0.5,  0.5],
    [ 0.5,  0.5,  0.5],
    // Top face (2)
    [-0.5,  0.5, -0.5],
    [ 0.5,  0.5,  0.5],
    [ 0.5,  0.5, -0.5],

    // Bottom face (1)
    [-0.5, -0.5, -0.5],
    [ 0.5, -0.5, -0.5],
    [ 0.5, -0.5,  0.5],
    // Bottom face (2)
    [-0.5, -0.5, -0.5],
    [ 0.5, -0.5,  0.5],
    [-0.5, -0.5,  0.5],

    // Right face (1)
    [ 0.5, -0.5, -0.5],
    [ 0.5,  0.5, -0.5],
    [ 0.5,  0.5,  0.5],
    // Right face (2)
    [ 0.5, -0.5, -0.5],
    [ 0.5,  0.5,  0.5],
    [ 0.5, -0.5,  0.5],

    // Left face (1)
    [-0.5, -0.5, -0.5],
    [-0.5, -0.5,  0.5],
    [-0.5,  0.5,  0.5],
    // Left face (2)
    [-0.5, -0.5, -0.5],
    [-0.5,  0.5,  0.5],
    [-0.5,  0.5, -0.5]
];

var textureCoords = [
    // Front face (1)
    [0, 0],
    [1, 0],
    [1, 1],
    // Front face (2)
    [0, 0],
    [1, 1],
    [0, 1]
];

export class View
{
    private model : Model;

    // TODO: Fix type
    private canvas : any;
    private gl : any;

    //private program : any;
    private boxShaderProgram : any;
    private mouseShaderProgram : any;

    // Texture variables
    private tileTexture : any;

    // Number of full world lines to buffer
    private worldBufferLayers = 10;

    // Shader variables
    //-----------------
    // Blocks
    private vPosition;
    private vNormal;
    private vTile;
    private vTranslate;
    private vTexCoord;
    private vDestroyed;

    private uPMatrix; 
    private uMVMatrix; 
    private uTheta;
    private uTextureMap;

    // Mouse
    private vM_Position;
    private vM_Color;
    private vM_Translate;

    private uM_PMatrix;
    private uM_MVMatrix;

    // Buffers
    //--------
    // Shared
    private cubeVertexBuffer : WebGLBuffer;
    private cubeTextureBuffer : WebGLBuffer;
    private cubeNormalBuffer : WebGLBuffer;
    // Blocks
    private worldTileBuffer : WebGLBuffer;
    private worldDBuffer : WebGLBuffer;
    private worldTranslateBuffer : WebGLBuffer;
    private worldCBuffer : WebGLBuffer;
    // Stick figure
    private stickVBuffer : WebGLBuffer;
    private stickCBuffer : WebGLBuffer;
    private stickTranslateBuffer : WebGLBuffer;
    private stickIndexBuffer : WebGLBuffer;
    // Mouse
    private mouseColorBuffer : WebGLBuffer;
    private mouseTranslateBuffer : WebGLBuffer;
    private mouseIndexBuffer : WebGLBuffer;

    // Sun
    private sunColorBuffer : WebGLBuffer;
    private sunTranslateBuffer : WebGLBuffer;

    // Game related stuff.
    // world variables
    private verts_per_block : number = 36;
    //private stick_man_num_points : number;

    // Fix this
    private draw_mouse : boolean = false;
    private blocks : number = 0;
    private vec_to_offset;
    private theta : number = 0;

    private stickman_lines : number = 0;
    private rotation_stick_man : number = 0.0;
    // Shockwave variables
    //private shockwave_duration : number = 1000;
    //private timerId;

    /*
    private gen_colors(arr_c, tile_color)
    {
        for(var i = 0; i < this.verts_per_block/6; i++)
        {
            arr_c.push(colors[i]);
        }
    }
    */

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
            empty_found = empty_found || TileUtil.is_sink_block(tile) || (model.get_destroyed(pos) == model.FULLY_DESTROYED);
        }
        for(var j = -1; j <= 1; j+=2)
        {
            var pos = vec3(x, y+j, z);
            if(model.valid_index(pos) == false)
                continue;
            var tile = model.get_tile(pos);
            empty_found = empty_found || TileUtil.is_sink_block(tile) || (model.get_destroyed(pos) == model.FULLY_DESTROYED);
        }
        for(var k = -1; k <= 1; k+=2)
        {
            var pos = vec3(x, y, z+k);
            if(model.valid_index(pos) == false)
                continue;
            var tile = model.get_tile(pos);
            empty_found = empty_found || TileUtil.is_sink_block(tile) || (model.get_destroyed(pos) == model.FULLY_DESTROYED);
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

        var block_tile = [];
        var block_translate = [];
        var block_destroyed = [];
        var block_color = [];

        // Get the offset for this new block
        var offset = this.blocks;
        this.blocks++;
        this.vec_to_offset[pos] = offset;

        var tile = model.get_tile(pos);

        block_tile.push(this.tile_to_texture_coord(tile));
        block_translate.push(pos);
        block_destroyed.push(this.model.get_destroyed(pos));
        block_color.push(vec4(pos[0] / model.worldX, pos[1] / model.worldY, pos[2] / model.worldZ, 1.0));

        // Buffer Tile
        gl.bindBuffer(gl.ARRAY_BUFFER, this.worldTileBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, offset * sizeof['vec2'], flatten(block_tile));

        // Buffer Translate
        gl.bindBuffer(gl.ARRAY_BUFFER, this.worldTranslateBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, offset * sizeof['vec3'], flatten(block_translate));

        // Buffer Destroyed
        gl.bindBuffer(gl.ARRAY_BUFFER, this.worldDBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, offset * Float32Array.BYTES_PER_ELEMENT, new Float32Array(block_destroyed));

        // Buffer Color
        gl.bindBuffer(gl.ARRAY_BUFFER, this.worldCBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, offset * sizeof['vec4'], flatten(block_color));
    }

    private update_block(pos)
    {
        var model = this.model;
        var gl = this.gl;

        var offset = this.vec_to_offset[pos];
        if(offset == undefined)
        {
            this.new_block(pos);
        }
        else
        {
            // Redraw the destroyed status of the block
            var destroyed : number = model.get_destroyed(pos);
            this.updateDestroyed(offset, offset + 1, destroyed);
            // Redraw the tile of the block
            var tile : Tile = model.get_tile(pos);
            this.updateTile(offset, offset + 1, tile);
            // Redraw the color of the block
            this.updateColor(offset, offset + 1, pos, tile);
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

                    if (this.model.valid_index(vec3(x+i, y+j, z+k)) == false)
                        continue;

                    if(this.render_block(x+i, y+j, z+k) == false)
                        continue;

                    this.update_block(vec3(x+i, y+j, z+k));
                }
            }
        }
    }

    private updateColor(start, end, pos, tile) : void
    {
        var gl = this.gl;
        var model = this.model;

        var color;
        if(tile == Tile.EMPTY)
            color = vec4(0., 0., 0., 0.);
        else
            color = vec4(pos[0] / model.worldX, pos[1] / model.worldY, pos[2] / model.worldZ, 1.0);

        var replace_values = [];
        for(var i = 0; i < (end - start); i++)
        {
            replace_values.push(color);
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, this.worldCBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, start*sizeof['vec4'], flatten(replace_values));
    }

    private updateTile(start, end, tile) : void
    {
        var gl = this.gl;

        var texture_offset = this.tile_to_texture_coord(tile);

        var replace_values = [];
        for(var i = 0; i < (end - start); i++)
        {
            replace_values.push(texture_offset);
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, this.worldTileBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, start*sizeof['vec2'], flatten(replace_values));
    }

    private updateDestroyed(start, end, destroyed : number) : void
    {
        var gl = this.gl;

        var replace_values = [];
        for(var i = 0; i < (end - start); i++)
        {
            replace_values.push(destroyed);

        }
        gl.bindBuffer(gl.ARRAY_BUFFER, this.worldDBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, start*Float32Array.BYTES_PER_ELEMENT, flatten(replace_values));
    }

    // Initialize WebGL render context.
    private initWebGL() : void
    {
        var canvas = document.getElementById("gl-canvas");
        var gl = WebGLUtils.setupWebGL(canvas);

        if (!gl)
        {
            alert("Unable to setup WebGL!");
            return;
        }
        gl.viewport(0, 0, canvas.clientWidth, canvas.clientHeight);
        gl.clearColor(0.7, 0.7, 1.0, 1.);

        gl.clearDepth(1.0);
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);            

        gl.enable(gl.CULL_FACE);
        gl.cullFace(gl.BACK);

        gl.lineWidth(2);

        this.boxShaderProgram   = initShaders(gl, "block-vertex-shader.glsl", "block-fragment-shader.glsl");
        this.mouseShaderProgram = initShaders(gl, "mouse-vertex-shader.glsl", "mouse-fragment-shader.glsl");
        this.canvas = canvas;
        this.gl = gl;
    }

    // Initialize buffers.
    private initBuffers() : void
    {
        var gl = this.gl;
        var model = this.model;

        this.renderBuffer = gl.createRenderbuffer();

        gl.useProgram(this.boxShaderProgram);

        // Get Shader variable positions
        this.vPosition  = gl.getAttribLocation(this.boxShaderProgram, "vPosition");
        this.vNormal    = gl.getAttribLocation(this.boxShaderProgram, "vNormal");
        this.vTile      = gl.getAttribLocation(this.boxShaderProgram, "vTile");
        this.vTranslate = gl.getAttribLocation(this.boxShaderProgram, 'vTranslate');
        this.vTexCoord  = gl.getAttribLocation(this.boxShaderProgram, 'vTexCoord');
        this.vDestroyed = gl.getAttribLocation(this.boxShaderProgram, "vDestroyed");

        this.uPMatrix    = gl.getUniformLocation(this.boxShaderProgram, "uPMatrix");
        this.uMVMatrix   = gl.getUniformLocation(this.boxShaderProgram, "uMVMatrix");
        this.uTheta      = gl.getUniformLocation(this.boxShaderProgram, "uTheta");
        this.uTextureMap = gl.getUniformLocation(this.boxShaderProgram, "uTextureMap");

        // Cube Vertex buffer
        this.cubeVertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.cubeVertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, sizeof['vec3'] * this.verts_per_block, gl.STATIC_DRAW);
        gl.vertexAttribPointer(this.vPosition, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.vPosition);
        var cubeVertexBufferSize = gl.getBufferParameter(gl.ARRAY_BUFFER, gl.BUFFER_SIZE);
        // Cube Texture buffer
        this.cubeTextureBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.cubeTextureBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, sizeof['vec2'] * this.verts_per_block, gl.STATIC_DRAW);
        gl.vertexAttribPointer(this.vTexCoord, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.vTexCoord);
        var cubeTextureBufferSize = gl.getBufferParameter(gl.ARRAY_BUFFER, gl.BUFFER_SIZE);
        // Cube Normal buffer
        this.cubeNormalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.cubeNormalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, sizeof['vec3'] * this.verts_per_block, gl.STATIC_DRAW);
        gl.vertexAttribPointer(this.vNormal, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.vNormal);
        var cubeNormalBufferSize = gl.getBufferParameter(gl.ARRAY_BUFFER, gl.BUFFER_SIZE);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW);

        // World Tile buffer
        this.worldTileBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.worldTileBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, sizeof['vec2'] * model.worldX * model.worldZ * this.worldBufferLayers, gl.STATIC_DRAW);
        gl.vertexAttribPointer(this.vTile, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.vTile);
        var worldTileBufferSize = gl.getBufferParameter(gl.ARRAY_BUFFER, gl.BUFFER_SIZE);
        // World Translate buffer
        this.worldTranslateBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.worldTranslateBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, sizeof['vec3'] * model.worldX * model.worldZ * this.worldBufferLayers, gl.STATIC_DRAW);
        gl.vertexAttribPointer(this.vTranslate, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.vTranslate);
        var worldTranslateBufferSize = gl.getBufferParameter(gl.ARRAY_BUFFER, gl.BUFFER_SIZE);
        // World Destroyed buffer
        this.worldDBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.worldDBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, Float32Array.BYTES_PER_ELEMENT * model.worldX * model.worldZ * this.worldBufferLayers, gl.STATIC_DRAW);
        gl.vertexAttribPointer(this.vDestroyed, 1, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.vDestroyed);
        var worldDBufferSize = gl.getBufferParameter(gl.ARRAY_BUFFER, gl.BUFFER_SIZE);

        // World color
        this.worldCBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.worldCBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, sizeof['vec4'] * model.worldX * model.worldZ * this.worldBufferLayers, gl.STATIC_DRAW);
        gl.vertexAttribPointer(this.vM_Color, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.vM_Color);

        function formatBytes(bytes, decimals)
        {
            if(bytes == 0)
                return [ 0, 'Byte' ];

            var k = 1000; // or 1024 for binary
            var dm = decimals + 1 || 3;
            var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
            var i = Math.floor(Math.log(bytes) / Math.log(k));
            return [ parseFloat((bytes / Math.pow(k, i)).toFixed(dm)), sizes[i] ];
        }

        function output(array)
        {
            var array = [].concat.apply([], array);
            console.log.apply(console, array);
        }

        // Output memory usage information
        output(["Total World Vertex memory consumption:",       formatBytes(cubeVertexBufferSize, 1)]);
        output(["Total World Texture memory consumption:",      formatBytes(cubeTextureBufferSize, 1)]);
        output(["Total World Normal memory consumption:",       formatBytes(cubeNormalBufferSize, 1)]);
        output(["Total World Tile memory consumption:",         formatBytes(worldTileBufferSize, 1)]);
        output(["Total World Destroyed memory consumption:",    formatBytes(worldDBufferSize, 1)]);
        output(["Total World Translate memory consumption:",    formatBytes(worldTranslateBufferSize, 1)]);
        output(["Total World GPU memory consumption:",          formatBytes(worldTileBufferSize + worldDBufferSize + worldTranslateBufferSize, 2)]);

        // Mouse
        gl.useProgram(this.mouseShaderProgram);

        this.vM_Position  = gl.getAttribLocation(this.mouseShaderProgram, "vPosition");
        this.vM_Color     = gl.getAttribLocation(this.mouseShaderProgram, "vColor");
        this.vM_Translate = gl.getAttribLocation(this.mouseShaderProgram, "vTranslate");

        this.uM_PMatrix    = gl.getUniformLocation(this.mouseShaderProgram, "uPMatrix");
        this.uM_MVMatrix   = gl.getUniformLocation(this.mouseShaderProgram, "uMVMatrix");
        // Stick Vertex buffer
        this.stickVBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.stickVBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, sizeof['vec3'] * 5 * 2, gl.STATIC_DRAW);
        gl.vertexAttribPointer(this.vM_Position, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.vM_Position);
        // Stick Color buffer
        this.stickCBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.stickCBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, sizeof['vec4'] * 5 * 2, gl.STATIC_DRAW);
        gl.vertexAttribPointer(this.vM_Color, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.vM_Color);
        // Stick Translate buffer
        this.stickTranslateBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.stickTranslateBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, sizeof['vec3'] * 5 * 4, gl.STATIC_DRAW);
        gl.vertexAttribPointer(this.vM_Translate, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.vM_Translate);

        // Mouse Translate buffer
        this.mouseTranslateBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.mouseTranslateBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, sizeof['vec3'], gl.STATIC_DRAW);
        gl.vertexAttribPointer(this.vM_Translate, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.vM_Translate);
        // Mouse Destroyed buffer
        this.mouseColorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.mouseColorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, sizeof['vec4'], gl.STATIC_DRAW);
        gl.vertexAttribPointer(this.vM_Color, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.vM_Color);
        // Mouse Index buffer
        this.mouseIndexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.mouseIndexBuffer);
        var mouseVertexIndices = [
        // Bottom
            18, 19,
            18, 23,
            19, 20,
            20, 23,
        // Top
            12, 13,
            12, 17,
            13, 14,
            14, 17,
        // Corners
            6, 12,
            11, 17,
            0, 5,
            1, 4
        ];
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(mouseVertexIndices), gl.STATIC_DRAW);


        // Sun Translate buffer
        this.sunTranslateBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.sunTranslateBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, sizeof['vec3'], gl.STATIC_DRAW);
        gl.vertexAttribPointer(this.vM_Translate, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.vM_Translate);

        gl.bufferData(gl.ARRAY_BUFFER, flatten([vec4(0., this.model.worldY + 10., 0., 1.)]), gl.STATIC_DRAW);

        // Sun Color buffer
        this.sunColorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.sunColorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, sizeof['vec4'], gl.STATIC_DRAW);
        gl.vertexAttribPointer(this.vM_Color, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.vM_Color);

        gl.bufferData(gl.ARRAY_BUFFER, flatten([vec4(1., 1., 0., 1.)]), gl.STATIC_DRAW);
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

    private initialize_textures() : void
    {
        var gl = this.gl;

        var image = document.getElementById("tileTextureImage");

        this.tileTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.tileTexture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.generateMipmap(gl.TEXTURE_2D);

        gl.useProgram(this.boxShaderProgram);
        gl.uniform1i(this.uTextureMap, this.tileTexture);
    }

    private initialize_block_world() : void
    {
        var gl = this.gl;
        var model = this.model;

        var world_tile = [];
        var world_translate = [];
        var world_destroyed = [];
        var world_color = [];

        this.vec_to_offset = {};

        this.blocks = 0;

        var start = new Date().getTime();
        for (var x = 0; x < model.worldX; x++)
        {
            for (var y = 0; y < model.worldY; y++)
            {
                for (var z = 0; z < model.worldZ; z++)
                {
                    if(this.render_block(x, y, z) == false)
                        continue;

                    this.vec_to_offset[vec3(x,y,z)] = this.blocks;
                    this.blocks = this.blocks + 1;

                    var pos = vec3(x, y, z);
                    var tile = model.get_tile(pos);

                    world_tile.push(this.tile_to_texture_coord(tile));
                    world_translate.push(pos);
                    world_destroyed.push(model.get_destroyed(pos));
                    world_color.push(vec4(x / model.worldX, y / model.worldY, z / model.worldZ, 1.0));
                }
            }
        }

        var forLoopTs = new Date().getTime() - start;
        console.log("Buffer filling loop done. It took", forLoopTs, "ms.");

        console.log("Rendering:", this.blocks, "blocks");

        //console.log("Number of rendered vertices:", world_indices.length);
        // console.log("Number of stored vertices:", world_colors.length);

        //this.block_indicies = world_indices.length;
        //this.block_verts = world_colors.length;

        var tsStart = new Date().getTime();
        // Buffer Color
        var world_points = []
        for(var i = 0; i < this.verts_per_block; i++)
        {
            world_points.push(vec3(vertices[i]));
        }
        // Buffer Verticies
        gl.bindBuffer(gl.ARRAY_BUFFER, this.cubeVertexBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(world_points));

        var world_texture = [];
        for(var i = 0; i < this.verts_per_block/6; i++)
        {
            for(var j = 0; j < this.verts_per_block/6; j++)
            {
                world_texture.push(vec2(textureCoords[j]));
            }
        }
        // Buffer Texture
        gl.bindBuffer(gl.ARRAY_BUFFER, this.cubeTextureBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(world_texture));

        // Buffer Color
        gl.bindBuffer(gl.ARRAY_BUFFER, this.worldTileBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(world_tile));

        // Buffer Translate
        gl.bindBuffer(gl.ARRAY_BUFFER, this.worldTranslateBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(world_translate));

        // Buffer Destroyed
        gl.bindBuffer(gl.ARRAY_BUFFER, this.worldDBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(world_destroyed));

        // Buffer Translate
        gl.bindBuffer(gl.ARRAY_BUFFER, this.worldCBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(world_color));

        var tsDone = new Date().getTime() - tsStart;
        console.log('Buffer transfer finished in', tsDone, 'ms.');
    }


    // Stickman stuff
    private initialize_stick_man(pos, rotation) : any
    {
        var gl = this.gl;
        var height : number = 1.0;
        var width : number = 0.1;
        var front : number = 0.1;
        var feet : number = 0.2;
        var stick_points = [];
        var torch_points = [];
        //body
         // Front face
        stick_points.push(vec3(-width, feet,  front));
        stick_points.push(vec3(width, feet,  front));
        stick_points.push(vec3(width,  height,  front));
        stick_points.push(vec3(width,  height,  front));
        stick_points.push(vec3(-width,  height,  front));
        stick_points.push(vec3(-width, feet,  front));

        // Back face
        stick_points.push(vec3(-width, feet, -front));
        stick_points.push(vec3(-width,  height, -front));
        stick_points.push(vec3(width,  height, -front));
        stick_points.push(vec3(width,  height, -front));
        stick_points.push(vec3(width, feet, -front));
        stick_points.push(vec3(-width, feet, -front));

        // Top face
        stick_points.push(vec3(-width,  height, -front));
        stick_points.push(vec3(-width,  height,  front));
        stick_points.push(vec3(width,  height,  front));
        stick_points.push(vec3(width,  height,  front));
        stick_points.push(vec3(width,  height, -front));
        stick_points.push(vec3(-width,  height, -front));

            // Bottom face
        stick_points.push(vec3(-width, feet, -front));
        stick_points.push(vec3(width, feet, -front));
        stick_points.push(vec3(width, feet,  front));
        stick_points.push(vec3(width, feet,  front));
        stick_points.push(vec3(-width, feet,  front));
        stick_points.push(vec3(-width, feet, -front));

        // Right face
        stick_points.push(vec3(width, feet, -front));
        stick_points.push(vec3(width,  height, -front));
        stick_points.push(vec3(width,  height,  front));
        stick_points.push(vec3(width,  height,  front));
        stick_points.push(vec3(width, feet,  front));
        stick_points.push(vec3(width, feet, -front));

        // Left face
        stick_points.push(vec3(-width, feet, -front));
        stick_points.push(vec3(-width, feet,  front));
        stick_points.push(vec3(-width,  height,  front));
        stick_points.push(vec3(-width,  height,  front));
        stick_points.push(vec3(-width,  height, -front));
        stick_points.push(vec3(-width, feet, -front));

        var p = rotate(90,vec3(1,0,0));
        var shoulder = vec4(0.4,0.7,0.1,0);
        //var tp = subtract(p-shoulder);

        //Torch
        //Front face
        //console.log(p);
        torch_points.push(vec4(width, 0.4,  0.1,1));
        torch_points.push(vec4(width+0.1, 0.4,  0.1,1));
        torch_points.push(vec4(width+0.1,  0.7,  0.1,1));
        torch_points.push(vec4(width+0.1,  0.7,  0.1,1));
        torch_points.push(vec4(width,  0.7,  0.1,1));
        torch_points.push(vec4(width, 0.4,  0.1,1));

        // Back face
        torch_points.push(vec4(width, 0.4, 0.0,1));
        torch_points.push(vec4(width,  0.7, 0.0,1));
        torch_points.push(vec4(width+0.1,  0.7, 0.0,1));
        torch_points.push(vec4(width+0.1,  0.7, 0.0,1));
        torch_points.push(vec4(width+0.1, 0.4, 0.0,1));
        torch_points.push(vec4(width, 0.4, 0.0,1));

        // Top face
        torch_points.push(vec4(width,  0.7, 0.0,1));
        torch_points.push(vec4(width,  0.7,  0.1,1));
        torch_points.push(vec4(width+0.1,  0.7,  0.1,1));
        torch_points.push(vec4(width+0.1,  0.7,  0.1,1));
        torch_points.push(vec4(width+0.1,  0.7, 0.0,1));
        torch_points.push(vec4(width,  0.7, 0.0,1));

        // Bottom face
        torch_points.push(vec4(width, 0.4, 0.0,1));
        torch_points.push(vec4(width+0.1, 0.4, 0.0,1));
        torch_points.push(vec4(width+0.1, 0.4,  0.1,1));
        torch_points.push(vec4(width+0.1, 0.4,  0.1,1));
        torch_points.push(vec4(width, 0.4,  0.1,1));
        torch_points.push(vec4(width, 0.4, 0.0,1));

        // Right face
        torch_points.push(vec4(width+0.1, 0.4, 0,1));
        torch_points.push(vec4(width+0.1,  0.7, 0.0,1));
        torch_points.push(vec4(width+0.1,  0.7,  0.1,1));
        torch_points.push(vec4(width+0.1,  0.7,  0.1,1));
        torch_points.push(vec4(width+0.1, 0.4,  0.1,1));
        torch_points.push(vec4(width+0.1, 0.4, 0,1,1));
        // Left face

        torch_points.push(vec4(width, 0.4, 0,1, 1));
        torch_points.push(vec4(width, 0.4,  0.1,1));
        torch_points.push(vec4(width,  0.7,  0.1,1));
        torch_points.push(vec4(width,  0.7,  0.1,1));
        torch_points.push(vec4(width,  0.7, 0,1, 1));
        torch_points.push(vec4(width, 0.4, 0,1, 1));

        var rotation_stick = rotation * (180/Math.PI);

        var mouse_rot = rotate(-rotation_stick + 270,vec3(0,1,0));
        for(var i = 0; i < torch_points.length; i++)
        {
            stick_points.push(vec3(add(mult(p,subtract(torch_points[i],shoulder)), shoulder)));
        }
        var stick_colors = [];
        var stick_translate = [];
        var rot_point = vec4(0.0,0.2,0.0,0);
        if(stick_points.length !== 72)
        {
            console.log("Odd stick points length: "+stick_points.length);
        }
        var fix_point = vec4(0.0, 0.2, 0., 0.);
        for(var i = 0; i < stick_points.length; i++)
        {
            var new_pos = vec3(pos[0], pos[1], pos[2]);
            //var new_pos = vec3(0,1,0);
            stick_translate.push(new_pos);
            stick_points[i] = (vec3(add(mult(mouse_rot,subtract(vec4(stick_points[i],1),rot_point)), fix_point)));
            if(i<stick_points.length/2)
            {
                stick_colors.push(vec4(1,0.72,0.6,1));
            }
            //skin color
            else
            {
                //console.log("Else branch: " + i);
                stick_colors.push(vec4(0.55,0.32,0.07,1));
            }
        }
        //console.log("Stick colors: " + stick_colors);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.stickCBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(stick_colors), gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.stickVBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(stick_points), gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.stickTranslateBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(stick_translate), gl.STATIC_DRAW);

        this.stickman_lines = stick_points.length;
        //console.log("stick points length: " + stick_points.length);
    }

    private sunRadius:number;
    private sunSpeedDivisor:number = 500;
    private sunTheta:number = 0;

    private render() : void
    {
        var sunLoc = vec4(this.sunRadius * Math.cos(this.sunTheta) + (this.model.worldX / 2), this.sunRadius * Math.sin(this.sunTheta) + (this.model.worldY / 2), (this.model.worldZ / 2), 0);

        var gl = this.gl;
        var canvas = this.canvas;

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // Instanced rendering extension
        var ext_angle = gl.getExtension("ANGLE_instanced_arrays");
        if(!ext_angle)
        {
            console.log("'ANGLE_instanced_arrays' extension not available!");
            alert("FUCK");
        }
        // Draw the mouse block
        if(this.draw_mouse == true)
        {
            gl.useProgram(this.mouseShaderProgram);

            gl.bindBuffer(gl.ARRAY_BUFFER, this.cubeVertexBuffer);
            gl.vertexAttribPointer(this.vM_Position, 3, gl.FLOAT, false, 0, 0);
            ext_angle.vertexAttribDivisorANGLE(this.vM_Position, 0);

            gl.bindBuffer(gl.ARRAY_BUFFER, this.mouseTranslateBuffer);
            gl.vertexAttribPointer(this.vM_Translate, 3, gl.FLOAT, false, 0, 0);
            ext_angle.vertexAttribDivisorANGLE(this.vM_Translate, 1);

            gl.bindBuffer(gl.ARRAY_BUFFER, this.mouseColorBuffer);
            gl.vertexAttribPointer(this.vM_Color, 4, gl.FLOAT, false, 0, 0);
            ext_angle.vertexAttribDivisorANGLE(this.vM_Color, 1);

            // Draw all the blocks!
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.mouseIndexBuffer);
            ext_angle.drawElementsInstancedANGLE(gl.LINES, 12 * 2, gl.UNSIGNED_BYTE, 0, 1);
        }

        gl.useProgram(this.mouseShaderProgram);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.cubeVertexBuffer);
        gl.vertexAttribPointer(this.vM_Position, 3, gl.FLOAT, false, 0, 0);
        ext_angle.vertexAttribDivisorANGLE(this.vM_Position, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.sunTranslateBuffer);
        gl.vertexAttribPointer(this.vM_Translate, 3, gl.FLOAT, false, 0, 0);
        ext_angle.vertexAttribDivisorANGLE(this.vM_Translate, 1);

        gl.bufferData(gl.ARRAY_BUFFER, flatten([sunLoc]), gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.sunColorBuffer);
        gl.vertexAttribPointer(this.vM_Color, 4, gl.FLOAT, false, 0, 0);
        ext_angle.vertexAttribDivisorANGLE(this.vM_Color, 1);

        // Draw all the blocks!
        ext_angle.drawArraysInstancedANGLE(gl.TRIANGLES, 0, this.verts_per_block, 1);

        // Draw the stickman
        //console.log(this.stickman_lines);

        if(this.stickman_lines != 0)
        {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.stickCBuffer);
            gl.vertexAttribPointer(this.vM_Color, 4, gl.FLOAT, false, 0, 0);
            ext_angle.vertexAttribDivisorANGLE(this.vM_Color, 0);

            gl.bindBuffer(gl.ARRAY_BUFFER, this.stickVBuffer);
            gl.vertexAttribPointer(this.vM_Position, 3, gl.FLOAT, false, 0, 0);
            ext_angle.vertexAttribDivisorANGLE(this.vM_Position, 0);

            gl.bindBuffer(gl.ARRAY_BUFFER, this.stickTranslateBuffer);
            gl.vertexAttribPointer(this.vM_Translate, 3, gl.FLOAT, false, 0, 0);
            ext_angle.vertexAttribDivisorANGLE(this.vM_Translate, 0);

            ext_angle.drawArraysInstancedANGLE(gl.TRIANGLES, 0, this.stickman_lines, 1);
        }

        // Draw the world
        gl.useProgram(this.boxShaderProgram);

        // Update theta for destroyed cubes
        this.theta = this.theta + 0.1;
        gl.uniform1f(this.uTheta, this.theta);
        gl.uniform4fv(gl.getUniformLocation(this.boxShaderProgram, 'vSunLoc'), sunLoc);

        // Load in cube buffers
        // Reuse cube vertices for all blocks
        gl.bindBuffer(gl.ARRAY_BUFFER, this.cubeVertexBuffer);
        gl.vertexAttribPointer(this.vPosition, 3, gl.FLOAT, false, 0, 0);
        ext_angle.vertexAttribDivisorANGLE(this.vPosition, 0);
        // Reuse texture vertices for all blocks
        gl.bindBuffer(gl.ARRAY_BUFFER, this.cubeTextureBuffer);
        gl.vertexAttribPointer(this.vTexCoord, 2, gl.FLOAT, false, 0, 0);
        ext_angle.vertexAttribDivisorANGLE(this.vTexCoord, 0);
        // Reuse cube normals for all blocks
        gl.bindBuffer(gl.ARRAY_BUFFER, this.cubeNormalBuffer);
        gl.vertexAttribPointer(this.vNormal, 3, gl.FLOAT, false, 0, 0);
        ext_angle.vertexAttribDivisorANGLE(this.vNormal, 0);

        // Use 1 tile for each block
        gl.bindBuffer(gl.ARRAY_BUFFER, this.worldTileBuffer);
        gl.vertexAttribPointer(this.vTile, 2, gl.FLOAT, false, 0, 0);
        ext_angle.vertexAttribDivisorANGLE(this.vTile, 1);
        // Use 1 translate for each block
        gl.bindBuffer(gl.ARRAY_BUFFER, this.worldTranslateBuffer);
        gl.vertexAttribPointer(this.vTranslate, 3, gl.FLOAT, false, 0, 0);
        ext_angle.vertexAttribDivisorANGLE(this.vTranslate, 1);
        // Use 1 destroyed status for each block
        gl.bindBuffer(gl.ARRAY_BUFFER, this.worldDBuffer);
        gl.vertexAttribPointer(this.vDestroyed, 1, gl.FLOAT, false, 0, 0);
        ext_angle.vertexAttribDivisorANGLE(this.vDestroyed, 1);
        // Bind the texture
        gl.bindTexture(gl.TEXTURE_2D, this.tileTexture);

        // Draw all the blocks!
        ext_angle.drawArraysInstancedANGLE(gl.TRIANGLES, 0, this.verts_per_block, this.blocks);

        // Request new frame
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

    private tile_to_texture_coord(tile : Tile) : any
    {
        function tile_to_texture_coord_worker(tile : Tile) : any
        {
            switch(tile)
            {
                case Tile.EMPTY:
                    return vec2(-1, -1);
                case Tile.STONE:
                    return vec2(0/16, 14/16);
                case Tile.GRASS:
                    return vec2(3/16, 15/16);
                case Tile.DIRT:
                    return vec2(2/16, 15/16);
                case Tile.WOOD:
                    return vec2(4/16, 15/16);
                case Tile.METAL:
                    return vec2(5/16, 15/16);
                case Tile.WATER:
                    return vec2(0/16+0.002, 6/16-0.001);
                case Tile.FIRE:
                    return vec2(14/16, 0/16);
                case Tile.BEDROCK:
                    return vec2(7/16, 4/16);
                default:
                    console.log("Invalid tile, cannot convert to texture!");
                    // Purple tile
                    return vec2(10/16, 2/16);
            }
        }
        var optimal = tile_to_texture_coord_worker(tile);
        //var offset = 1 / 16 / 16 / 2;
        //var offset = 0;
        var offset = 0;
        return vec2(optimal[0] + offset, optimal[1] - offset);
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

        var color = (placeable ? vec4(1., 1., 1., 1.) : vec4(1., 0., 0., 0.));

        var mouse_color = [];
        mouse_color.push(color);

        var mouse_translate = [];
        mouse_translate.push(pos);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.mouseColorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(mouse_color), gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.mouseTranslateBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(mouse_translate), gl.STATIC_DRAW);

        this.draw_mouse = true;
    }

    private output_buffer_usage() : void
    {
        var gl = this.gl;

        gl.useProgram(this.boxShaderProgram);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.worldTileBuffer);
        var usage = sizeof['vec2'] * this.blocks;
        var percentage = usage / gl.getBufferParameter(gl.ARRAY_BUFFER, gl.BUFFER_SIZE);
        console.log("Tile buffer usage: ", Math.round(percentage * 100), "%");

        gl.bindBuffer(gl.ARRAY_BUFFER, this.worldTranslateBuffer);
        var usage = sizeof['vec3'] * this.blocks;
        var percentage = usage / gl.getBufferParameter(gl.ARRAY_BUFFER, gl.BUFFER_SIZE);
        console.log("Translate buffer usage: ", Math.round(percentage * 100), "%");

        gl.bindBuffer(gl.ARRAY_BUFFER, this.worldDBuffer);
        var usage = Float32Array.BYTES_PER_ELEMENT * this.blocks;
        var percentage = usage / gl.getBufferParameter(gl.ARRAY_BUFFER, gl.BUFFER_SIZE);
        console.log("Destroyed buffer usage: ", Math.round(percentage * 100), "%");
    }

    private setup_perspective_matrix() : void
    {
        var canvas = this.canvas;
        var gl = this.gl;

        function update_uniforms(matrix)
        {
            gl.useProgram(this.boxShaderProgram);
            gl.uniformMatrix4fv(this.uPMatrix, false, matrix);

            gl.useProgram(this.mouseShaderProgram);
            gl.uniformMatrix4fv(this.uM_PMatrix, false, matrix);
        };

        var projection_matrix;
        if(this.model.is_orthogonal())
        {
            var orthogonalMatrix = ortho(-this.model.worldX/2, this.model.worldX/2, -this.model.worldZ/2, this.model.worldZ/2, -100.0, 100.0);
            projection_matrix = flatten(orthogonalMatrix);
        }
        else
        {
            var perspectiveMatrix = perspective(60, canvas.clientWidth / canvas.clientHeight, 0.1, 100.0);
            projection_matrix = flatten(perspectiveMatrix);
        }
        update_uniforms.bind(this)(projection_matrix);
    }

    private setup_modelview_matrix() : void
    {
        var canvas = this.canvas;
        var gl = this.gl;

        function update_uniforms(matrix)
        {
            gl.useProgram(this.boxShaderProgram);
            gl.uniformMatrix4fv(this.uMVMatrix, false, matrix);


            gl.useProgram(this.mouseShaderProgram);
            gl.uniformMatrix4fv(this.uM_MVMatrix, false, matrix);
        }

        var stick_pos = this.model.get_stickman_position();
        var cam_pos   = this.model.get_mouse_position();

        // Camera height off the ground (i.e. stickman height)
        var stickman_height = 1;
        // Camera map height
        var map_height = 50;

        var modelview_matrix;
        if(this.model.isMapActive())
        {
            var modelMatrix = lookAt(vec3(stick_pos[0],
                                          stick_pos[1] + map_height,
                                          stick_pos[2]),
                                     vec3(stick_pos[0],
                                          stick_pos[1],
                                          stick_pos[2]),
                                     vec3(1,0,0));
            modelview_matrix = flatten(modelMatrix);
        }
        else
        {
            var modelMatrix = lookAt(vec3(stick_pos[0],
                                          stick_pos[1] + stickman_height,
                                          stick_pos[2]),
                                     vec3(stick_pos[0] + cam_pos[0],
                                          stick_pos[1] + cam_pos[1] + stickman_height,
                                          stick_pos[2] + cam_pos[2]),
                                     vec3(0,1,0));
            modelview_matrix = flatten(modelMatrix);
        }
        update_uniforms.bind(this)(modelview_matrix);
    }

    constructor(model : Model)
    {
        this.model = model;
        this.sunRadius = this.model.worldX/2 + 10;
        // Setup WebGL context
        this.initWebGL();
        // Setup buffers
        this.initBuffers();
        // Setup world
        this.initialize_block_world();
        // Setup textures
        this.initialize_textures();
        // Setup perspective matrix
        this.setup_perspective_matrix();
        // Output buffer usage
        this.output_buffer_usage();

        var canvas = this.canvas;
        var gl = this.gl;

        // Whenever a block's tile changes
        this.model.on("update_tile", function(pos, tile)
        {
            // Get the offset for this block
            var offset = this.vec_to_offset[pos];
            // Offset undefined === no such block yet
            if(offset == undefined)
            {
                this.new_block(pos);
            }
            else
            {
                // Update the tile of the block
                this.updateTile(offset, offset + 1, tile);
                // Update the color of the block
                this.updateColor(offset, offset + 1, pos, tile);
                // Notify all adjacent blocks
                this.rebufferBlocks(pos);
            }

        }.bind(this));

        this.model.on('sunchange', function(newVal:number) {
            this.sunTheta = radians(newVal);

            if (newVal < 180) {
                gl.clearColor(.7, .7, 1., 1.);
            }
            else {
                var x = newVal - 180 - 90;
                x = Math.abs(x) / 90;
                gl.clearColor(x * .7, x * .7, x, 1.);
            }
        }.bind(this));

        // Whenever a block is destroyed
        this.model.on("update_destroyed", function(pos, destroyed : number)
        {
            // Get the offset for this block
            var offset = this.vec_to_offset[pos];
            // Offset undefined === no such block yet
            if(offset == undefined)
            {
                this.new_block(pos);
            }
            else
            {
                //console.log(pos, destroyed);
                // Update the destroyed status of the block
                this.updateDestroyed(offset, offset + 1, destroyed);
                // Notify all adjacent blocks
                this.rebufferBlocks(pos);
            }
        }.bind(this));

        this.model.on("stickman_move", function(pos) {
            gl.useProgram(this.boxShaderProgram);
            var newPos = vec4(pos[0], pos[1] + 1, pos[2], 1.);
            gl.uniform4fv(gl.getUniformLocation(this.boxShaderProgram, 'vTorchLoc'), newPos);
        }.bind(this));

        var update_camera = function()
        {
            this.setup_modelview_matrix();
        }.bind(this);

        this.model.on("stickman_move", update_camera);
        this.model.on("mouse_move", update_camera);
        this.model.on("map_active", update_camera);

        this.model.on("update_perspective", this.setup_perspective_matrix.bind(this));

        update_camera();

        //var previous_cam_pos = vec3(0.0,0.0,0.0);

        var rotate_stickman = function(angle) : void
        {
            var stick_pos = model.get_stickman_position();
            this.initialize_stick_man(stick_pos, angle);
        }.bind(this);

        var camera_yaw;
        this.model.on("stickman_move", function()
        {
            rotate_stickman(camera_yaw);
        });

        this.model.on("mouse_move", function(pos, yaw)
        {
            camera_yaw = yaw;
            rotate_stickman(camera_yaw);
        });

        var update_placeblock = function() : void
        {
            var stick_pos = model.get_stickman_position().map(Math.round);
            var mouse_pos   = model.get_mouse_position();
            var block_pos = add(stick_pos, mouse_pos).map(Math.round);
            if(stick_pos == block_pos)
            {
                this.draw_mouse = false;
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

        this.model.on('offscreen', function(e){
            var gl = this.gl;
            var canvas = this.canvas;

            var ext_angle = gl.getExtension("ANGLE_instanced_arrays");
            if(!ext_angle)
            {
                console.log("'ANGLE_instanced_arrays' extension not available!");
                alert("FUCK");
            }

            gl.bindRenderbuffer(gl.RENDERBUFFER, this.renderBuffer);
            gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, canvas.width, canvas.height);

            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            gl.useProgram(this.mouseShaderProgram);

            gl.bindBuffer(gl.ARRAY_BUFFER, this.cubeVertexBuffer);
            gl.vertexAttribPointer(this.vM_Position, 3, gl.FLOAT, false, 0, 0);
            ext_angle.vertexAttribDivisorANGLE(this.vM_Position, 0);

            gl.bindBuffer(gl.ARRAY_BUFFER, this.worldTranslateBuffer);
            gl.vertexAttribPointer(this.vM_Translate, 3, gl.FLOAT, false, 0, 0);
            ext_angle.vertexAttribDivisorANGLE(this.vM_Translate, 1);

            gl.bindBuffer(gl.ARRAY_BUFFER, this.worldCBuffer);
            gl.vertexAttribPointer(this.vM_Color, 4, gl.FLOAT, false, 0, 0);
            ext_angle.vertexAttribDivisorANGLE(this.vM_Color, 1);

            // Draw all the blocks!
            ext_angle.drawArraysInstancedANGLE(gl.TRIANGLES, 0, this.verts_per_block, this.blocks);

            var pixels = new Uint8Array(4);
            gl.readPixels(e.clientX, e.clientY, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

            var x = Math.round(pixels[0] / 255 * this.model.worldX);
            var y = Math.round(pixels[1] / 255 * this.model.worldY);
            var z = Math.round(pixels[2] / 255 * this.model.worldZ);

            var pos = vec3(x, y, z);

            if (!this.model.valid_index(pos)) {
                $('#bufferBlock').val('none');
            }
            else {
                var tile = this.model.get_tile(pos);
                $('#bufferBlock').val(TileUtil.toString(tile));
            }

            gl.bindRenderbuffer(gl.RENDERBUFFER, null);

        }.bind(this));
    }

    private renderBuffer:any;
};
