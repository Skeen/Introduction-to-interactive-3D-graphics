attribute vec4 vPosition;
attribute vec4 vColor;
attribute vec2 vCenterPos;

uniform float vScale;
uniform float vTime;
uniform vec2 vClickPos;

varying vec4 fColor;
varying vec4 fCenter;
varying vec4 fPosition;

const float PI      = 4. * atan(1.);

// Higher == Higher waves
const float amptitude = 0.1;
const float decay = 5.;
const float angular_frequency = 10.*PI;
const float speed = 10000. / 2.;

varying float effect;

void
main()
{
    gl_PointSize = 100. * vScale;

    fColor      = vColor;
    fCenter     = vec4(vCenterPos.xy * vScale - 1.0, 0., 1.);
    fPosition   = vec4(vPosition.xy  * vScale - 1.0, 0., 1.);

    float tTime = vTime / speed;
    float dist = distance(vPosition.xy, vClickPos);
    // Amplified sinc function with decay
    float t = dist * tTime;
    float wave = amptitude * (sin(angular_frequency * t) / (angular_frequency * t * decay));
    effect = (t == 0.) ? 0. : wave;

    gl_Position = vec4(fPosition.xy - effect, 0., 1.);
}
