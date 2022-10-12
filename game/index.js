import invariant from 'invariant';
import { checkGlError } from '../checkGlError';
import { uniformFloat } from '../uniformFloat';
import { triangles } from './triangles';
import { square } from './square';

import {
  createVertexShader,
  createFragmentShader,
  createProgram
} from '../shader';

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

function draw(o, uniforms) {
  for (const key in uniforms) {
    uniformFloat(gl, o.program, key, uniforms[key]);
  }

  gl.useProgram(o.program);

  o.geometry.attributes.forEach(attribute => {
    const location = gl.getAttribLocation(
      o.program,
      attribute.name
    );
    if (location !== -1) {
      gl.bindBuffer(
        gl.ARRAY_BUFFER,
        attribute.buffer,
      );
      gl.enableVertexAttribArray(location);
      gl.vertexAttribPointer(
        location,
        attribute.vertexSize,
        attribute.itemType,
        gl.FALSE, 0, 0
      );
      gl.bindBuffer(
        gl.ARRAY_BUFFER,
        null
      );
    }
  });

  const positionAttribute = o.geometry.positionAttribute;
  gl.drawArrays(
    o.geometry.drawType,
    0,
    positionAttribute.data.length / positionAttribute.vertexSize
  );

  o.geometry.attributes.forEach(attribute => {
    const location = gl.getAttribLocation(
      o.program,
      attribute.name
    );
    if (location !== -1) {
      gl.disableVertexAttribArray(location);
    }
  });
  gl.useProgram(null);
}

function initAttribute(attribute, program) {
  attribute.buffer = gl.createBuffer();
  gl.bindBuffer(
    gl.ARRAY_BUFFER,
    attribute.buffer,
  );

  gl.bufferData(
    gl.ARRAY_BUFFER,
    attribute.data,
    attribute.usage
  );

  gl.bindBuffer(gl.ARRAY_BUFFER, null);
}

function attribSetup(attribute, program) {
  gl.bindBuffer(
    gl.ARRAY_BUFFER,
    attribute.buffer,
  );

  const location = gl.getAttribLocation(
    program,
    attribute.name
  );

  if (location !== -1) {
    gl.vertexAttribPointer(
      location,
      attribute.vertexSize,
      attribute.itemType,
      gl.FALSE, 0, 0
    );
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
}

function initObject(o) {
  const vs = createVertexShader(gl, o.shader.vs);
  const fs = createFragmentShader(gl, o.shader.fs);
  const program = createProgram(gl, vs, fs);
  o.program = program;

  o.geometry.attributes.forEach(attribute => {
    initAttribute(attribute, program);
  });
}

const SPEED = 1000;
const keys = new Map();
function handleInput(delta, center) {
  const xMove = (keys.get('ArrowRight') ? 1 : 0) - (keys.get('ArrowLeft') ? 1 : 0);
  const yMove = (keys.get('ArrowUp') ? 1 : 0) - (keys.get('ArrowDown') ? 1 : 0);
  center[0] += xMove * delta * SPEED;
  center[1] += yMove * delta * SPEED;
}

initObject(triangles);
initObject(square);

const screenCenter = [50, 0];
const screenSize = [width, height];
const uniforms = {
  uScreenSize: screenSize,
  uScreenCenter: screenCenter,
};

const rectPosition = [0, 0];
const squareUniforms = {
  uScreenSize: screenSize,
  uScreenCenter: screenCenter,
  uModel: rectPosition,
};

let time = 0;
function animate(milliseconds) {
  requestAnimationFrame(animate);
  const newTime = milliseconds / 1000;
  const delta = newTime - time;
  time = newTime;
  handleInput(delta, rectPosition);
  screenCenter[0] = rectPosition[0];
  screenCenter[1] = rectPosition[1];

  gl.clearColor(1, 1, 1, 1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
  draw(triangles, uniforms);
  draw(square, squareUniforms);
}
requestAnimationFrame(animate);

window.addEventListener('keydown', (event) => {
  keys.set(event.key, true);
});

window.addEventListener('keyup', (event) => {
  keys.set(event.key, false);
});
