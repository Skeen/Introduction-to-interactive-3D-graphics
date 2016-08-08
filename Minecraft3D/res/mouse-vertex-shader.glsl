attribute vec3 vPosition;
attribute vec3 vTranslate;
attribute vec4 vColor;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;

varying vec4 fColor;

void main(void) 
{
    vec4 pos = vec4(vPosition, 1.);
    vec4 translated_pos = pos + vec4(vTranslate, 0.);
    gl_Position = uPMatrix * uMVMatrix * translated_pos;

    fColor = vColor;
}
