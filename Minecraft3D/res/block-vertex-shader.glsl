attribute vec3 vPosition;
attribute vec4 vColor;
attribute vec3 vTranslate;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;

varying vec4 fColor;

void main(void) 
{
    gl_Position = uPMatrix * uMVMatrix * vec4(vPosition + vTranslate, 1.0);
    fColor = vColor;
}
