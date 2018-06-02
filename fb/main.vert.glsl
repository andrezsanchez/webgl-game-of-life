#version 300 es
precision highp float;

in vec2 aPosition;
out vec2 textureCoords;

void main() {
  //gl_Position = vec4(aPosition, -0.5, 1.0);
  gl_Position = vec4(aPosition, 0.0, 1.0);
  textureCoords = ((aPosition / 2.0) + vec2(0.5));
}
