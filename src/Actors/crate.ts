import { Actor, Engine, Vector } from "excalibur";
import { Resources } from "../resources";
import { Occluder } from "../Lib/Lighting";

export class Crate extends Actor {
  occ: Occluder;
  constructor(scale: Vector, pos: Vector) {
    super({
      pos,
      width: 29,
      height: 36,

      z: 1,
      anchor: Vector.Zero,
    });
    this.occ = new Occluder({
      pos: Vector.Zero,
      width: 29,
      height: 36,
      anchor: Vector.Zero,
      imageIndex: 0,
    });
    this.addChild(this.occ);
  }

  onInitialize(engine: Engine): void {
    this.graphics.use(Resources.crate.toSprite());
  }
}
