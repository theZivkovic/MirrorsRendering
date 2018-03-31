
uniform sampler2D backCameraTexture;
varying vec4 clip_coords;

void main()
{
    vec2 screen_space_coords = clip_coords.xy / clip_coords.w;
    vec2 uv_coords = screen_space_coords / 2.0 + 0.5;

    gl_FragColor = texture2D(backCameraTexture, uv_coords);
}