precision mediump float;

uniform sampler2D uTextureMap;

varying vec2 fTile;
varying vec2 fTexCoord;
varying float fPicking;

varying vec3 Lsun;
varying vec3 Ltorch;
varying vec3 E, N;

varying float fDistance;

vec4 getLight(vec3 L, vec4 ambientProduct, vec4 diffuseProduct, vec4 specularProduct)
{
    vec4 color;

    float shininess = 100.;

    vec3 H = normalize(L + E);
    vec4 ambient = ambientProduct;

    float Kd = max(dot(L, N), 0.0);
    vec4 diffuse = Kd * diffuseProduct;

    float Ks = pow(max(dot(N, H), 0.0), shininess);
    vec4 specular = Ks * specularProduct;

    if(dot(L, N) < 0.0)
        specular = vec4(0.0, 0.0, 0.0, 1.0);

    color = ambient + diffuse + specular;
    color.a = 1.0;

    return color;
}

float getAttenuationFactor(float d)
{
    float attenuationConstant = 4.;
    float attenuationLinear = .1;
    float attenuationQuadratic = .1;

    return 1. / (attenuationConstant + attenuationLinear * d + attenuationQuadratic * (d * d));
}

void main() 
{
    // -1,-1 is EMPTY discard it!
    if(fTile == vec2(-1., -1.))
        discard;

    vec2 tex_scale = fTexCoord * (1. / 16.);
    vec2 tex_adjust = tex_scale + fTile;
    
    vec2 tex_pick_adjust = tex_scale + vec2((fPicking - 1.) / 16., 0.);

    vec4 block_texture = texture2D(uTextureMap, tex_adjust);
    vec4 overlay_texture = texture2D(uTextureMap, tex_pick_adjust);

//    gl_FragColor = fColor;

    if(fPicking < 1. || fPicking > 10.)
        gl_FragColor = block_texture;
    else
        gl_FragColor = mix(block_texture, overlay_texture, overlay_texture.a);

    vec4 sunLight = getLight(Lsun, vec4(1., 1., 1., .01), vec4(1., 1., 1., .03), vec4(1., 1., 1., .04));
    vec4 torchLight = getLight(Ltorch, vec4(0., .0, 1., .01), vec4(0., .0, 1., .03), vec4(0., .0, 1., .04));
    torchLight = (torchLight * getAttenuationFactor(fDistance));
    sunLight = sunLight / 1.;

    gl_FragColor = mix(gl_FragColor, vec4(.0, .0, .0, 1.), 1. - (torchLight.a + sunLight.a / 2.5));
    gl_FragColor *= sunLight;
    gl_FragColor += torchLight;
}


// Position in eye coordinates.
//    vec3 posl = (uMVMatrix * translated_pos).xyz;
//
//    // We use a fixed light position.
//    //vec3 light = (vec4(10., 10., 10., 0.)).xyz;
//    vec3 light = (uMVMatrix * vec4(vSunLoc.xyz, 1.)).xyz;
//
//    vec3 L = normalize( light - posl );
//    vec3 E = normalize( -posl );
//    vec3 H = normalize( L + E );
//
//    vec3 normal = (destroyedRotation(destroyed, uTheta) * vec4(vNormal.xyz, 0.)).xyz;
//
//    vec4 NN = vec4(normal,0);
//
//    // Transform vertex normal into eye coordinates
//
//    vec3 N = normalize( (uMVMatrix*NN).xyz);
//
//    vec4 ambientProduct = vec4(1., 1., 1., .01);
//    vec4 diffuseProduct = vec4(1., 1., 1., .03);
//    vec4 specularProduct = vec4(1., 1., 1., .04);
//
//    float shininess = 50.;
//
//    // Compute terms in the illumination equation
//    vec4 ambient = ambientProduct;
//
//    float Kd = max( dot(L, N), 0.0 );
//    vec4  diffuse = Kd*diffuseProduct;
//
//    float Ks = pow( max(dot(N, H), 0.0), shininess );
//    vec4  specular = Ks * specularProduct;
//
//    if( dot(L, N) < 0.0 ) {
//    specular = vec4(0.0, 0.0, 0.0, 1.0);
//    }
//
//    fColor = ambient + diffuse + specular;
//    fColor.a = 1.0;
