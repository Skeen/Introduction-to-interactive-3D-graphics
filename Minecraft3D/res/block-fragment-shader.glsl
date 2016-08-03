precision mediump float;

varying vec4 fPosition;
varying vec4 fColor;
varying vec4 fCenter;

varying float effect;

void main() {
    vec4 color_center = mix(fColor, vec4(1.0, 1.0, 1.0, fColor.w), 0.5);
    vec4 color_edge = fColor;

    // Gradient
    float gradient = distance(fCenter.xy, fPosition.xy);
    vec4 color_mix = mix(color_center, color_edge, gradient * 60.0);

    // Shockwave effect
    color_mix = mix(vec4(0., 0., 0., fColor.w), color_mix, 1. - (effect*25.));

    gl_FragColor = color_mix;
}

