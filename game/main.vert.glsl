#version 300 es
precision highp float;

uniform vec2 uModel;
uniform vec2 uScreenSize;
uniform vec2 uScreenCenter;
in vec2 aPosition;
in vec3 aColor;
out vec3 color;

void main() {
  gl_Position = vec4(((uModel + aPosition - uScreenCenter) / uScreenSize), 0.0, 1.0);
  color = aColor;
}
