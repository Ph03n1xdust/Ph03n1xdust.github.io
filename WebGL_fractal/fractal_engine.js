main();

function main() {
  var vertex_code = "";
  fetch("vertex.glsl")
    .then((resp) => resp.text())
    .then((text) => {
      vertex_code = text;
    });
  document.getElementById("demo").innerHTML = vertex_code;

  const canvas = document.querySelector("#glcanvas");
  const gl = canvas.getContext("webgl");

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
