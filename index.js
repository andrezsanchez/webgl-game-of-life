import invariant from 'invariant';
import {
  createVertexShader,
  createFragmentShader,
  createTransformProgram
} from './shader';

import feed from './feed-vs.glsl';
import fragSource from './frag.glsl';

const canvasElement = document.getElementsByTagName('canvas')[0];
invariant(canvasElement, 'could not find canvas element');

const gl = canvasElement.getContext('webgl2', {});
invariant(gl, 'Unable to create WebGL2 context');

const vs = createVertexShader(gl, feed);
const fs = createFragmentShader(gl, fragSource);
const program = createTransformProgram(gl, vs, fs, ['result']);

gl.useProgram(program);

const width = 100;
const height = 100;
gl.viewport(0, 0, width, height);

canvasElement.width = width;
canvasElement.height = height;

const bufferA = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, bufferA);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([.8,5,7,1, 5, 4, 3, 2]), gl.DYNAMIC_COPY);

const bufferB = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, bufferB);
gl.bufferData(gl.ARRAY_BUFFER, 4 * 4 * 2, gl.DYNAMIC_COPY);

const transformFeedback = gl.createTransformFeedback();
gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, transformFeedback);

const aPosLoc = gl.getAttribLocation(program, 'aPos');
gl.enableVertexAttribArray(aPosLoc);

function draw(bufferFrom, bufferTo) {
  gl.useProgram(program);

  gl.enable(gl.RASTERIZER_DISCARD);

  gl.bindBuffer(gl.ARRAY_BUFFER, bufferFrom);
  gl.vertexAttribPointer(aPosLoc, 4, gl.FLOAT, gl.FALSE, 0, 0);
  gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, bufferTo);

  gl.beginTransformFeedback(gl.POINTS);
  gl.drawArrays(gl.POINTS, 0, 2);
  gl.endTransformFeedback();

  gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, null);

  gl.disable(gl.RASTERIZER_DISCARD);
}

//draw(bufferA, bufferB);
//draw(bufferB, bufferA);

const b = new Float32Array(8);

gl.bindBuffer(gl.ARRAY_BUFFER, bufferA);
gl.getBufferSubData(gl.ARRAY_BUFFER, 0, b);
console.log(b);

draw(bufferA, bufferB);
draw(bufferB, bufferA);
draw(bufferA, bufferB);

gl.bindBuffer(gl.ARRAY_BUFFER, bufferA);
gl.getBufferSubData(gl.ARRAY_BUFFER, 0, b);
console.log(b);
gl.bindBuffer(gl.ARRAY_BUFFER, bufferB);
gl.getBufferSubData(gl.ARRAY_BUFFER, 0, b);
console.log(b);
