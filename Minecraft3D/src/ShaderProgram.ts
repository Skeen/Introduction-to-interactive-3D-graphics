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
    private _buffers: Array<any>;

    public constructor (gl: any, vertexShaderPath: string, fragmentShaderPath: string) {

        this._gl = gl;
        this._program = initShaders(gl, vertexShaderPath, fragmentShaderPath);

        if (!(<any>window)._activeShader) {
            (<any>window)._activeShader = this;
        }

        this._attributes = [];
        this._uniforms = [];
        this._buffers = [];

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
            if (attribute.elementArray)
                this._gl.vertexAttribPointer(attribute.index, attribute.numComponents, this._gl.FLOAT, false, 0, 0);
            else
                this._gl.vertexAttribPointer(attribute.index, attribute.numComponents, this._gl.UNSIGNED_SHORT, false, 0, 0);
            this._gl.enableVertexAttribArray(attribute.index);
        }
    }

    public createIndices(group: string, size: number) {

        // this.worldIndexBuffer = gl.createBuffer();
        // gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.worldIndexBuffer);
        // gl.bufferData(gl.ARRAY_BUFFER, Uint16Array.BYTES_PER_ELEMENT * model.worldSize * this.indicies_per_block, gl.STATIC_DRAW);
    }

    //('world', Uint16Array.BYTES_PER_ELEMENT * model.worldSize * this.indicies_per_block);
    // Attributes.

    // Create an attribute with a buffer for a specific group.
    public createAttribute(name: string, group: string, type: string) {
        var attribute = new Attribute(name, this._gl.getAttribLocation(this._gl._program, name));
        attribute.setType(type);
        if (attribute.hasBuffer(group))
            console.warn('Attempt to overwrite buffer in group "' + group + '".');
        else
            attribute.addBuffer(group, this._gl.createBuffer());
    }

    public createIndexBuffer(name: string, groupName: string, capacity: number) {
        var buffer = new IndexBuffer(name, groupName, this._gl.createBuffer());
        this._gl.bindBuffer(this._gl.ELEMENT_ARRAY_BUFFER, buffer.getBuffer());
        this._gl.bufferData(this._gl.ELEMENT_ARRAY_BUFFER, Uin16t)
    }

    public createUniform(name: string) {
        this.setActive();
        var uniform = new Uniform(name, this._gl.getUniformLocation(this._program, name));
        this._uniforms.push(uniform);
    }


//region junk

    // public setAttributeData(name: string, group: string, sizeOrData : any, elementArray?: boolean) {
    //     this.setActive();
    //     var attribute = this.getAttribute(name);
    //     this._gl.bindBuffer(this._gl.ARRAY_BUFFER, attribute.getBuffer(group));
    //
    //     if (!!elementArray) {
    //         this._gl.bufferData(this._gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(sizeOrData), this._gl.STATIC_DRAW);
    //         attribute.elementArray = true;
    //         return;
    //     }
    //     if (typeof sizeOrData === 'number')
    //         this._gl.bufferData(this._gl.ARRAY_BUFFER, attribute.byteSize * sizeOrData, this._gl.STATIC_DRAW);
    //     else
    //         this._gl.bufferData(this._gl.ARRAY_BUFFER, flatten(sizeOrData), this._gl.STATIC_DRAW);
    // }
    //
    // public setAttributeSubData(name: string, group: string, data: Array<any>, offset: number) {
    //     this.setActive();
    //     var attribute = this.getAttribute(name);
    //     this._gl.bindBuffer(this._gl.ARRAY_BUFFER, attribute.getBuffer(group));
    //     this._gl.bufferSubData(this._gl.ARRAY_BUFFER, offset * attribute.byteSize, flatten(data));
    // }
    //
    // private getAttribute(name: string) : Attribute {
    //     var attribute;
    //     for (var i = 0; i < this._attributes.length; i++) {
    //         if (this._attributes[i].name === name) {
    //             attribute = this._attributes[i];
    //             break;
    //         }
    //     }
    //     if (!attribute)
    //         throw new Error('Attribute "' + name + '" not found.');
    //     return attribute;
    // }


    // Uniforms.

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
    //endregion

}

export class IndexBuffer {
    private name: string;
    private group: string;
    private buffer: any;

    constructor(name: string, group: string, buffer: any) {
        this.name = name;
        this.group = group;
        this.buffer = buffer;
    }

    public getBuffer(): any {
        return this.buffer;
    }
}

// Represents an attribute.
export class Attribute extends Uniform {

    private buffers: Array<any>;
    private numComponents: number;
    private byteSize: number;

    constructor(name: string, programIndex: number) {
        super(name, programIndex);
    }

    public setType(type: string) {
        this.numComponents = this.getNumComponents(type);
        this.byteSize = this.getByteSize(type);
    }


    public hasBuffer(groupName: string): boolean {
        return !!this.buffers[groupName];
    }

    public addBuffer(groupName: string, bufferId: any) {
        this.buffers[groupName] = bufferId;
    }

    private getNumComponents(type: string): number {
        switch (type) {
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

    private getByteSize(type: string): number {
        switch (type) {
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

    private programIndex: number;
    private name: string;

    constructor(name: string, programIndex: number) {
        this.name = name;
        this.programIndex = programIndex;
    }

    public getIndex() : number {
        return this.programIndex;
    }
}
