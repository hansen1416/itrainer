import type { AnimationJson } from "../types";
import { randomString } from "../utils/ropes";
import WebStorage from "./WebStorage";

export default class ApiRequest {

    constructor() { }

    // static method `saveAnimationData`
    static async saveAnimationData(data: AnimationJson): Promise<boolean> {

        WebStorage.save("anim:my_animation_" + randomString(6), data);

        // save data to server
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    }

    static async getAnimationList(): Promise<{ "data": string[] }> {

        let animationList: string[] = [];

        const savedAnimations = WebStorage.getItemsByPrefix("anim:");

        if (savedAnimations && Object.keys(savedAnimations).length > 0) {
            animationList = Object.keys(savedAnimations);
        }

        // save data to server
        return new Promise((resolve, reject) => {
            resolve({ data: animationList });
        });
    }

    static async getAnimationData(key: string): Promise<AnimationJson> {

        const data = WebStorage.read(key);

        // save data to server
        return new Promise((resolve, reject) => {
            resolve(data);
        });
    }
}