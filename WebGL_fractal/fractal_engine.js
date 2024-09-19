main();

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
    alert("An error occured with shader compilation!");
    return null;
  }

  return [vertex_shader, fragment_shader];
}

function main() {
  const canvas = document.querySelector("#glcanvas");
  const gl = canvas.getContext("webgl");

  var vertex_shader, fragment_shader;
  [vertex_shader, fragment_shader] = getCompiledShaders(gl);

  // Only continue if WebGL is available and working
  if (gl === null) {
    alert(
      "Unable to initialize WebGL. Your browser or machine may not support it."
    );
    return;
  }

  // Set clear color to black, fully opaque
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  // Clear the color buffer with specified clear color
  gl.clear(gl.COLOR_BUFFER_BIT);
}
