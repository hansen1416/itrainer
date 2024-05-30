import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { BVHLoader } from "three/examples/jsm/loaders/BVHLoader.js";
// @ts-ignore
import { type GLTF } from "@types/three/examples/jsm/loaders/GLTFLoader.d.ts"
// @ts-ignore
import { type BVH } from "@types/three/examples/jsm/loaders/BVHLoader.d.ts"
import * as THREE from "three";

import type { QuaternionArray } from "../types";

export function randomString(length: number): string {
    const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
    let randomstring = "";
    for (let i = 0; i < length; i++) {
        const rnum = Math.floor(Math.random() * chars.length);
        randomstring += chars.substring(rnum, rnum + 1);
    }
    return randomstring;
}

export function loadBVH(url: string): Promise<BVH> {
    return new Promise((resolve) => {
        const loader = new BVHLoader();
        loader.load(url,
            (result) => resolve(result),
            (xhr) => {
                console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
            },
            (error) => {
                console.log(error);
            });
    });
}

export function loadGLTF(url: string): Promise<GLTF> {
    return new Promise((resolve) => {
        const loader = new GLTFLoader();
        loader.load(url, (gltf) => resolve(gltf));
    });
}

export function loadFBX(url: string): Promise<THREE.Group> {
    return new Promise((resolve) => {
        const fbxLoader = new FBXLoader();
        fbxLoader.load(
            url,
            (object) => {
                resolve(object);
            },
            (xhr) => {
                console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
            },
            (error) => {
                console.log(error);
            }
        );
    });
}

export function loadJSON(url: string): Promise<object> {
    return new Promise((resolve) => {
        fetch(url).then((response) => resolve(response.json()));
    });
}

export function loadObj(url: string): Promise<THREE.Group> {
    return new Promise((resolve) => {
        const loader = new OBJLoader();
        loader.load(url, (fbx) => resolve(fbx));
    });
}

export function getNamedIntersects(
    intersects: THREE.Intersection[],
): THREE.Intersection | null {
    let valid_obj: THREE.Intersection | null = null;

    for (const intersect of intersects) {
        if (intersect.object.name) {
            valid_obj = intersect;

            break;
        }
    }

    return valid_obj;
}


export function setMeshOpacity(object3d: THREE.Object3D, opacity: number): void {
    for (const child of object3d.children) {
        if (child instanceof THREE.SkinnedMesh === false) continue;

        const mat = (child as THREE.SkinnedMesh)
            .material as THREE.MeshStandardMaterial;

        mat.opacity = opacity;
    }
}

export function getMousePosition(event: MouseEvent): { "x": number, "y": number } {
    const x: number = (event.clientX / window.innerWidth) * 2 - 1;
    const y: number = -(event.clientY / window.innerHeight) * 2 + 1;
    return { x: x, y: y }
}

/**
 * binary search algorithm
 * @param {Array} arr 
 * @param {number} target 
 * @returns 
 */
export function binarySearch(arr: number[], target: number) {

    let low = 0;
    let high = arr.length - 1;

    while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        if (arr[mid] === target) return mid; // Found at the middle
        else if (arr[mid] < target) low = mid + 1; // Search in the right half
        else high = mid - 1; // Search in the left half
    }
    // If not found, return the insertion index (between elements)
    return low;
}

/**
 * insert a number into a sorted array, keeping it sorted
 * @param {number[]} arr 
 * @param {number} num 
 * @returns 
 */
export function insertIntoSortedArray(arr: number[], num: number) {
    const insertionIndex = binarySearch(arr, num);
    arr.splice(insertionIndex, 0, num);
    return arr;
}

/**
 * apply joints rotations to the bones of a model
 * @param boneRotations 
 * @param modelBones 
 */
export function rotateBones(
    boneRotations: { [key: string]: QuaternionArray },
    modelBones: { [key: string]: THREE.Bone },
) {
    for (const [boneName, rotation] of Object.entries(boneRotations)) {
        const bone = modelBones[boneName];

        if (bone) {
            bone.quaternion.fromArray(rotation);
        }
    }
}


