import { ActorArgs, Color, World, Camera, Engine } from "excalibur";
import { LightingPostProcessor } from "./LightingPostProcessor";

export type PointLightActorArgs = ActorArgs & PointLightComponentConfig;
export type AmbientLightActorArgs = ActorArgs & AmbientLightComponentConfig;
export type OccluderActorArgs = ActorArgs & OccluderComponentConfig;

/*
    Lighting System Component Configs
*/

export interface PointLightComponentConfig {
  color: Color;
  intensity: number;
  falloff: number;
}

export interface AmbientLightComponentConfig {
  color: Color;
  intensity: number;
}
export interface OccluderComponentConfig {
  imageIndex: number;
}

/*
    Lighting System Config
*/

export interface LightingSystemConfig {
  lightingBufferSize: number; // # of pixels buffer around the screen to render lights into, even if just off camera
  postProcessor: LightingPostProcessor;
  engine: Engine;
  rayStepSize: number;
}
