precision highp float;

void main()
{
    float x = (gl_FragCoord.x/640.0-0.5)*4.0;
    float y = (gl_FragCoord.y/480.0-0.5)*4.0;

    if(length(vec2(x,y)) > 1.0)
    {
        gl_FragColor = vec4(x, y, 0.0, 1.0);
    }
    else
    {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    }
}