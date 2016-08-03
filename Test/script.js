$(function () {
    var gl;
    var points;
    var shaderProgram;
    var shdrPrgm;

    var canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) {
        alert("WebGL isn't available");
    }

    points = [];

    function triangle(a, b, c) {
        points.push(a, b, c);
    }

    var colors = [
        vec4(1., 0., 0., 1.), vec4(1., 0., 0., 1.), vec4(1., 0., 0., 1.),
        vec4(0., 1., 0., 1.), vec4(0., 1., 0., 1.), vec4(0., 1., 0., 1.),
        vec4(0., 0., 1., 1.), vec4(0., 0., 1., 1.), vec4(0., 0., 1., 1.),
        vec4(1., 0., 1., 1.), vec4(1., 0., 1., 1.), vec4(1., 0., 1., 1.)
    ];

    triangle(vec2(.5, .5), vec2(1., .5), vec2(.75, 1.));
    triangle(vec2(.5, -.5), vec2(1., -.5), vec2(.75, -1.));
    triangle(vec2(-.5, -.5), vec2(-1., -.5), vec2(-.75, -1.));
    triangle(vec2(-.5, .5), vec2(-1., .5), vec2(-.75, 1.));

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    shaderProgram = new ShaderProgram(gl, 'vertex-shader', 'fragment-shader');

    // Set all data at once.
    shaderProgram.createAttribute('vPosition', 'vec2');
    shaderProgram.setAttributeData('vPosition', points);

    // Set size on create.
    shaderProgram.createAttribute('vColor', 'vec4');
    shaderProgram.setAttributeData('vColor', colors.length);

    // Lets try a uniform.
    shaderProgram.createUniform('vRotation');

    // Set data for each triangle using sub-buffering.
    shaderProgram.setAttributeSubData('vColor', colors.slice(6, 9), 9);
    shaderProgram.setAttributeSubData('vColor', colors.slice(3, 6), 6);
    shaderProgram.setAttributeSubData('vColor', colors.slice(0, 3), 3);
    shaderProgram.setAttributeSubData('vColor', colors.slice(9, 12), 0);

    // The fragment shader in this program sets all colors to teal.
    shdrPrgm = new ShaderProgram(gl, 'vtx-shader', 'frg-shader');
    shdrPrgm.createAttribute('vPosition', 'vec2');
    shdrPrgm.setAttributeData('vPosition', points);

    var timerId;
    $(window).click(function(){
        if (timerId)
            clearInterval(timerId);
        timerId = setInterval(update, 0);
    });

    var delta = 0;
    function update() {
        delta++;
        requestAnimationFrame(render);
        if (delta >= 1000) {
            delta = 0;
            clearInterval(timerId);
        }
    }

    function render() {
        gl.clear(gl.COLOR_BUFFER_BIT);
        shaderProgram.uniform1f('vRotation', radians(delta));
        shaderProgram.setBindings();
        // shdrPrgm.setBindings(); // Comment out or move up this line to get different colored triangles.
        gl.drawArrays(gl.TRIANGLES, 0, points.length);
    }
    render();
});
