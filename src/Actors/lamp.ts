import { Actor, Color, Engine, Vector } from "excalibur";
import { Resources } from "../resources";
import { PointLight } from "../Lib/Lighting";

const LampColor = Color.fromHex("#d1cf9f");

export class Lamp extends Actor {
  pLight: PointLight;
  isClicked: boolean = false;
  owner: Actor;

  constructor(scale: Vector, pos: Vector, parent: Actor) {
    super({
      pos,
      width: 21,
      height: 33,
      z: 1,
      anchor: Vector.Zero,
    });

    this.owner = parent;

    this.pLight = new PointLight({
      pos: new Vector(this.width / 2, this.height / 2),
      color: LampColor,
      intensity: 0.01,
      falloff: 0.025,
      anchor: Vector.Zero,
    });
    this.addChild(this.pLight);
  }

  onInitialize(engine: Engine): void {
    this.graphics.use(Resources.lamp.toSprite());
    engine.input.pointers.primary.on("down", () => {
      this.isClicked = true;
    });
    engine.input.pointers.primary.on("up", () => {
      this.isClicked = false;
    });
  }

  onPreUpdate(engine: Engine, elapsed: number): void {
    if (this.isClicked) {
      //get pointer position
      const pointerPos = engine.input.pointers.primary.lastWorldPos;
      this.pos = pointerPos.sub(this.owner.pos);
    }
  }
}
