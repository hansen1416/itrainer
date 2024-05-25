import * as THREE from "three";

export type BoneName = "Hips" | "Spine" | "Spine1" | "Spine2" | "Neck" | "Head" | "HeadTop_End"
    | "LeftShoulder" | "LeftArm" | "LeftForeArm" | "LeftHand"
    | "RightShoulder" | "RightArm" | "RightForeArm" | "RightHand"
    | "LeftUpLeg" | "LeftLeg" | "LeftFoot" | "LeftToeBase" | "LeftToe_End"
    | "RightUpLeg" | "RightLeg" | "RightFoot" | "RightToeBase" | "RightToe_End";

export type BoneMapping = { [key: string]: THREE.Bone };

export type QuaternionArray = [number, number, number, number];

export type Vector3Array = [number, number, number];

export type AnimationDataObject = { [key: string]: QuaternionArray[] };

export type AnimationFrameDataObject = { [key: string]: QuaternionArray }

export type DiaplayScene = "mesh" | "skeleton";

export type ControlType = "rotation" | "translation" | "";

export type ApplyMethod = "linear" | "slerp";

export type WorldPoseLandmarks = { x: number, y: number, z: number, visibility: number }[];
