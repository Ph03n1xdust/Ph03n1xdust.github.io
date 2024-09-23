var real_size = 1.5;
var offset_x = 0,
  offset_y = 0;
var gl, program_info;

var canvas, slider_w, slider_h, ctx_canvas_c;

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

//HANDLERS

function resize_handler() {
  canvas.width = slider_w.value;
  canvas.height = slider_h.value;

  gl.viewport(0, 0, canvas.width, canvas.height);

  gl.uniform1f(program_info.uniform_locations.canvas_w, slider_w.value * 1.0);
  gl.uniform1f(program_info.uniform_locations.canvas_h, slider_h.value * 1.0);
  drawScene();
}

function wheel_handler(wheelevent) {
  real_size *= 1 + wheelevent.deltaY / 1000.0;
  if (real_size < 0.00005) {
    real_size = 0.00005;
  }

  if (real_size > 3.0) {
    real_size = 3.0;
  }
  gl.uniform1f(program_info.uniform_locations.real_size, real_size * 1.0);

  drawScene();
}

function move_handler(move_event) {
  if (move_event.buttons == 1) {
    var x_scale = (real_size * 2.0) / slider_w.value;
    var y_scale = (real_size * 2.0) / slider_h.value;

    offset_x -= x_scale * move_event.movementX;
    offset_y += y_scale * move_event.movementY;

    gl.uniform1f(program_info.uniform_locations.offset_x, offset_x);
    gl.uniform1f(program_info.uniform_locations.offset_y, offset_y);

    drawScene();
  }
}

function c_change_click(clickevent) {
  gl.uniform1f(
    program_info.uniform_locations.c_real,
    (clickevent.offsetX / 200 - 0.5) * 2.0
  );
  gl.uniform1f(
    program_info.uniform_locations.c_im,
    (clickevent.offsetY / 200 - 0.5) * 2.0
  );

  ctx_canvas_c.fillStyle = "white";
  ctx_canvas_c.fillRect(0, 0, 200, 200);
  ctx_canvas_c.fillStyle = "red";
  ctx_canvas_c.fillRect(clickevent.offsetX - 5, clickevent.offsetY - 5, 10, 10);

  drawScene();
}

function c_change_move(move_event) {
  if (move_event.buttons == 1) {
    gl.uniform1f(
      program_info.uniform_locations.c_real,
      (move_event.offsetX / 200 - 0.5) * 2.0
    );
    gl.uniform1f(
      program_info.uniform_locations.c_im,
      (move_event.offsetY / 200 - 0.5) * 2.0
    );

    ctx_canvas_c.fillStyle = "white";
    ctx_canvas_c.fillRect(0, 0, 200, 200);
    ctx_canvas_c.fillStyle = "red";
    ctx_canvas_c.fillRect(
      move_event.offsetX - 5,
      move_event.offsetY - 5,
      10,
      10
    );

    drawScene();
  }
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
  canvas.onmousemove = move_handler;

  var canvas_c = document.getElementById("canvas_c");
  ctx_canvas_c = canvas_c.getContext("2d");
  canvas_c.onclick = c_change_click;
  canvas_c.onmousemove = c_change_move;

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
      offset_x: gl.getUniformLocation(shader_program, "offset_x"),
      offset_y: gl.getUniformLocation(shader_program, "offset_y"),
      c_real: gl.getUniformLocation(shader_program, "c_real"),
      c_im: gl.getUniformLocation(shader_program, "c_im"),
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
  gl.uniform1f(program_info.uniform_locations.offset_x, 0.0);
  gl.uniform1f(program_info.uniform_locations.offset_y, 0.0);
  gl.uniform1f(program_info.uniform_locations.c_real, -0.4);
  gl.uniform1f(program_info.uniform_locations.c_im, 0.6);

  drawScene();
}
