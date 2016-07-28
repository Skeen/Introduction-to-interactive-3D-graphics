//TODO: refactor alt.

var canvas;
var gl;

var maxNumVertices = 200;
var index = 0;

var t;
var numPolygons = 0;
var numIndices = [];
numIndices[0] = 0;
var start = [0];

var polygonDone = false;

window.onload = function init() {
    canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) {
        alert("WebGL isn't available");
    }
    var a = document.getElementById("Button1")
    a.addEventListener("click", function () {
        numPolygons++;
        numIndices[numPolygons] = 0;
        start[numPolygons] = index;

        polygonDone = true;

        render();
    });

    var red = document.getElementById("red");
    var green = document.getElementById("green");
    var blue = document.getElementById("blue");

    canvas.addEventListener("mousedown", function (event) {

        t = vec2(2 * event.clientX / canvas.width - 1,
            2 * (canvas.height - event.clientY) / canvas.height - 1);

        color = vec4(red.value, green.value, blue.value, 1.0);

        gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
        gl.bufferSubData(gl.ARRAY_BUFFER, 8 * index, flatten(t));

        gl.bindBuffer(gl.ARRAY_BUFFER, cBufferId);
        gl.bufferSubData(gl.ARRAY_BUFFER, 16 * index, flatten(color));

        numIndices[numPolygons]++;
        index++;
    });


    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.8, 0.8, 0.8, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);


    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, 8 * maxNumVertices, gl.STATIC_DRAW);
    vPos = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPos, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPos);

    cBufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBufferId);
    gl.bufferData(gl.ARRAY_BUFFER, 16 * maxNumVertices, gl.STATIC_DRAW);
    vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);

    mBufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, mBufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(lastPoint), gl.STATIC_DRAW);
    gl.vertexAttribPointer(vPos, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPos);

    mCBufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, mCBufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(color), gl.STATIC_DRAW);
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);

    canvas.addEventListener("mousemove", function (event) {

        lastPoint = vec2(-1 + 2 * event.clientX / canvas.width,
            -1 + 2 * ( canvas.height - event.clientY ) / canvas.height);

        color = vec4(red.value, green.value, blue.value, 1.0);

        gl.bindBuffer(gl.ARRAY_BUFFER, mBufferId);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(lastPoint));

        gl.bindBuffer(gl.ARRAY_BUFFER, mCBufferId);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(color));

        render();

    });


}


var mBufferId, vPos, bufferId, vColor, cBufferId;

var lastPoint = vec2(.0, .0);
var color = vec4(.5, .5, .5, 1.);

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.bindBuffer(gl.ARRAY_BUFFER, mBufferId);
    gl.vertexAttribPointer(vPos, 2, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, mCBufferId);
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.POINTS, 0, 1);

    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.vertexAttribPointer(vPos, 2, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, cBufferId);
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    for (var i = 0; i < numPolygons; i++) {
        gl.drawArrays(gl.TRIANGLE_FAN, start[i], numIndices[i]);
    }
}