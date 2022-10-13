import invariant from 'invariant';
import {
  createVertexShader,
  createFragmentShader,
  createProgram
} from './shader';

import { checkGlError } from './checkGlError';
import { screenTriangles } from './screenTriangles';
import {
  getColorAttachment,
  getTexture,
} from './getColorAttachment';

import mainFragSource from './main.frag.glsl';
import mainVertSource from './main.vert.glsl';
import lifeFragSource from './life.frag.glsl';

const canvasElement = document.getElementsByTagName('canvas')[0];
invariant(canvasElement, 'could not find canvas element');

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
invariant(gl, 'Unable to create WebGL2 context');

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
