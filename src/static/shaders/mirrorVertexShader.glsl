
varying vec4 clip_coords;

void main()
{
    clip_coords = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    gl_Position = clip_coords;
}