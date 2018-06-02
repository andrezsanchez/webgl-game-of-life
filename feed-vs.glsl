#version 300 es
precision highp float;
in vec4 aPos;
out vec4 result;

void main(void) {
   result = aPos.xyzw + vec4(1.0);
}
