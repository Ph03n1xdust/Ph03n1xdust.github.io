precision highp float;

uniform float real_size;
uniform float canvas_w;
uniform float canvas_h;

//From https://www.shadertoy.com/view/XtGGzG
float saturate( float x ) { return clamp( x, 0.0, 1.0 ); }
vec3 viridis_quintic( float x )
{
	x = saturate( x );
	vec4 x1 = vec4( 1.0, x, x * x, x * x * x ); // 1 x x2 x3
	vec4 x2 = x1 * x1.w * x; // x4 x5 x6 x7
	return vec3(
		dot( x1.xyzw, vec4( +0.280268003, -0.143510503, +2.225793877, -14.815088879 ) ) + dot( x2.xy, vec2( +25.212752309, -11.772589584 ) ),
		dot( x1.xyzw, vec4( -0.002117546, +1.617109353, -1.909305070, +2.701152864 ) ) + dot( x2.xy, vec2( -1.685288385, +0.178738871 ) ),
		dot( x1.xyzw, vec4( +0.300805501, +2.614650302, -12.019139090, +28.933559110 ) ) + dot( x2.xy, vec2( -33.491294770, +13.762053843 ) ) );
}

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

    float x = (gl_FragCoord.x/canvas_w-0.5)*real_size*2.0;
    float y = (gl_FragCoord.y/canvas_h-0.5)*real_size*2.0;

    vec2 currval = vec2(x,y);
    
    float iter = 0.0;
    for(int i=0; i<256; i++)
    {
        iter = float(i);
        if(length(currval)>thresh)
        {
            break;
        }

        currval = complex_mult(currval, currval)+c;
    }

    gl_FragColor = vec4(viridis_quintic(iter/256.0), 1.0);
}