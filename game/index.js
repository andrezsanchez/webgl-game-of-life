import invariant from 'invariant';
import { screenTriangles } from '../screenTriangles';
import { checkGlError } from '../checkGlError';
import {
  createVertexShader,
  createFragmentShader,
  createProgram
} from '../shader';
import { uniformFloat } from '../uniformFloat';

import mainFragSource from './main.frag.glsl';
import mainVertSource from './main.vert.glsl';

const canvasElement = document.getElementsByTagName('canvas')[0];
invariant(canvasElement, 'could not find canvas element');

const width = Math.floor(canvasElement.clientWidth);
const height = Math.floor(canvasElement.clientHeight);

canvasElement.width = width;
canvasElement.height = height;
canvasElement.style.width = `${width}px`;
canvasElement.style.height = `${height}px`;

const gl = canvasElement.getContext(
  'webgl2',
  {
    antialias: true,
    alpha: false,
  }
);
invariant(gl, 'Unable to create WebGL2 context');

function draw(o) {
  gl.useProgram(o.program);

  const attribute = o.geometry.positionAttribute;
  gl.drawArrays(
    o.geometry.drawType,
    0,
    attribute.data.length / attribute.vertexSize
  );
  gl.useProgram(null);
}

const vs = createVertexShader(gl, mainVertSource);
const fs = createFragmentShader(gl, mainFragSource);
const program = createProgram(gl, vs, fs);

const positionAttribute = {
  name: 'aPosition',
  usage: gl.STATIC_COPY,
  drawType: gl.TRIANGLES,
  itemType: gl.FLOAT,
  vertexSize: 2,
  buffer: gl.createBuffer(),
  data: new Float32Array([
    -900, -400,
    0, -500,
    0, 0,
    0, 0,
    0, -500,
    300, -50,
    300, -50,
    0, -500,
    400, -250,
  ]),
};

const colorAttribute = {
  name: 'aColor',
  usage: gl.STATIC_COPY,
  itemType: gl.FLOAT,
  vertexSize: 3,
  buffer: gl.createBuffer(),
  data: new Float32Array([
    0.5, 0.5, 0.5,
    0.5, 0.5, 0.5,
    0.5, 0.5, 0.5,
    0.5, 0.5, 0.5,
    0.5, 0.5, 0.5,
    0.5, 0.5, 0.5,
    0.5, 0.5, 0.5,
    0.5, 0.5, 0.5,
    1.0, 0.5, 0.5,
  ]),
};

const triangles = {
  geometry: {
    positionAttribute,
    drawType: gl.TRIANGLES,
    attributes: [
      colorAttribute,
    ],
  },
  program,
};

function initAttribute(attribute, program) {
  gl.bindBuffer(
    gl.ARRAY_BUFFER,
    attribute.buffer,
  );

  gl.bufferData(
    gl.ARRAY_BUFFER,
    attribute.data,
    attribute.usage
  );

  const location = gl.getAttribLocation(
    program,
    attribute.name
  );

  if (location !== -1) {
    gl.enableVertexAttribArray(location);
    gl.vertexAttribPointer(
      location,
      attribute.vertexSize,
      attribute.itemType,
      gl.FALSE, 0, 0
    );
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, null);
}

uniformFloat(gl, program, 'uScreenSize', [width, height]);
uniformFloat(gl, program, 'uScreenCenter', [50, 0]);

initAttribute(triangles.geometry.positionAttribute, program);
triangles.geometry.attributes.forEach(attribute => {
  initAttribute(attribute, program);
});

const SPEED = 1000;
let x = 50;
let y = 0;

function updateScreenCenterUniform() {
  uniformFloat(gl, program, 'uScreenCenter', [x, y]);
}

const keys = new Map();
function handleInput(delta) {
  const xMove = (keys.get('ArrowRight') ? 1 : 0) - (keys.get('ArrowLeft') ? 1 : 0);
  const yMove = (keys.get('ArrowUp') ? 1 : 0) - (keys.get('ArrowDown') ? 1 : 0);
  x += xMove * delta * SPEED;
  y += yMove * delta * SPEED;
}

window.addEventListener('keydown', (event) => {
  keys.set(event.key, true);
});

window.addEventListener('keyup', (event) => {
  keys.set(event.key, false);
});

let time = 0;
function animate(milliseconds) {
  requestAnimationFrame(animate);
  const newTime = milliseconds / 1000;
  const delta = newTime - time;
  time = newTime;
  handleInput(delta);

  updateScreenCenterUniform();

  gl.clearColor(1, 1, 1, 1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
  draw(triangles);
}
requestAnimationFrame(animate);
