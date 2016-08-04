/**
 * Created by dkchokk on 04/08/16.
 */

declare var sizeof: any;
declare var flatten: any;

export class ShaderProgram {

    private _gl: any;
    private _program: any;
    private _attributes: Array<Attribute>;
    private _uniforms: Array<Uniform>;

    public constructor (gl: any, program: any) {

        this._gl = gl;
        this._program = program;

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

    public setBindings() {
        this.setActive();

        // Bind attributes.
        for (var i = 0; i < this._attributes.length; i++) {
            var attribute : Attribute = this._attributes[i];
            this._gl.bindBuffer(this._gl.ARRAY_BUFFER, attribute.buffer);
            this._gl.vertexAttribPointer(attribute.index, attribute.numComponents, this._gl.FLOAT, false, 0, 0);
            this._gl.enableVertexAttribArray(attribute.index);
        }
    }

    // Attributes.

    public createAttribute(name: string, type: string) {
        this.setActive();
        var attribute = new Attribute(name, type);
        attribute.buffer = this._gl.createBuffer();
        attribute.index = this._gl.getAttribLocation(this._program, attribute.name);
        this._attributes.push(attribute);
    }

    public setAttributeData(name: string, sizeOrData : any) {
        this.setActive();
        var attribute = this.getAttribute(name);
        this._gl.bindBuffer(this._gl.ARRAY_BUFFER, attribute.buffer);
        if (typeof sizeOrData === 'number')
            this._gl.bufferData(this._gl.ARRAY_BUFFER, attribute.byteSize * sizeOrData, this._gl.STATIC_DRAW);
        else
            this._gl.bufferData(this._gl.ARRAY_BUFFER, flatten(sizeOrData), this._gl.STATIC_DRAW);
    }

    public setAttributeSubData(name: string, data: Array<any>, offset: number) {
        this.setActive();
        var attribute = this.getAttribute(name);
        this._gl.bindBuffer(this._gl.ARRAY_BUFFER, attribute.buffer);
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
        this._gl.uniform2fv(uniform.index, value);
    }

    public uniform3fv(name: string, value: any) {
        this.setActive();
        var uniform = this.getUniform(name);
        this._gl.uniform3fv(uniform.index, value);
    }

    public uniform4fv(name: string, value: any) {
        this.setActive();
        var uniform = this.getUniform(name);
        this._gl.uniform4fv(uniform.index, value);
    }

    public uniformMatrix2fv(name: string, value: any) {
        this.setActive();
        var uniform = this.getUniform(name);
        this._gl.uniformMatrix2fv(uniform.index, false, value);
    }

    public uniformMatrix3fv(name: string, value: any) {
        this.setActive();
        var uniform = this.getUniform(name);
        this._gl.uniformMatrix3fv(uniform.index, false, value);
    }

    public uniformMatrix4fv(name: string, value: any) {
        this.setActive();
        var uniform = this.getUniform(name);
        this._gl.uniformMatrix4fv(uniform.index, false, value);
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
    public index: number;
    public buffer: number;
    public type: string;
    public numComponents: number;
    public byteSize: number;

    public constructor(name: string, type: string) {
        this.name = name;
        this.type = type;
        this.numComponents = this.getNumComponents();
        this.byteSize = this.getByteSize();
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