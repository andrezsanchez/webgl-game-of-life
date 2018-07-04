export function uniformFloat(gl, program, name, data) {
  const location = gl.getUniformLocation(program, name);
  gl.useProgram(program);
  switch (data.length) {
    case 1:
      gl.uniform1fv(location, data);
      break;
    case 2:
      gl.uniform2fv(location, data);
      break;
    case 3:
      gl.uniform3fv(location, data);
      break;
    case 4:
      gl.uniform4fv(location, data);
      break;
  }
  gl.useProgram(null);
}
