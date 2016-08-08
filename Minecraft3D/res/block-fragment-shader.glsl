precision mediump float;

varying vec2 fTile;
varying vec2 fTexCoord;

uniform sampler2D uTextureMap;

void main() 
{
    vec2 tex_scale = fTexCoord * (1. / 16.);
    vec2 tex_adjust = tex_scale + fTile;
    gl_FragColor = texture2D(uTextureMap, tex_adjust);
}

