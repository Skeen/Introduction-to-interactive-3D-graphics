precision mediump float;

varying vec4 fColor;

void main() 
{
    // Discard very transparent fragments
    if (fColor.a < 0.1) 
        discard;

    gl_FragColor = fColor;
}
