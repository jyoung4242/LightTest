import { Actor, Color, Engine, toRadians, Vector } from "excalibur";
import { Resources } from "../resources";
import { Occluder, PointLight } from "../Lib/Lighting";

export class Crate extends Actor {
  occ: Occluder;
  pl: PointLight;
  constructor(scale: Vector, pos: Vector) {
    super({
      pos,
      width: 29,
      height: 36,
      rotation: toRadians(0),
      z: 1,
      anchor: Vector.Zero,
    });

    this.pl = new PointLight({
      pos: new Vector(this.width / 2, this.height / 2),
      color: Color.White,
      intensity: 0.005,
      falloff: 0,
      anchor: Vector.Zero,
    });

    this.occ = new Occluder({
      pos: new Vector(0.0, 36.0),
      width: 29.0,
      height: 36.0,
      imageIndex: 0,
      rotation: this.rotation,
    });
    this.addChild(this.occ);
    this.addChild(this.pl);
  }

  onInitialize(engine: Engine): void {
    this.graphics.use(Resources.crate.toSprite());
  }

  onPreUpdate(engine: Engine, elapsed: number): void {
    // console.log("crate pos: ", this.globalPos);
  }
}
