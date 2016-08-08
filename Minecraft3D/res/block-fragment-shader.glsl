precision mediump float;

varying vec2 fTile;
varying vec2 fTexCoord;
varying float fPicking;

uniform sampler2D uTextureMap;

void main() 
{
    // -1,-1 is EMPTY discard it!
    if(fTile == vec2(-1., -1.))
        discard;

    vec2 tex_scale = fTexCoord * (1. / 16.);
    vec2 tex_adjust = tex_scale + fTile;
    
    vec2 tex_pick_adjust = tex_scale + vec2(fPicking / 16., 0.);

    vec4 block_texture = texture2D(uTextureMap, tex_adjust);
    vec4 overlay_texture = texture2D(uTextureMap, tex_pick_adjust);

    if(fPicking < 1. || fPicking > 9.)
        gl_FragColor = block_texture;
    else
        gl_FragColor = mix(block_texture, overlay_texture, overlay_texture.a);
}

