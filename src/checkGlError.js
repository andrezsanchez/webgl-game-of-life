export function checkGlError(gl) {
  const glErrorStrings = {
    [gl.NO_ERROR]: 'NO_ERROR',
    [gl.INVALID_ENUM]: 'INVALID_ENUM',
    [gl.INVALID_VALUE]: 'INVALID_VALUE',
    [gl.INVALID_OPERATION]: 'INVALID_OPERATION',
    [gl.INVALID_FRAMEBUFFER_OPERATION]: 'INVALID_FRAMEBUFFER_OPERATION',
    [gl.OUT_OF_MEMORY]: 'OUT_OF_MEMORY',
    [gl.CONTEXT_LOST_WEBGL]: 'CONTEXT_LOST_WEBGL',
  };
  const err = gl.getError();
  if (err) {
    throw new Error(glErrorStrings[err]);
  }
};
