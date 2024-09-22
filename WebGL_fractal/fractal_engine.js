var real_size = 1.5;
var gl, program_info;

var canvas, slider_w, slider_h;

await main();

//This should be one generic loader
async function getCompiledShaders(gl) {
  var vertex_code = await fetch("vertex.glsl").then((resp) => {
    return resp.text();
  });
  var fragment_code = await fetch("fragment.glsl").then((resp) => {
    return resp.text();
  });

  const vertex_shader = gl.createShader(gl.VERTEX_SHADER);
  const fragment_shader = gl.createShader(gl.FRAGMENT_SHADER);

  gl.shaderSource(vertex_shader, vertex_code);
  gl.shaderSource(fragment_shader, fragment_code);

  gl.compileShader(vertex_shader);
  gl.compileShader(fragment_shader);

  if (
    !gl.getShaderParameter(vertex_shader, gl.COMPILE_STATUS) ||
    !gl.getShaderParameter(fragment_shader, gl.COMPILE_STATUS)
  ) {
    alert(
      `An error occured with shader compilation! ${gl.getShaderInfoLog(
        vertex_shader
      )} ${gl.getShaderInfoLog(fragment_shader)}`
    );
    return null;
  }

  return [vertex_shader, fragment_shader];
}

function initShaderProgram(gl, vertex_shader, fragment_shader) {
  const shader_program = gl.createProgram();
  gl.attachShader(shader_program, vertex_shader);
  gl.attachShader(shader_program, fragment_shader);
  gl.linkProgram(shader_program);

  // If creating the shader program failed, alert

  if (!gl.getProgramParameter(shader_program, gl.LINK_STATUS)) {
    alert(
      `Unable to initialize the shader program: ${gl.getProgramInfoLog(
        shader_program
      )}`
    );
    return null;
  }

  return shader_program;
}

function initBuffers(gl) {
  const position_buffer = initPositionBuffer(gl);

  return {
    position: position_buffer,
  };
}

function initPositionBuffer(gl) {
  const position_buffer = gl.createBuffer();

  gl.bindBuffer(gl.ARRAY_BUFFER, position_buffer);

  const positions = [1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, -1.0];

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  return position_buffer;
}

// Tell WebGL how to pull out the positions from the position
// buffer into the vertexPosition attribute.
function setPositionAttribute(gl, buffers, program_info) {
  const numComponents = 2; // pull out 2 values per iteration
  const type = gl.FLOAT; // the data in the buffer is 32bit floats
  const normalize = false; // don't normalize
  const stride = 0; // how many bytes to get from one set of values to the next
  // 0 = use type and numComponents above
  const offset = 0; // how many bytes inside the buffer to start from
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
  gl.vertexAttribPointer(
    program_info.attrib_locations.vertexPosition,
    numComponents,
    type,
    normalize,
    stride,
    offset
  );
  gl.enableVertexAttribArray(program_info.attrib_locations.vertexPosition);
}

function drawScene() {
  gl.clearColor(0.0, 0.0, 0.0, 1.0); // Clear to black, fully opaque
  gl.clearDepth(1.0); // Clear everything
  gl.enable(gl.DEPTH_TEST); // Enable depth testing
  gl.depthFunc(gl.LEQUAL); // Near things obscure far things

  // Clear the canvas before we start drawing on it.

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  {
    const offset = 0;
    const vertexCount = 4;
    gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);
  }
}

function resize_handler() {
  canvas.width = slider_w.value;
  canvas.height = slider_h.value;

  gl.viewport(0, 0, canvas.width, canvas.height);

  gl.uniform1f(program_info.uniform_locations.canvas_w, slider_w.value * 1.0);
  gl.uniform1f(program_info.uniform_locations.canvas_h, slider_h.value * 1.0);
  drawScene();
}

function wheel_handler(wheelevent) {
  real_size += wheelevent.deltaY / 700.0;
  if (real_size < 0.1) {
    real_size = 0.1;
  }

  if (real_size > 3.0) {
    real_size = 3.0;
  }
  gl.uniform1f(program_info.uniform_locations.real_size, real_size * 1.0);

  drawScene();
}

async function main() {
  canvas = document.querySelector("#glcanvas");

  gl = canvas.getContext("webgl");
  if (gl === null) {
    alert(
      "Unable to initialize WebGL. Your browser or machine may not support it."
    );
    return;
  }

  slider_w = document.getElementById("slider_w");
  slider_h = document.getElementById("slider_h");
  slider_w.oninput = resize_handler;
  slider_h.oninput = resize_handler;
  canvas.onwheel = wheel_handler;

  var vertex_shader, fragment_shader;
  [vertex_shader, fragment_shader] = await getCompiledShaders(gl);

  var shader_program = initShaderProgram(gl, vertex_shader, fragment_shader);

  program_info = {
    program: shader_program,
    attrib_locations: {
      vertexPosition: gl.getAttribLocation(shader_program, "aVertexPosition"),
    },
    uniform_locations: {
      real_size: gl.getUniformLocation(shader_program, "real_size"),
      canvas_w: gl.getUniformLocation(shader_program, "canvas_w"),
      canvas_h: gl.getUniformLocation(shader_program, "canvas_h"),
    },
  };

  const buffers = initBuffers(gl);

  // Tell WebGL how to pull out the positions from the position
  // buffer into the vertexPosition attribute.
  setPositionAttribute(gl, buffers, program_info);

  // Tell WebGL to use our program when drawing
  gl.useProgram(program_info.program);

  //Set defaults
  gl.uniform1f(program_info.uniform_locations.canvas_w, slider_w.value * 1.0);
  gl.uniform1f(program_info.uniform_locations.canvas_h, slider_h.value * 1.0);
  gl.uniform1f(program_info.uniform_locations.real_size, real_size * 1.0);
  drawScene();
}
