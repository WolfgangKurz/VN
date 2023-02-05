import * as PIXI from "pixi.js";

import { nRGBA } from "./Types";

export default class SolidFilter extends PIXI.Filter {
	constructor () {
		super(undefined, SolidFilter._fragmentSrc);
		this.uniforms.blendColor = [0, 0, 0, 0];
	}

	public setBlendColor (color: nRGBA) {
		this.uniforms.blendColor = color.slice();
	}

	protected static readonly _fragmentSrc: string = `
varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform vec4 blendColor;
void main() {
  vec4 sample = texture2D(uSampler, vTextureCoord);
  vec3 rgb = sample.rgb;
  float a = sample.a;
  float r = blendColor.r / 255.0;
  float g = blendColor.g / 255.0;
  float b = blendColor.b / 255.0;
  float r1 = clamp(r * a, 0.0, 1.0);
  float g1 = clamp(g * a, 0.0, 1.0);
  float b1 = clamp(b * a, 0.0, 1.0);
  gl_FragColor = vec4(r1, g1, b1, a);
}`;
}
