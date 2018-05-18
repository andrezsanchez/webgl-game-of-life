import invariant from 'invariant';

const canvasElement = document.getElementsByTagName('canvas')[0];
invariant(canvasElement, 'could not find canvas element');

const gl = (<WebGLRenderingContext> canvasElement.getContext('webgl2', {}));
invariant(gl, 'Unable to create WebGL2 context');

gl.clearColor(0, 0, 0, 1);
gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
