export function getColorAttachment(gl, index) {
  switch (index) {
    case 0: return gl.COLOR_ATTACHMENT0;
    case 1: return gl.COLOR_ATTACHMENT1;
    case 2: return gl.COLOR_ATTACHMENT2;
    case 3: return gl.COLOR_ATTACHMENT3;
    case 4: return gl.COLOR_ATTACHMENT4;
    case 5: return gl.COLOR_ATTACHMENT5;
    case 6: return gl.COLOR_ATTACHMENT6;
    case 7: return gl.COLOR_ATTACHMENT7;
    case 8: return gl.COLOR_ATTACHMENT8;
    case 9: return gl.COLOR_ATTACHMENT9;
    case 10: return gl.COLOR_ATTACHMENT10;
    case 11: return gl.COLOR_ATTACHMENT11;
    case 12: return gl.COLOR_ATTACHMENT12;
    case 13: return gl.COLOR_ATTACHMENT13;
    case 14: return gl.COLOR_ATTACHMENT14;
    case 15: return gl.COLOR_ATTACHMENT15;
  }
  throw new Error('Invalid index');
}

//export function getTexture(gl, index) {
//}
