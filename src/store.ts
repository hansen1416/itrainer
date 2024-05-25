import * as THREE from 'three';
import { writable } from 'svelte/store';

import type { DiaplayScene, ControlType } from './types/index';
import WebStorage from './lib/WebStorage';


export const displayScene = writable<DiaplayScene>(WebStorage.read("display_scene") || "mesh");

export const controlType = writable<ControlType>(WebStorage.read("control_type") || "rotation");

export const currentRotation = writable<THREE.Euler | null>(null);

export const selectedBone = writable<THREE.Object3D | null>(null)