import { Actor, Color, Engine, Vector } from "excalibur";
import { Resources } from "../resources";
import { PointLight } from "../Lib/Lighting";

const LampColor = Color.fromHex("#d1cf9f");

export class Lamp extends Actor {
  pLight: PointLight;

  constructor(scale: Vector, pos: Vector) {
    super({
      pos,
      width: 21,
      height: 33,
      z: 1,
      anchor: Vector.Zero,
    });

    this.pLight = new PointLight({
      pos: new Vector(this.width / 2, this.height / 2),
      color: LampColor,
      intensity: 0.015,
      falloff: 0.025,
      anchor: Vector.Zero,
    });
    this.addChild(this.pLight);
  }

  onInitialize(engine: Engine): void {
    this.graphics.use(Resources.lamp.toSprite());
  }

  onPreUpdate(engine: Engine, elapsed: number): void {}
}
