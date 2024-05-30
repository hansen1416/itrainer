import type { AnimationJson } from "../types";
import { randomString } from "../utils/ropes";

export default class ApiRequest {

    constructor() { }

    // static method `saveAnimationData`
    static async saveAnimationData(data: AnimationJson): Promise<boolean> {

        localStorage.setItem(
            "anim:my_animation_" + randomString(6),
            JSON.stringify(data, null, 2),
        );

        // save data to server
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    }
}