//TODO: refactor alt.
window.addEventListener('load', loadHandler);
function loadHandler(){

    var canvas, gl;

    canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1., .0, .0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.lineWidth(10.);

    var lines = [
        vec2(-1., 1/3), vec2(1., 1/3),
        vec2(-1., -1/3), vec2(1., -1/3),
        vec2(-1/3., -1), vec2(-1/3, 1),
        vec2(1/3., -1), vec2(1/3, 1)
    ];

    var lineColors = [
        vec4(1., 1., 1., 1.), vec4(1., 1., 1., 1.),
        vec4(1., 1., 1., 1.), vec4(1., 1., 1., 1.),
        vec4(1., 1., 1., 1.), vec4(1., 1., 1., 1.),
        vec4(1., 1., 1., 1.), vec4(1., 1., 1., 1.)
    ];

    var cells = [];
    var board = [];

    var pieces = {
        empty: 0,
        cross: 1,
        circle: 2,
        crossRendered: 3,
        circleRendered: 4
    };

    for (var i = 0; i < 3; i++) {
        board[i] = [];
        cells[i] = [];
        for (var j = 0; j < 3; j++) {
            board[i][j] = pieces.empty;
            var pos = vec2(i/(3/2) - (2/3), -j/(3/2) + (2/3));
            cells[i][j] = pos;
        }
    }

    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // Lines buffer.
    var vLinesBufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vLinesBufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(lines), gl.STATIC_DRAW);
    var vPos = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPos, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPos);
    var vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);

    // Pieces buffer.
    var vPiecesBufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vPiecesBufferId);
    gl.bufferData(gl.ARRAY_BUFFER, sizeof['vec2'] * 9, gl.STATIC_DRAW);

    // Lines Color buffer.
    var vColorLinesBufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vColorLinesBufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(lineColors), gl.STATIC_DRAW);

    // Pieces Color buffer.
    var vColorBufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vColorBufferId);
    gl.bufferData(gl.ARRAY_BUFFER, sizeof['vec4'] * 9, gl.STATIC_DRAW);


    var piecesRendered = 0;

    var colors = [ vec4(1., 1., 1., 1.), vec4(0., 0., 0., 1.) ];

    function render(){
        for (var i = 0; i < board.length; i++) {
            for (var j = 0; j < board.length; j++) {
                if (board[i][j] == pieces.cross || board[i][j] == pieces.circle) {
                    gl.bindBuffer(gl.ARRAY_BUFFER, vPiecesBufferId);
                    gl.bufferSubData(gl.ARRAY_BUFFER, sizeof['vec2'] * piecesRendered, flatten(cells[i][j]));
                    gl.bindBuffer(gl.ARRAY_BUFFER, vColorBufferId);
                    gl.bufferSubData(gl.ARRAY_BUFFER, sizeof['vec4'] * piecesRendered, flatten(colors[board[i][j]-1]));
                    piecesRendered++;
                    board[i][j] += pieces.circle;
                }
            }
        }

        gl.clear(gl.COLOR_BUFFER_BIT);

        // Render color (lines).
        gl.bindBuffer(gl.ARRAY_BUFFER, vColorLinesBufferId);
        gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);

        // Render lines.
        gl.bindBuffer(gl.ARRAY_BUFFER, vLinesBufferId);
        gl.vertexAttribPointer(vPos, 2, gl.FLOAT, false, 0, 0);
        gl.drawArrays(gl.LINES, 0, lines.length);

        if (piecesRendered === 0)
            return;
        // Render color (pieces).
        gl.bindBuffer(gl.ARRAY_BUFFER, vColorBufferId);
        gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);

        // Render pieces.
        gl.bindBuffer(gl.ARRAY_BUFFER, vPiecesBufferId);
        gl.vertexAttribPointer(vPos, 2, gl.FLOAT, false, 0, 0);
        gl.drawArrays(gl.POINTS, 0, piecesRendered);
    }
    render();

    var isPlayerOne = true;
    canvas.addEventListener('click', function(event){
        var pos = vec2(2 * event.clientX / canvas.width - 1, 2 * (canvas.height - event.clientY) / canvas.height - 1);
        var idx = vec2(Math.floor((pos[0] + 1) * (1 / (2/3))), Math.floor((2 - (pos[1] + 1)) * (1 / (2/3))));

        if (board[idx[0]][idx[1]] != pieces.empty) {
            alert('nope');
            return;
        }

        if (isPlayerOne)
            board[idx[0]][idx[1]] = pieces.cross;
        else
            board[idx[0]][idx[1]] = pieces.circle;

        isPlayerOne = !isPlayerOne;

        render();
        checkWinner() != -1 ? alert(checkWinner()) : 0;
    });

    function checkWinner() {
        for (var i = 0; i < board.length; i++) {
            var numCircle = 0;
            var numCross = 0;
            for (var j = 0; j < board.length; j++) {
                var cell = board[i][j];
                if(cell === pieces.circleRendered) {
                    numCircle++;
                }
                if(cell === pieces.crossRendered) {
                    numCross++
                }
            }
            if (numCircle === pieces.circle + pieces.cross)
                return 1;
            if (numCross === pieces.crossRendered)
                return 2;
        }
        for (var i = 0; i < board.length; i++) {
            var numCircle = 0;
            var numCross = 0;
            for (var j = 0; j < board.length; j++) {
                var cell = board[j][i];
                if(cell === pieces.circleRendered) {
                    numCircle++;
                }
                if(cell === pieces.crossRendered) {
                    numCross++
                }
            }
            if (numCircle === pieces.circle + pieces.cross)
                return 1;
            if (numCross === pieces.crossRendered)
                return 2;
        }

        var numCircle1 = 0;
        var numCross1 = 0;
        for (var i = 0; i < board.length; i++) {

            var cell = board[i][i];
            if(cell === pieces.circleRendered) {
                numCircle1++;
            }
            if(cell === pieces.crossRendered) {
                numCross1++
            }
            if (numCircle1 === pieces.circle + pieces.cross)
                return 1;
            if (numCross1 === pieces.crossRendered)
                return 2;
        }

        var numCircle2 = 0;
        var numCross2 = 0;
        for (var i = 0; i < board.length; i++) {
            var cell = board[i][board.length - 1 - i];
            if(cell === pieces.circleRendered) {
                numCircle2++;
            }
            if(cell === pieces.crossRendered) {
                numCross2++
            }
            if (numCircle2 === pieces.circle + pieces.cross)
                return 1;
            if (numCross2 === pieces.crossRendered)
                return 2;
        }

        if (piecesRendered < 9)
            return -1;

        return 0;
    }
}