#version 300 es
precision highp float;

uniform sampler2D uTexture;
in vec2 textureCoords;
out vec4 color;

uniform vec2 uScreenSize;

float cellState(vec2 coords) {
  return texture(uTexture, mod(coords, vec2(1.0))).r == 1.0 ? 1.0 : 0.0;
}

float neighborState(vec2 relativeCoords) {
  return cellState((textureCoords * uScreenSize + relativeCoords) / uScreenSize);
  //return cellState((textureCoords * screenSize + vec2(1.0)) / screenSize);
}

vec4 colorForState(float state) {
  return vec4(vec3(state), 1.0);
}

float neighborCount() {
  float count = 0.0;
  for (float y = -1.0; y <= 1.0; y += 1.0) {
    for (float x = -1.0; x <= 1.0; x += 1.0) {
      if (!(x == 0.0 && y == 0.0)) {
        count += neighborState(vec2(x, y));
      }
    }
  }
  return count;
}

void main() {
  float count = neighborCount();
  if (neighborState(vec2(0.0)) == 0.0) {
    color = count == 3.0 ? colorForState(1.0) : colorForState(0.0);
  }
  else {
    color = (count == 2.0 || count == 3.0) ? colorForState(1.0) : colorForState(0.0);
  }
}
