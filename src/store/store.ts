import * as THREE from 'three';
import { writable } from 'svelte/store';

import type { DiaplayScene, ControlType, AnimationQueueItem } from '../types/index';
import WebStorage from '../lib/WebStorage';


export const displayScene = writable<DiaplayScene>(WebStorage.read("display_scene") || "mesh");

export const controlType = writable<ControlType>(WebStorage.read("control_type") || "rotation");

export const currentRotation = writable<THREE.Euler | null>(null);

export const selectedBone = writable<THREE.Object3D | null>(null)

// key, value dictionary, keep all the animation data
export const animationDictStore = writable<{ [key: string]: string }>({})

export const diva = writable<THREE.Object3D | null>(null);

export const scenery = writable<THREE.Object3D | null>(null);

export const conversation = writable<string[] | null>([])

export const animation_queue = writable<AnimationQueueItem[]>([]);


