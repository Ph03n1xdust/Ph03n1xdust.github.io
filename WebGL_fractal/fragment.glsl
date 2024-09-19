precision highp float;

vec2 complex_mult(vec2 a, vec2 b)
{
    return vec2(a.x*b.x-a.y*b.y, a.x*b.y+a.y*b.x);
}

void main()
{
    float c_real = -0.4;
    float c_im = 0.6;
    float thresh = 10.0;

    vec2 c = vec2(c_real, c_im);

    float x = (gl_FragCoord.x/640.0-0.5)*4.0;
    float y = (gl_FragCoord.y/480.0-0.5)*4.0;

    vec2 currval = vec2(x,y);
    
    int i = 0;
    for(i=0; i<256; i++)
    {
        if(length(currval)>thresh)
        {
            break;
        }

        currval = complex_mult(currval, currval)+c;
    }

    gl_FragColor = vec4(i/256.0, i/256.0, i/256.0, 1.0);
}