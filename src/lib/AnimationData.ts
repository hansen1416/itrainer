import * as THREE from "three";

import type { QuaternionArray, AnimationDataObject, AnimationFrameDataObject, ApplyMethod } from "../types";
import { insertIntoSortedArray } from "../utils/ropes";

/**
 * Searches for the element in the array and returns the adjacent elements' indices.

    If x is less than arr[0], returns - 1, 0.
    If x is greater than arr[-1], returns len(arr) - 1, len(arr).
    If x is in the array, returns the index of the element and the next element index.
        Otherwise, returns the indices of the elements between which x should be inserted.

    Args:
        arr: Sorted list of integers.
        low: Start index.
        high: End index.
        x: Target element.

    Returns:
        low: Index of the element less than or equal to x.
        high: Index of the element greater than x.

 * @param arr 
 * @param low 
 * @param high 
 * @param x 
 * @returns 
 */
function binarySearchModified(arr: number[], low: number, high: number, x: number) {

    while (low <= high) {
        const mid = Math.floor((low + high) / 2);

        // Check if x is present at mid
        if (arr[mid] === x) {

            if (mid === 0) {
                // if mid is 0, return 0 and 1
                return [mid, mid + 1];
            } else if (mid === arr.length - 1) {
                // if mid is last element, return last - 1 and last
                return [mid - 1, mid];
            } else {
                return [mid - 1, mid + 1];
            }
        }

        // If x is greater, search right half and update low
        if (arr[mid] < x) {
            low = mid + 1;
        }

        // If x is smaller, search left half and update high (important change)
        else {
            high = mid - 1;
        }
    }

    if (low > arr.length - 1) {
        return [arr.length - 2, arr.length - 1];
    }

    if (high < 0) {
        return [0, 1];
    }

    // If we reach here, then the element was not present
    // Check if x is smaller than the first element
    if (x < arr[low]) {
        return [low - 1, low];
    }

    // Check if x is greater than the last element
    if (x > arr[high]) {
        return [high, high + 1];
    }

    // Target is between elements at high and low (modified part)
    return [low, high];
}

export default class AnimationData {

    total_frames: number = 0;

    current_frame: number = 0;

    data: AnimationDataObject = {};

    bones: { [key: string]: THREE.Bone } = {};

    keyframes: { [key: string]: number[] } = {}

    constructor() {

    }

    initalize(bone_names: string[]): void {
        bone_names.forEach((name) => {
            this.data[name] = [];
        });
    }

    appendData(frameData: AnimationFrameDataObject): void {
        for (let key in frameData) {
            this.data[key].push(frameData[key]);
        }

        this.total_frames = this.data[Object.keys(this.data)[0]].length - 1;
    }

    loadData(data: AnimationDataObject, bones: { [key: string]: THREE.Bone }): void {

        this.bones = bones;

        if (!data || !Object.keys(data).length) {
            return;
        }

        this.data = data;
        this.total_frames = this.data[Object.keys(this.data)[0]].length - 1;
    }

    getFrameData(frame_idx: number): AnimationFrameDataObject {
        let frame_data: AnimationFrameDataObject = {};

        for (let key in this.data) {
            frame_data[key] = this.data[key][frame_idx];
        }

        return frame_data;
    }

    getBoneData(bone_name: string): QuaternionArray[] {
        return this.data[bone_name];
    }

    setBoneData(bone_name: string, data: QuaternionArray[]): void {
        this.data[bone_name] = data;
    }

    getBoneKeyFrames(bone_name: string): number[] {
        return this.keyframes[bone_name] ?? [];
    }

    applyRotation(frame_idx: number): void {

        this.current_frame = frame_idx;

        let frame_data = this.getFrameData(frame_idx);

        for (let key in frame_data) {
            if (!this.bones[key]) {
                continue;
            }
            this.bones[key].quaternion.fromArray(frame_data[key]);
        }
    }

    editBoneFrameRotation(bone_name: string, rotation: THREE.Euler, method: ApplyMethod): void {

        const q = new THREE.Quaternion().setFromEuler(rotation);
        // edit animation data at `current_frame`, on bone `bone_name`
        this.data[bone_name][this.current_frame] = q.toArray() as QuaternionArray;

        // then apply the rotation to the bone
        this.applyRotation(this.current_frame);

        let boneKeyFrame = this.getBoneKeyFrames(bone_name);

        boneKeyFrame = [0].concat(boneKeyFrame, [this.total_frames - 1]);

        // find the left/right keyframes of this.current_frame
        const [left, right] = binarySearchModified(boneKeyFrame, 0, boneKeyFrame.length - 1, this.current_frame);

        // apply rotation to other frames between two keyframes
        // if current frame is a keyframe, it should effect two keyframes interval adjacent to it
        if (method === 'linear') {
            this.#linearInterpolate(bone_name, boneKeyFrame[left], boneKeyFrame[right]);
        } else {
            this.#bezierInterpolate(bone_name, boneKeyFrame[left], boneKeyFrame[right]);
        }
    }

    #linearInterpolate(bone_name: string, left: number, right: number): void {

        const boneAnimationData = this.getBoneData(bone_name);

        const leftQuaternion = new THREE.Quaternion().fromArray(boneAnimationData[left]);
        const rightQuaternion = new THREE.Quaternion().fromArray(boneAnimationData[right]);

        const middleQuaternion = new THREE.Quaternion().fromArray(boneAnimationData[this.current_frame]);
        // console.log(leftQuaternion, rightQuaternion, middleQuaternion);

        for (let i = left + 1; i < this.current_frame; i++) {
            const t = (i - left) / (this.current_frame - left);
            const q = new THREE.Quaternion().slerpQuaternions(leftQuaternion, middleQuaternion, t);

            boneAnimationData[i] = q.toArray() as QuaternionArray;
        }


        for (let i = this.current_frame + 1; i < right; i++) {
            const t = (i - this.current_frame) / (right - this.current_frame);
            const q = new THREE.Quaternion().slerpQuaternions(middleQuaternion, rightQuaternion, t);

            boneAnimationData[i] = q.toArray() as QuaternionArray;
        }

        // console.log(boneAnimationData);

        this.setBoneData(bone_name, boneAnimationData);
    }

    #bezierInterpolate(bone_name: string, left: number, right: number): void { }

    loadKeyFrames(keyframes: { [key: string]: number[] }): void {
        this.keyframes = keyframes;
    }


    addKeyFrame(bone_name: string, frame_idx: number): void {
        let boneKeyFrame = this.getBoneKeyFrames(bone_name);

        // check if frame_idx is already a keyframe
        if (boneKeyFrame.includes(frame_idx)) {
            return;
        }

        this.keyframes[bone_name] = insertIntoSortedArray(boneKeyFrame, frame_idx);
    }


    deleteKeyFrame(bone_name: string, frame_idx: number): void {
        let boneKeyFrame = this.getBoneKeyFrames(bone_name);

        const idx = boneKeyFrame.indexOf(frame_idx);

        if (idx !== -1) {
            console.log('deleting keyframe', frame_idx, idx);
            this.keyframes[bone_name].splice(idx, 1);
        }
    }

    exportData(): { data: AnimationDataObject, keyframes: { [key: string]: number[] } } {
        return {
            data: this.data,
            keyframes: this.keyframes
        };
    }

}