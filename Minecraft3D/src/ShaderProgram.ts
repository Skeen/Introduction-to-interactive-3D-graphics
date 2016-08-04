/**
 * Created by dkchokk on 04/08/16.
 */

declare var sizeof: any;
declare var flatten: any;
declare var initShaders: any;

export class ShaderProgram {

    private _gl: any;
    private _program: any;
    private _attributes: Array<Attribute>;
    private _uniforms: Array<Uniform>;

    public constructor (gl: any, vertexShaderPath: string, fragmentShaderPath: string) {

        this._gl = gl;
        this._program = initShaders(gl, vertexShaderPath, fragmentShaderPath);

        if (!(<any>window)._activeShader) {
            (<any>window)._activeShader = this;
        }

        this._attributes = [];
        this._uniforms = [];

    }

    // Bindings.

    private isActive() : boolean {
        return ((<any>window)._activeShader === this)
    }

    private setActive() {
        if (this.isActive())
            return;
        (<any>window)._activeShader = this;
        this._gl.useProgram(this._program);
    }

    public setBindings(grouping: string) {
        this.setActive();

        // Bind attributes.
        for (var i = 0; i < this._attributes.length; i++) {
            var attribute : Attribute = this._attributes[i];
            this._gl.bindBuffer(this._gl.ARRAY_BUFFER, attribute.getBuffer(grouping));
            this._gl.vertexAttribPointer(attribute.index, attribute.numComponents, this._gl.FLOAT, false, 0, 0);
            this._gl.enableVertexAttribArray(attribute.index);
        }
    }

    // Attributes.

    public createAttribute(name: string, group: string, type: string) {
        this.setActive();
        var attribute;
        try {
            attribute = this.getAttribute(name);
        } catch (err) {
            attribute = new Attribute(name, type);
            attribute.setIndex(this._gl.getAttribLocation(this._program, name));
            this._attributes.push(attribute);
        }
        attribute.addBuffer(group, this._gl.createBuffer());
    }

    public setAttributeData(name: string, group: string, sizeOrData : any) {
        this.setActive();
        var attribute = this.getAttribute(name);
        this._gl.bindBuffer(this._gl.ARRAY_BUFFER, attribute.getBuffer(group));
        if (typeof sizeOrData === 'number')
            this._gl.bufferData(this._gl.ARRAY_BUFFER, attribute.byteSize * sizeOrData, this._gl.STATIC_DRAW);
        else
            this._gl.bufferData(this._gl.ARRAY_BUFFER, flatten(sizeOrData), this._gl.STATIC_DRAW);
    }

    public setAttributeSubData(name: string, group: string, data: Array<any>, offset: number) {
        this.setActive();
        var attribute = this.getAttribute(name);
        this._gl.bindBuffer(this._gl.ARRAY_BUFFER, attribute.getBuffer(group));
        this._gl.bufferSubData(this._gl.ARRAY_BUFFER, offset * attribute.byteSize, flatten(data));
    }

    private getAttribute(name: string) : Attribute {
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
    }

    // Uniforms.

    public createUniform(name: string) {
        this.setActive();
        var uniform = new Uniform(name);
        uniform.index = this._gl.getUniformLocation(this._program, name);
        this._uniforms.push(uniform);
    }

    public uniform1f(name: string, value: any) {
        this.setActive();
        var uniform = this.getUniform(name);
        this._gl.uniform1f(uniform.index, value);
    }

    public uniform2fv(name: string, value: any) {
        this.setActive();
        var uniform = this.getUniform(name);
        this._gl.uniform2fv(uniform.index, flatten(value));
    }

    public uniform3fv(name: string, value: any) {
        this.setActive();
        var uniform = this.getUniform(name);
        this._gl.uniform3fv(uniform.index, flatten(value));
    }

    public uniform4fv(name: string, value: any) {
        this.setActive();
        var uniform = this.getUniform(name);
        this._gl.uniform4fv(uniform.index, flatten(value));
    }

    public uniformMatrix2fv(name: string, value: any) {
        this.setActive();
        var uniform = this.getUniform(name);
        this._gl.uniformMatrix2fv(uniform.index, false, flatten(value));
    }

    public uniformMatrix3fv(name: string, value: any) {
        this.setActive();
        var uniform = this.getUniform(name);
        this._gl.uniformMatrix3fv(uniform.index, false, flatten(value));
    }

    public uniformMatrix4fv(name: string, value: any) {
        this.setActive();
        var uniform = this.getUniform(name);
        this._gl.uniformMatrix4fv(uniform.index, false, flatten(value));
    }

    private getUniform(name: string) : Uniform {
        var uniform;
        for (var i = 0; i < this._uniforms.length; i++) {
            if (this._uniforms[i].name === name) {
                uniform = this._uniforms[i];
            }
        }
        if (!uniform)
            throw new Error('Uniform "' + name + '" not found.');
        return uniform;
    }

}

export class Attribute {
    public name: string;
    public type: string;
    public numComponents: number;
    public byteSize: number;
    public group: string;
    public buffers: Array<any>;
    public index: number;

    public constructor(name: string, type: string) {
        this.name = name;
        this.type = type;
        this.numComponents = this.getNumComponents();
        this.byteSize = this.getByteSize();
        this.buffers = [];
    }

    public setIndex(index: number) {
        this.index = index;
    }

    public addBuffer(group: string, buffer: number) {
        var b = this.buffers[group];
        if (!!b)
            throw new Error('Cannot overwrite existing buffer in "' + group + '".');
        this.buffers[group] = buffer;
    }

    public getBuffer(group: string) {
        var b = this.buffers[group];
        if (!b)
            throw new Error('Buffer in group "' + group + '" does not exist.');
        return b;
    }

    private getNumComponents() : number {
        switch (this.type) {
            case 'vec2':
                return 2;
            case 'vec3':
                return 3;
            case 'vec4':
                return 4;
            case 'mat2':
                return 4;
            case 'mat3':
                return 9;
            case 'mat4':
                return 16;
            default:
                return -1;
        }
    }

    private getByteSize() : number {
        switch (this.type) {
            case 'vec2':
                return sizeof['vec2'];
            case 'vec3':
                return sizeof['vec3'];
            case 'vec4':
                return sizeof['vec4'];
            case 'mat2':
                return sizeof['mat2'];
            case 'mat3':
                return sizeof['mat3'];
            case 'mat4':
                return sizeof['mat4'];
            default:
                return -1;
        }
    }
}

export class Uniform {
    public name: string;
    public index: number;

    public constructor(name: string) {
        this.name = name;
    }
}