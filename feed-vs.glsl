#version 300 es
precision highp float;
in float aValue;
out float result;

void main(void) {
   result = aValue + 1.0;
}
