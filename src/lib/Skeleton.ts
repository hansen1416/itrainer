import * as THREE from 'three';

export default class Skeleton {

    group: THREE.Group = new THREE.Group();

    bone_names: { [key: string]: number } = {
        "Hips": 0,
        "Spine": 1,
        "Spine1": 2,
        "Spine2": 3,
        "Neck": 4,
        "Head": 5,
        "HeadTop_End": 6,
        "LeftShoulder": 7,
        "LeftArm": 8,
        "LeftForeArm": 9,
        "LeftHand": 10,
        "RightShoulder": 11,
        "RightArm": 12,
        "RightForeArm": 13,
        "RightHand": 14,
        "LeftUpLeg": 15,
        "LeftLeg": 16,
        "LeftFoot": 17,
        "LeftToeBase": 18,
        "LeftToe_End": 19,
        "RightUpLeg": 20,
        "RightLeg": 21,
        "RightFoot": 22,
        "RightToeBase": 23,
        "RightToe_End": 24
    };

    bones: { [key: string]: THREE.Bone } = {};

    scaled: number = -1;

    visible = false;

    constructor() {

        for (let bone_name in this.bone_names) {
            const geometry = new THREE.SphereGeometry(0.02, 32, 32);
            const material = new THREE.MeshBasicMaterial({ color: 0xffffff });

            const mesh = new THREE.Mesh(geometry, material);

            mesh.name = bone_name;

            this.group.add(mesh);
        }

        this.hide()
    }

    setBones(bones: { [key: string]: THREE.Bone }) {
        this.bones = bones;
    }

    getBoneIndex(bone_name: string) {
        const idx = this.bone_names[bone_name];

        if (idx === undefined) {
            return -1;
        }

        return idx;
    }

    updateBonePositions() {
        // get the current bone world positions, and update corresponding skeleton joints positions
        Object.entries(this.bones).forEach(([bone_name, bone]) => {

            if (this.getBoneIndex(bone_name) === -1) {
                return;
            }

            const v = new THREE.Vector3();

            bone.getWorldPosition(v);

            this.group.children[this.getBoneIndex(bone_name)].position.copy(v);
        })
    }

    highlightBone(bone_index: number) {

        // If the bone is already scaled, do nothing
        if (this.scaled === bone_index) {
            return;
        }

        this.scaled = -1;

        for (let i = 0; i < this.group.children.length; i++) {
            if (i === bone_index) {
                this.group.children[i].scale.x = 1.5;
                this.group.children[i].scale.y = 1.5;
                this.group.children[i].scale.z = 1.5;

                this.scaled = i;
            } else {
                this.group.children[i].scale.x = 1;
                this.group.children[i].scale.y = 1;
                this.group.children[i].scale.z = 1;
            }

        }
    }

    hide() {
        this.group.position.set(-1000, -1000, -1000);
        this.visible = false;
    }

    show() {
        this.group.position.set(0, 0, 0);
        this.visible = true;
    }
}