precision mediump float;

varying vec2 fTile;
varying vec2 fTexCoord;

uniform sampler2D uTextureMap;

void main() 
{
    // -1,-1 is EMPTY discard it!
    if(fTile == vec2(-1., -1.))
        discard;

    vec2 tex_scale = fTexCoord * (1. / 16.);
    vec2 tex_adjust = tex_scale + fTile;
    gl_FragColor = texture2D(uTextureMap, tex_adjust);

    //gl_FragColor = vec4(1., 0., 0., 1.);
}

