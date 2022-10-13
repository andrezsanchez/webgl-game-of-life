'use strict';

var global$1 = (typeof global !== "undefined" ? global :
            typeof self !== "undefined" ? self :
            typeof window !== "undefined" ? window : {});

// from https://github.com/kumavis/browser-process-hrtime/blob/master/index.js
var performance = global$1.performance || {};
var performanceNow =
  performance.now        ||
  performance.mozNow     ||
  performance.msNow      ||
  performance.oNow       ||
  performance.webkitNow  ||
  function(){ return (new Date()).getTime() };

/**
 * Use invariant() to assert state which your program assumes to be true.
 *
 * Provide sprintf-style format (only %s is supported) and arguments
 * to provide information about what broke and what you were
 * expecting.
 *
 * The invariant message will be stripped in production, but the invariant
 * will remain to ensure logic does not differ in production.
 */

var invariant = function(condition, format, a, b, c, d, e, f) {
  {
    if (format === undefined) {
      throw new Error('invariant requires an error message argument');
    }
  }

  if (!condition) {
    var error;
    if (format === undefined) {
      error = new Error(
        'Minified exception occurred; use the non-minified dev environment ' +
        'for the full error message and additional helpful warnings.'
      );
    } else {
      var args = [a, b, c, d, e, f];
      var argIndex = 0;
      error = new Error(
        format.replace(/%s/g, function() { return args[argIndex++]; })
      );
      error.name = 'Invariant Violation';
    }

    error.framesToPop = 1; // we don't care about invariant's own frame
    throw error;
  }
};

var browser = invariant;

function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(`An error occurred compiling the shader: ${gl.getShaderInfoLog(shader)}`);
  }

  return shader;
}

function createVertexShader(gl, source) {
  return createShader(gl, gl.VERTEX_SHADER, source);
}

function createFragmentShader(gl, source) {
  return createShader(gl, gl.FRAGMENT_SHADER, source);
}

function createProgram(gl, vs, fs) {
  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  validateProgram(gl, program);
  return program;
}

function validateProgram(gl, program) {
  gl.validateProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const info = gl.getProgramInfoLog(program);
    throw new Error(`Could not compile WebGL program. \n\n${info}`);
  }
}

function checkGlError(gl) {
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
}

const screenTriangles = new Float32Array([
  0, 3,
  2.5, -1.3,
  -2.5, -1.3,
]);

function getColorAttachment(index) {
  browser(index >= 0 && index <= 15, 'index must be in [0..15]');
  return 0x8CE0 + index;
}

function getTexture(index) {
  browser(index >= 0 && index <= 31, 'index must be in [0..31]');
  return 0x84C0 + index;
}

var mainFragSource = "#version 300 es\nprecision lowp float;\n\nuniform sampler2D uTexture;\nin vec2 textureCoords;\nout vec4 color;\n\nvoid main() {\n  //vec2 uv = textureCoords / 2.0;\n  //vec2 uv = ((textureCoords / 2.0) + vec2(0.5, 0.5)) + vec2(5.0 / 255.0);\n\n  //uv.y = 1.0 - uv.y;\n  //uv = textureCoords;\n  color = vec4(vec3(texture(uTexture, textureCoords).r), 1.0);\n}\n";

var mainVertSource = "#version 300 es\nprecision lowp float;\n\nin vec2 aPosition;\nout vec2 textureCoords;\n\nvoid main() {\n  //gl_Position = vec4(aPosition, -0.5, 1.0);\n  gl_Position = vec4(aPosition, 0.0, 1.0);\n  textureCoords = ((aPosition / 2.0) + vec2(0.5));\n}\n";

var lifeFragSource = "#version 300 es\nprecision lowp float;\n\nuniform sampler2D uTexture;\nin vec2 textureCoords;\nout vec4 color;\n\nuniform vec2 uScreenSize;\n\nfloat cellState(vec2 coords) {\n  return texture(uTexture, mod(coords, vec2(1.0))).r == 1.0 ? 1.0 : 0.0;\n}\n\nfloat neighborState(vec2 relativeCoords) {\n  return cellState((textureCoords * uScreenSize + relativeCoords) / uScreenSize);\n}\n\nvec4 colorForState(float state) {\n  return vec4(vec3(state), 1.0);\n}\n\nfloat neighborCount() {\n  float count = 0.0;\n  for (float y = -1.0; y <= 1.0; y += 1.0) {\n    for (float x = -1.0; x <= 1.0; x += 1.0) {\n      //if (!(x == 0.0 && y == 0.0)) {\n        count += neighborState(vec2(x, y));\n      //}\n    }\n  }\n  return count;\n}\n\nvoid main() {\n  float count = neighborCount();\n  if (neighborState(vec2(0.0)) == 0.0) {\n    color = count == 3.0 ? colorForState(1.0) : colorForState(0.0);\n  }\n  else {\n    color = (count == 2.0 || count == 3.0) ? colorForState(1.0) : colorForState(0.0);\n  }\n}\n";

