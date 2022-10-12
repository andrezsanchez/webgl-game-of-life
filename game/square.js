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
    -3, 50,
    -3, 0,
    3, 50,
    3, 50,
    -3, 0,
    3, 0,
  ]),
};

const black = [0.1, 0.1, 0.1];
const colorAttribute = {
  name: 'aColor',
  usage: STATIC_DRAW,
  itemType: FLOAT,
  vertexSize: 3,
  data: new Float32Array([
    ...black,
    ...black,
    ...black,
    ...black,
    ...black,
    ...black,
    ...black,
    ...black,
    ...black,
  ]),
};

export const square = {
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
