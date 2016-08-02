$(function () {

});

var ShaderProgram = (function () {

    function ShaderProgram(gl, vertexShaderId, fragmentShaderId) {
        if (!gl)
            throw new Error('Needs WebGL rendering context.');

        this._gl = gl;
        this._shaderProgram = this._gl.createProgram();
        this._attributes = [];

        // Get shader script elements.
        var vertexElement = document.getElementById(vertexShaderId);
        var fragmentElement = document.getElementById(fragmentShaderId);

        if (!vertexElement || !fragmentElement)
            throw new Error('Needs id of vertex- and fragmentshader script elements.');

        // Create shaders.
        var vertexShader = this._gl.createShader(this._gl.VERTEX_SHADER);
        var fragmentShader = this._gl.createShader(this._gl.FRAGMENT_SHADER);

        // Set sources.
        this._gl.shaderSource(vertexShader, vertexElement.textContent);
        this._gl.shaderSource(fragmentShader, fragmentElement.textContent);

        // Compile shaders.
        this._gl.compileShader(vertexShader);
        this._gl.compileShader(fragmentShader);

        // Check for errors.
        if (!this._gl.getShaderParameter(vertexShader, this._gl.COMPILE_STATUS) ||
            !this._gl.getShaderParameter(fragmentShader, this._gl.COMPILE_STATUS)) {
            var msg = 'Shader errors:' + '\n';
            var vertexShaderLog = this._gl.getShaderInfoLog(vertexShader);
            var fragmentShaderLog = this._gl.getShaderInfoLog(fragmentShader);
            if (vertexShaderLog.length > 0)
                msg += 'Vertex shader: ' + vertexShaderLog;
            if (vertexShaderLog.length > 0 && fragmentShaderLog.length > 0)
                msg += '\n';
            if (fragmentShaderLog.length > 0)
                msg += 'Fragment shader: ' + fragmentShaderLog;
            alert(msg);
            return;
        }

        // Attach shaders.
        this._gl.attachShader(this._shaderProgram, vertexShader);
        this._gl.attachShader(this._shaderProgram, fragmentShader);

        // Link.
        this._gl.linkProgram(this._shaderProgram);

        // Check link successful.
        if (!this._gl.getProgramParameter(this._shaderProgram, this._gl.LINK_STATUS)) {
            var msg = 'Link error:' + '\n';
            msg += this._gl.getProgramInfoLog(this._shaderProgram);
            alert(msg);
            return;
        }
    }

    ShaderProgram.prototype.setActive = function () {
        this._gl.useProgram(this._shaderProgram);
    };

    ShaderProgram.prototype.createAttribute = function (name) {
        var attribute = {
            name: name,
            index: undefined,
            buffer: undefined
        };
        attribute.buffer = this._gl.createBuffer();
        attribute.index = this._gl.getAttribLocation(this._shaderProgram, attribute.name);
        this._attributes.push(attribute);
    };

    ShaderProgram.prototype.setAttributeData = function (name, data) {
        var attribute;
        for (var i = 0; i < this._attributes.length; i++) {
            if (this._attributes[i].name === name) {
                attribute = this._attributes[i];
                break;
            }
        }
        if (!attribute)
            throw new Error('Attribute "' + name + '" not found.');
        this._gl.bindBuffer(this._gl.ARRAY_BUFFER, attribute.buffer);
        this._gl.bufferData(this._gl.ARRAY_BUFFER, flatten(data), this._gl.STATIC_DRAW);
    };

    ShaderProgram.prototype.setBindings = function () {
        this.setActive();
        for (var i = 0; i < this._attributes.length; i++) {
            var attribute = this._attributes[i];
            this._gl.bindBuffer(this._gl.ARRAY_BUFFER, attribute.buffer);
            this._gl.vertexAttribPointer(attribute.index, 2, this._gl.FLOAT, false, 0, 0);
            this._gl.enableVertexAttribArray(attribute.index);
        }
    };

    return ShaderProgram;

}());

var gl;
var points;
var shaderProgram;

window.onload = function init() {
    var canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) {
        alert("WebGL isn't available");
    }

    points = [];

    function triangle(a, b, c) {
        points.push(a, b, c);
    }

    triangle(vec2(.5, .5), vec2(1., .5), vec2(.75, 1.));
    triangle(vec2(.5, -.5), vec2(1., -.5), vec2(.75, -1.));
    triangle(vec2(-.5, -.5), vec2(-1., -.5), vec2(-.75, -1.));
    triangle(vec2(-.5, .5), vec2(-1., .5), vec2(-.75, 1.));

    //  Configure WebGL

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    //  Load shaders and initialize attribute buffers

    shaderProgram = new ShaderProgram(gl, 'vertex-shader', 'fragment-shader');
    shaderProgram.setActive();
    shaderProgram.createAttribute('vPosition', 2);
    shaderProgram.setAttributeData('vPosition', flatten(points));

    // Load the data into the GPU

    var bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

    // Associate out shader variables with our data buffer

    // var vPosition = gl.getAttribLocation(program, "vPosition");
    // gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    // gl.enableVertexAttribArray(vPosition);

    render();
};


function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    shaderProgram.setBindings();
    gl.drawArrays(gl.TRIANGLES, 0, points.length);
}
