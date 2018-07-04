import invariant from 'invariant';
export function getColorAttachment(index) {
  invariant(index >= 0 && index <= 15, 'index must be in [0..15]');
  return 0x8CE0 + index;
}

export function getTexture(index) {
  invariant(index >= 0 && index <= 31, 'index must be in [0..31]');
  return 0x84C0 + index;
}

export function getDrawBuffer(index) {
  invariant(index >= 0 && index <= 15, 'index must be in [0..15]');
  return 0x8825 + index;
}
