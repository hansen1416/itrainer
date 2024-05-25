import { loadFBX, loadGLTF } from "./ropes";

export function loadDiva (_diva) {
    if (_diva && typeof _diva === "object" && _diva.isObject3D === true) {
        return Promise.resolve(_diva);
    }

    return new Promise((resolve, reject) => {
        loadFBX("/fbx/taunt.fbx")
            .then((fbx) => {
                resolve(fbx);
            })
            .catch((err) => {
                reject(err);
            });
    });
}

export function loadScenery (_scenery) {
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
                room.scale.set(40, 40, 40);
                // set room position to 10, 0, 0
                room.position.set(0, 0, -500);
                // rotate room 90 degree along z axis
                room.rotation.set(0, Math.PI / -2, 0);

                resolve(room);
            })
            .catch((err) => {
                reject(err);
            });
    });
}