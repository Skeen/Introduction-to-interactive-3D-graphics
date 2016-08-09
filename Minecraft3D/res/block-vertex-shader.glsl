attribute vec3 vPosition;
attribute vec2 vTile;
attribute vec3 vTranslate;
attribute vec2 vTexCoord;
attribute float vDestroyed;
attribute vec3 vNormal;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;

uniform float uTheta;

varying vec2 fTile;
varying vec2 fTexCoord;
varying float fPicking;

mat4 rotMat(vec3 axis, float angle)
{
    axis = normalize(axis);
    float s = sin(angle);
    float c = cos(angle);
    float oc = 1.0 - c;
    
    return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
                oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
                oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
                0.0,                                0.0,                                0.0,                                1.0);
}

mat4 scaleMat(vec3 scale)
{
    return mat4(scale.x,    0.,        0.,         0.,
                0.,         scale.y,   0.,         0.,
                0.,         0.,        scale.z,    0.,
                0.,         0.,        0.,         1.);
}

mat4 destroyedRotation(float destroyed, float theta)
{
    return rotMat(vec3(1., 0., 1.), radians(45. * destroyed)) * rotMat(vec3(0., 1., 0.), theta * destroyed);
}

void main(void) 
{
    // Is the block fully destroyed?
    float destroyed = (vDestroyed > 10. ? 1. : 0.);

    vec4 pos = vec4(vPosition, 1.);
    vec4 scale_pos = pos * scaleMat(vec3(1.0 - 0.5 * destroyed));
    vec4 rotated_pos = scale_pos * destroyedRotation(destroyed, uTheta);
    vec4 translated_pos = rotated_pos + vec4(vTranslate, 0.);
    gl_Position = uPMatrix * uMVMatrix * translated_pos;

    fTile = vTile;
    fTexCoord = vTexCoord;
    fPicking = vDestroyed;
//
//            // Position in eye coordinates.
//            vec3 pos = (uMVMatrix * translated_pos).xyz;
//
//            // We use a fixed light position.
//            //vec3 light = (vec4(10., 10., 10., 0.)).xyz;
//            vec3 light = (uMVMatrix * vec4(0., 100., 0., 1.)).xyz;
//
//            vec3 L = normalize( light - pos );
//            vec3 E = normalize( -pos );
//            vec3 H = normalize( L + E );
//
//            vec3 normal = (rotation * vec4(vNormal.xyz, 0.)).xyz;
//
//            vec4 NN = vec4(normal,0);
//
//            // Transform vertex normal into eye coordinates
//
//            vec3 N = normalize( (modelViewMatrix*NN).xyz);
//
//            // Compute terms in the illumination equation
//            vec4 ambient = ambientProduct;
//
//            float Kd = max( dot(L, N), 0.0 );
//            vec4  diffuse = Kd*diffuseProduct;
//
//            float Ks = pow( max(dot(N, H), 0.0), shininess );
//            vec4  specular = Ks * specularProduct;
//
//            if( dot(L, N) < 0.0 ) {
//        	specular = vec4(0.0, 0.0, 0.0, 1.0);
//            }
//
//            fColor = ambient + diffuse + specular;
//
//            fColor.a = 1.0;
}
