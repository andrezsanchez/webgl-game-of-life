#version 300 es
precision lowp float;

uniform sampler2D uTexture;
in vec2 textureCoords;
out vec4 color;

void main() {
  //vec2 uv = textureCoords / 2.0;
  //vec2 uv = ((textureCoords / 2.0) + vec2(0.5, 0.5)) + vec2(5.0 / 255.0);

  //uv.y = 1.0 - uv.y;
  //uv = textureCoords;
  color = vec4(vec3(texture(uTexture, textureCoords).r), 1.0);
}
