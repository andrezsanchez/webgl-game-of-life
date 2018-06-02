export function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error('An error occurred compiling the shader: ' + gl.getShaderInfoLog(shader));
  }

  return shader;
}

export function createVertexShader(gl, source) {
  return createShader(gl, gl.VERTEX_SHADER, source);
}

export function createFragmentShader(gl, source) {
  return createShader(gl, gl.FRAGMENT_SHADER, source);
}

export function createTransformProgram(gl, vs, fs, varyings) {
  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.transformFeedbackVaryings(program, varyings, gl.SEPARATE_ATTRIBS);
  gl.linkProgram(program);
  validateProgram(gl, program);
  return program;
}

export function createProgram(gl, vs, fs) {
  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  validateProgram(gl, program);
  return program;
}

export function validateProgram(gl, program) {
  gl.validateProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    var info = gl.getProgramInfoLog(program);
    throw new Error('Could not compile WebGL program. \n\n' + info);
  }
}
