/**
 * Created by dkchokk on 02-08-2016.
 * Requires MV.js to function properly.
 */
var ShaderProgram = (function () {

    function ShaderProgram(gl, vertexShaderId, fragmentShaderId) {
        if (!gl)
            throw new Error('Needs WebGL rendering context.');

        this._gl = gl;
        this._shaderProgram = this._gl.createProgram();
        this._attributes = [];
        this._uniforms = [];

        // Get shader script elements.
        var vertexElement = document.getElementById(vertexShaderId);
        var fragmentElement = document.getElementById(fragmentShaderId);

        var msg;

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
        if (!this._gl.getShaderParameter(vertexShader, this._gl.COMPILE_STATUS) || !this._gl.getShaderParameter(fragmentShader, this._gl.COMPILE_STATUS)) {
            msg = 'Shader errors:' + '\n';
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
            msg = 'Link error:' + '\n';
            msg += this._gl.getProgramInfoLog(this._shaderProgram);
            alert(msg);
        }
    }

    ShaderProgram.prototype.setActive = function () {
        window._activeShader = this;
        this._gl.useProgram(this._shaderProgram);
    };

    ShaderProgram.prototype.setBindings = function () {
        if (window._activeShader != this)
            this.setActive();
        for (var i = 0; i < this._attributes.length; i++) {
            var attribute = this._attributes[i];
            this._gl.bindBuffer(this._gl.ARRAY_BUFFER, attribute.buffer);
            this._gl.vertexAttribPointer(attribute.index, attribute.numComponents, this._gl.FLOAT, false, 0, 0);
            this._gl.enableVertexAttribArray(attribute.index);
        }
    };

    // Attributes.

    ShaderProgram.prototype.createAttribute = function (name, type) {
        if (window._activeShader != this)
            this.setActive();
        var attribute = {
            name: name,
            numComponents: undefined,
            index: undefined,
            buffer: undefined,
            type: type
        };
        attribute.buffer = this._gl.createBuffer();
        attribute.index = this._gl.getAttribLocation(this._shaderProgram, attribute.name);
        attribute.numComponents = this.getNumComponents(attribute.type);
        this._attributes.push(attribute);
    };

    // Buffering - also used to set the initial size of the buffer.

    ShaderProgram.prototype.setAttributeData = function (name, sizeOrData) {
        if (window._activeShader != this)
            this.setActive();
        var attribute = this.getAttribute(name);
        this._gl.bindBuffer(this._gl.ARRAY_BUFFER, attribute.buffer);
        if (typeof sizeOrData === 'number')
            this._gl.bufferData(this._gl.ARRAY_BUFFER, this.getByteSize(attribute.type) * sizeOrData, this._gl.STATIC_DRAW);
        else
            this._gl.bufferData(this._gl.ARRAY_BUFFER, flatten(sizeOrData), this._gl.STATIC_DRAW);
    };

    // Sub-buffering.

    ShaderProgram.prototype.setAttributeSubData = function (name, data, offset) {
        if (window._activeShader != this)
            this.setActive();
        var attribute = this.getAttribute(name);
        this._gl.bindBuffer(this._gl.ARRAY_BUFFER, attribute.buffer);
        this._gl.bufferSubData(this._gl.ARRAY_BUFFER, offset * this.getByteSize(attribute.type), flatten(data));
    };

    // Uniforms.

    ShaderProgram.prototype.createUniform = function (name) {
        if (window._activeShader != this)
            this.setActive();
        var uniform = {};
        uniform.name = name;
        uniform.index = this._gl.getUniformLocation(this._shaderProgram, name);
        this._uniforms.push(uniform);
    };

    // Uniform floats.

    ShaderProgram.prototype.uniform1f = function (name, value) {
        if (window._activeShader != this)
            this.setActive();
        var uniform = this.getUniform(name);
        this._gl.uniform1f(uniform.index, value);
    };

    // Uniform vectors.

    ShaderProgram.prototype.uniform2fv = function (name, value) {
        if (window._activeShader != this)
            this.setActive();
        var uniform = this.getUniform(name);
        this._gl.uniform2fv(uniform.index, value);
    };

    ShaderProgram.prototype.uniform3fv = function (name, value) {
        if (window._activeShader != this)
            this.setActive();
        var uniform = this.getUniform(name);
        this._gl.uniform3fv(uniform.index, value);
    };

    ShaderProgram.prototype.uniform4fv = function (name, value) {
        if (window._activeShader != this)
            this.setActive();
        var uniform = this.getUniform(name);
        this._gl.uniform4fv(uniform.index, value);
    };

    // Uniform matrices.

    ShaderProgram.prototype.uniformMatrix2fv = function (name, transpose, value) {
        if (window._activeShader != this)
            this.setActive();
        var uniform = this.getUniform(name);
        this._gl.uniformMatrix2fv(uniform.index, transpose, value);
    };

    ShaderProgram.prototype.uniformMatrix3fv = function (name, transpose, value) {
        if (window._activeShader != this)
            this.setActive();
        var uniform = this.getUniform(name);
        this._gl.uniformMatrix3fv(uniform.index, transpose, value);
    };

    ShaderProgram.prototype.uniformMatrix4fv = function (name, transpose, value) {
        if (window._activeShader != this)
            this.setActive();
        var uniform = this.getUniform(name);
        this._gl.uniformMatrix4fv(uniform.index, transpose, value);
    };

    // Utility functions.

    ShaderProgram.prototype.getAttribute = function (name) {
        var attribute;
        for (var i = 0; i < this._attributes.length; i++) {
            if (this._attributes[i].name === name) {
                attribute = this._attributes[i];
                break;
            }
        }
        if (!attribute)
            throw new Error('Attribute "' + name + '" not found.');
        return attribute;
    };

    ShaderProgram.prototype.getUniform = function (name) {
        var uniform;
        for (var i = 0; i < this._uniforms.length; i++) {
            if (this._uniforms[i].name === name) {
                uniform = this._uniforms[i];
                break;
            }
        }
        if (!uniform)
            throw new Error('Uniform "' + name + '" not found.');
        return uniform;
    };

    ShaderProgram.prototype.getByteSize = function (typeString) {
        switch (typeString) {
            case 'vec2':
                return sizeof['vec2'];
                break;
            case 'vec3':
                return sizeof['vec3'];
                break;
            case 'vec4':
                return sizeof['vec4'];
                break;
            case 'mat2':
                return sizeof['mat2'];
                break;
            case 'mat3':
                return sizeof['mat3'];
                break;
            case 'mat4':
                return sizeof['mat4'];
                break;
            default:
                return -1;
        }
    };

    ShaderProgram.prototype.getNumComponents = function (typeString) {
        switch (typeString) {
            case 'vec2':
                return 2;
                break;
            case 'vec3':
                return 3;
                break;
            case 'vec4':
                return 4;
                break;
            case 'mat2':
                return 4;
                break;
            case 'mat3':
                return 9;
                break;
            case 'mat4':
                return 16;
                break;
            default:
                return -1;
        }
    };

    return ShaderProgram;

}());