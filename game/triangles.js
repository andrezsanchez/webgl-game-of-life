import mainFragSource from './main.frag.glsl';
import mainVertSource from './main.vert.glsl';

const FLOAT = 0x1406;
const TRIANGLES = 0x0004;
const STATIC_DRAW = 0x88E4;

const shader = {
  vs: mainVertSource,
  fs: mainFragSource,
};

const positionAttribute = {
  name: 'aPosition',
  usage: STATIC_DRAW,
  drawType: TRIANGLES,
  itemType: FLOAT,
  vertexSize: 2,
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
  usage: STATIC_DRAW,
  itemType: FLOAT,
  vertexSize: 3,
  data: new Float32Array([
    0.5, 0.5, 0.5,
    0.5, 0.5, 0.5,
    0.5, 0.5, 0.5,
    0.5, 0.5, 0.5,
    0.5, 0.5, 0.5,
    0.5, 0.5, 0.5,
    0.5, 0.5, 0.5,
    0.5, 0.5, 0.5,
    0.5, 0.5, 0.5,
  ]),
};

export const triangles = {
  geometry: {
    positionAttribute,
    drawType: TRIANGLES,
    attributes: [
      positionAttribute,
      colorAttribute,
    ],
  },
  shader,
};
