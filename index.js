import invariant from 'invariant';
import {
  createVertexShader,
  createFragmentShader,
  createTransformProgram
} from './shader';

import { checkGlError } from './checkGlError';

import feed from './feed-vs.glsl';
import fragSource from './frag.glsl';

const canvasElement = document.getElementsByTagName('canvas')[0];
invariant(canvasElement, 'could not find canvas element');

const gl = canvasElement.getContext('webgl2', {});
invariant(gl, 'Unable to create WebGL2 context');
gl.pixelStorei(gl.PACK_ALIGNMENT, 1);
gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);

const vs = createVertexShader(gl, feed);
const fs = createFragmentShader(gl, fragSource);
const program = createTransformProgram(gl, vs, fs, ['result']);

gl.useProgram(program);

const width = 100;
const height = 100;
gl.viewport(0, 0, width, height);

const size = 10000000;

canvasElement.width = width;
canvasElement.height = height;

const array = new Float32Array(size);
for (let i = 0; i < size; i++) {
  array[i] = Math.random();
}

const bufferA = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, bufferA);
gl.bufferData(gl.ARRAY_BUFFER, array, gl.DYNAMIC_COPY);

const bufferB = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, bufferB);
gl.bufferData(gl.ARRAY_BUFFER, size * 4, gl.DYNAMIC_COPY);

const transformFeedback = gl.createTransformFeedback();
gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, transformFeedback);

const aValue = gl.getAttribLocation(program, 'aValue');
gl.enableVertexAttribArray(aValue);

checkGlError(gl);

gl.enable(gl.RASTERIZER_DISCARD);
function draw(bufferFrom, bufferTo) {
  gl.useProgram(program);

  gl.bindBuffer(gl.ARRAY_BUFFER, bufferFrom);
  gl.vertexAttribPointer(aValue, 1, gl.FLOAT, gl.FALSE, 0, 0);
  gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, bufferTo);

  gl.beginTransformFeedback(gl.POINTS);
  gl.drawArrays(gl.POINTS, 0, size);
  gl.endTransformFeedback();

  gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, null);
}

const data = new Float32Array(size);

gl.bindBuffer(gl.ARRAY_BUFFER, bufferA);
gl.getBufferSubData(gl.ARRAY_BUFFER, 0, data);
console.log(data);

{
  const t0 = performance.now();
  for (let i = 0; i < 10; i++) {
    draw(bufferA, bufferB);
    draw(bufferB, bufferA);
  }
  //gl.bindBuffer(gl.ARRAY_BUFFER, bufferA);
  //gl.getBufferSubData(gl.ARRAY_BUFFER, 0, data);
  gl.bindBuffer(gl.ARRAY_BUFFER, bufferB);
  gl.getBufferSubData(gl.ARRAY_BUFFER, 0, data);
  const t1 = performance.now();
  console.log(t1 - t0);
}
{
  const t0 = performance.now();
  for (let n = 0; n < 10 * 2; n++) {
    for (let i = 0; i < size; i++) {
      data[i] = data[i] + 1;
    }
  }
  const t1 = performance.now();
  console.log(t1 - t0);
}

gl.bindBuffer(gl.ARRAY_BUFFER, bufferA);
gl.getBufferSubData(gl.ARRAY_BUFFER, 0, data);
console.log(data);
gl.bindBuffer(gl.ARRAY_BUFFER, bufferB);
gl.getBufferSubData(gl.ARRAY_BUFFER, 0, data);
console.log(data);

checkGlError(gl);
