precision mediump float;

varying vec4 fColor;
varying vec2 fTexCoord;

uniform sampler2D uTextureMap;

void main() {
    // Discard very transparent fragments
    if (fColor.a < 0.1) 
        discard;

    gl_FragColor = fColor * texture2D(uTextureMap, fTexCoord);
}