export function invokeCamera(videoElement: HTMLVideoElement, callback: () => void) {
    /** @param {object} e */
    const errorCallback = (e: any) => {
        alert("camera error!!");
        console.log(e);
    };

    const constraints = {
        audio: false,
        // facingMode: "user", // selfie camera
        // facingMode: "environment", // back camera
        video: {
            frameRate: { ideal: 20, max: 30 },
            width: { ideal: 640, max: 640 },
            height: { ideal: 480, max: 480 },
        },
    };

    const successCallback = (stream: MediaSource | Blob | MediaStream) => {
        // Yay, now our webcam input is treated as a normal video and
        // we can start having fun
        try {
            videoElement.srcObject = stream;

            // console.log(stream_settings);
        } catch (error) {
            videoElement.src = window.URL.createObjectURL(stream as MediaSource | Blob);
        }

        if (callback) {
            callback();
        }
    };
    // @ts-ignore
    navigator.getUserMedia =
        (navigator as any).getUserMedia ||
        (navigator as any).webkitGetUserMedia ||
        (navigator as any).mozGetUserMedia ||
        (navigator as any).msGetUserMedia;

    if (navigator.mediaDevices) {
        navigator.mediaDevices
            .getUserMedia(constraints)
            .then(successCallback, errorCallback);
    } else if ((navigator as any).getUserMedia) {
        (navigator as any).getUserMedia(constraints, successCallback, errorCallback);
    } else {
        alert("getUserMedia() is not supported in your browser");
    }
}



export const BlazePoseKeypointsValues = {
    NOSE: 0,
    LEFT_EYE_INNER: 1,
    LEFT_EYE: 2,
    LEFT_EYE_OUTER: 3,
    RIGHT_EYE_INNER: 4,
    RIGHT_EYE: 5,
    RIGHT_EYE_OUTER: 6,
    LEFT_EAR: 7,
    RIGHT_EAR: 8,
    LEFT_RIGHT: 9,
    RIGHT_LEFT: 10,
    LEFT_SHOULDER: 11,
    RIGHT_SHOULDER: 12,
    LEFT_ELBOW: 13,
    RIGHT_ELBOW: 14,
    LEFT_WRIST: 15,
    RIGHT_WRIST: 16,
    LEFT_PINKY: 17,
    RIGHT_PINKY: 18,
    LEFT_INDEX: 19,
    RIGHT_INDEX: 20,
    LEFT_THUMB: 21,
    RIGHT_THUMB: 22,
    LEFT_HIP: 23,
    RIGHT_HIP: 24,
    LEFT_KNEE: 25,
    RIGHT_KNEE: 26,
    LEFT_ANKLE: 27,
    RIGHT_ANKLE: 28,
    LEFT_HEEL: 29,
    RIGHT_HEEL: 30,
    LEFT_FOOT_INDEX: 31,
    RIGHT_FOOT_INDEX: 32,
};


export function loadDiva(_diva: THREE.Object3D) {
    if (_diva && typeof _diva === "object" && _diva.isObject3D === true) {
        return Promise.resolve(_diva);
    }

    return new Promise((resolve, reject) => {
        loadGLTF("/glb/dors.glb")
            .then((dors) => {
                const anya = dors.scene;

                anya.position.set(0, 0.04, 0);

                resolve(anya);
            })
            .catch((err) => {
                reject(err);
            });
    });
}

export function loadScenery(_scenery: THREE.Object3D) {
    if (
        _scenery &&
        typeof _scenery === "object" &&
        _scenery.isObject3D === true
    ) {
        return Promise.resolve(_scenery);
    }

    return new Promise((resolve, reject) => {
        loadGLTF("/glb/vr_exhibition_gallery_baked.glb")
            .then((glb) => {
                const room = glb.scene;
                // scale room up by 20
                // room.scale.set(0.5, 0.5, 0.5);
                // set room position to 10, 0, 0
                room.position.set(0, 0, -4);
                // rotate room 90 degree along z axis
                room.rotation.set(0, Math.PI / -2, 0);

                resolve(room);
            })
            .catch((err) => {
                reject(err);
            });
    });
}