const canvasElement = document.getElementsByTagName('canvas')[0];
browser(canvasElement, 'could not find canvas element');

const width = Math.floor(canvasElement.clientWidth / 2);
const height = Math.floor(canvasElement.clientHeight / 2);

const image = new Uint8Array(width * height);
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    image[y * width + x] = (Math.random() > 0.25) ? 255 : 0;
  }
}

window.ce = canvasElement;
canvasElement.width = width;
canvasElement.height = height;
canvasElement.style.width = `${width * 2}px`;
canvasElement.style.height = `${height * 2}px`;

const gl = canvasElement.getContext(
  'webgl2',
  {
    antialias: false,
    alpha: false,
  }
);
browser(gl, 'Unable to create WebGL2 context');

// Necessary for non-power of two textures.
gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);

window.gl = gl;

const vs = createVertexShader(gl, mainVertSource);
const fs = createFragmentShader(gl, mainFragSource);
const program = createProgram(gl, vs, fs);

const lifeFs = createFragmentShader(gl, lifeFragSource);
const lifeProgram = createProgram(gl, vs, lifeFs);

const uTexture = gl.getUniformLocation(program, 'uTexture');
gl.useProgram(program);
gl.uniform1i(uTexture, 0);

const uScreenSize = gl.getUniformLocation(lifeProgram, 'uScreenSize');
gl.useProgram(lifeProgram);
gl.uniform2f(uScreenSize, width, height);

gl.viewport(0, 0, width, height);

function makeTexture(data) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.R8,
    width,
    height,
    0,
    gl.RED,
    gl.UNSIGNED_BYTE,
    data
  );
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.bindTexture(gl.TEXTURE_2D, null);

  return texture;
}

const textureA = makeTexture(image);
const textureB = makeTexture(new Uint8Array(width * height));
const texture = [textureA, textureB];

function makeFramebuffer(texture) {
  const fb = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, fb);

  gl.framebufferTexture2D(gl.FRAMEBUFFER, getColorAttachment(0), gl.TEXTURE_2D, texture, 0);

  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
  if (status !== gl.FRAMEBUFFER_COMPLETE) {
    throw new Error('Framebuffer incomplete');
  }
  checkGlError(gl);

  return fb;
}

const fb = [
  makeFramebuffer(texture[0]),
  makeFramebuffer(texture[1]),
];

const triangles = gl.createBuffer();
{
  gl.bindBuffer(gl.ARRAY_BUFFER, triangles);

  gl.bufferData(gl.ARRAY_BUFFER, screenTriangles, gl.STATIC_COPY);
  gl.bindTexture(gl.TEXTURE_2D, textureA);

  const aPosition = gl.getAttribLocation(program, 'aPosition');
  gl.enableVertexAttribArray(aPosition);
  gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, gl.FALSE, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, null);
}

let sourceTextureIndex = 0;
let targetTextureIndex = 1;

{
  const count = gl.getProgramParameter(lifeProgram, gl.ACTIVE_UNIFORMS);
  for (let i = 0; i < count; i++) {
    console.log(gl.getActiveUniform(lifeProgram, i));
  }
}
{
  const count = gl.getProgramParameter(lifeProgram, gl.ACTIVE_ATTRIBUTES);
  for (let i = 0; i < count; i++) {
    console.log(gl.getActiveAttrib(lifeProgram, i));
  }
}

function renderGeneration() {
  {
    gl.activeTexture(getTexture(0));
    gl.bindTexture(gl.TEXTURE_2D, texture[sourceTextureIndex]);
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb[targetTextureIndex]);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);

    gl.useProgram(lifeProgram);
    gl.bindBuffer(gl.ARRAY_BUFFER, triangles);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  {
    gl.activeTexture(getTexture(0));
    gl.bindTexture(gl.TEXTURE_2D, texture[targetTextureIndex]);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, triangles);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
  sourceTextureIndex = 1 - sourceTextureIndex;
  targetTextureIndex = 1 - targetTextureIndex;
}

let running = true;
function generation() {
  requestAnimationFrame(generation);
  if (running) {
    renderGeneration();
  }
}
generation();

window.addEventListener('keydown', (event) => {
  switch (event.key) {
    case ' ':
      running = !running;
    break;
    case 'ArrowRight':
      renderGeneration();
    break;
  }
});
