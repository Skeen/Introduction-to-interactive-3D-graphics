/**
 * Created by dkchokk on 27-07-2016.
 */
function windowLoadHandler() {
    var canvas, gl, program;
    var points = [
        vec2(.5, .5),
        vec2(.75, .75),
        vec2(1., .5)
    ];

    canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl)
        return;
    gl.viewport(0, 0, canvas.clientWidth, canvas.clientHeight);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // Bind the buffer.
    var bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);

    // Associate shader vars with data buffer.
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    function buffer() {
        gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);
    }

    function render() {
        buffer();
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, points.length);
    }
    render();
}
window.addEventListener("load", windowLoadHandler);