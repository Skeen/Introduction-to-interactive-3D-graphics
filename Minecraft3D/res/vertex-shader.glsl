attribute vec4 vPosition;
attribute vec4 vColor;

uniform float vScale;
uniform vec2 vStickPos;

varying vec4 fColor;

void
main()
{
    gl_PointSize = 100. * vScale;
    gl_Position = vec4((vPosition.xy + vStickPos.xy) * vScale - 1.0, 0., 1.);
    fColor = vColor;
}
