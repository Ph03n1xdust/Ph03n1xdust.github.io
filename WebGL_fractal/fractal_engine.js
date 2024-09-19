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

function drawScene(gl, program_info, buffers, maxval) {
  gl.clearColor(0.0, 0.0, 0.0, 1.0); // Clear to black, fully opaque
  gl.clearDepth(1.0); // Clear everything
  gl.enable(gl.DEPTH_TEST); // Enable depth testing
  gl.depthFunc(gl.LEQUAL); // Near things obscure far things

  // Clear the canvas before we start drawing on it.

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Tell WebGL how to pull out the positions from the position
  // buffer into the vertexPosition attribute.
  setPositionAttribute(gl, buffers, program_info);

  // Tell WebGL to use our program when drawing
  gl.useProgram(program_info.program);
  gl.uniform1f(program_info.uniform_locations.maxval, maxval);

  {
    const offset = 0;
    const vertexCount = 4;
    gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);
  }
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

async function main() {
  const canvas = document.querySelector("#glcanvas");
  const gl = canvas.getContext("webgl");

  // Only continue if WebGL is available and working
  if (gl === null) {
    alert(
      "Unable to initialize WebGL. Your browser or machine may not support it."
    );
    return;
  }

  var vertex_shader, fragment_shader;
  [vertex_shader, fragment_shader] = await getCompiledShaders(gl);

  var shader_program = initShaderProgram(gl, vertex_shader, fragment_shader);

  const program_info = {
    program: shader_program,
    attrib_locations: {
      vertexPosition: gl.getAttribLocation(shader_program, "aVertexPosition"),
    },
    uniform_locations: {
      maxval: gl.getUniformLocation(shader_program, "maxval"),
    },
  };

  const buffers = initBuffers(gl);

  var slider = document.getElementById("maxval");

  slider.oninput = function () {
    drawScene(gl, program_info, buffers, this.value / 10);
  };
  drawScene(gl, program_info, buffers, slider.value / 10);
}
