import * as THREE from 'three';
import type { QuaternionArray, Vector3Array } from '../types/index';

export default class JointsPosition2Rotation {


    constructor() { }

    joints_map: { [key: string]: number } = {
        "NOSE": 0,
        "LEFT_EYE_INNER": 1,
        "LEFT_EYE": 2,
        "LEFT_EYE_OUTER": 3,
        "RIGHT_EYE_INNER": 4,
        "RIGHT_EYE": 5,
        "RIGHT_EYE_OUTER": 6,
        "LEFT_EAR": 7,
        "RIGHT_EAR": 8,
        "MOUTH_LEFT": 9,
        "MOUTH_RIGHT": 10,
        "LEFT_SHOULDER": 11,
        "RIGHT_SHOULDER": 12,
        "LEFT_ELBOW": 13,
        "RIGHT_ELBOW": 14,
        "LEFT_WRIST": 15,
        "RIGHT_WRIST": 16,
        "LEFT_PINKY": 17,
        "RIGHT_PINKY": 18,
        "LEFT_INDEX": 19,
        "RIGHT_INDEX": 20,
        "LEFT_THUMB": 21,
        "RIGHT_THUMB": 22,
        "LEFT_HIP": 23,
        "RIGHT_HIP": 24,
        "LEFT_KNEE": 25,
        "RIGHT_KNEE": 26,
        "LEFT_ANKLE": 27,
        "RIGHT_ANKLE": 28,
        "LEFT_HEEL": 29,
        "RIGHT_HEEL": 30,
        "LEFT_FOOT_INDEX": 31,
        "RIGHT_FOOT_INDEX": 32,
    };


    pose3d: Array<{ 'x': number, 'y': number, 'z': number }> = []


    rotations: { [key: string]: THREE.Quaternion } = {
        "Hips": new THREE.Quaternion(0, 0, 0, 1),
        "Spine2": new THREE.Quaternion(0, 0, 0, 1),
        "LeftShoulder": new THREE.Quaternion(0.4816880226135254, 0.4927692711353302, -0.5889065265655518, 0.4223082959651947),
        "LeftArm": new THREE.Quaternion(0, 0, 0, 1),
        "LeftForeArm": new THREE.Quaternion(0, 0, 0, 1),
        "RightShoulder": new THREE.Quaternion(
            0.48168784379959106,
            -0.4927700459957123,
            0.588905930519104,
            0.42230847477912903
        ),
        "RightArm": new THREE.Quaternion(0, 0, 0, 1),
        "RightForeArm": new THREE.Quaternion(0, 0, 0, 1),
        "LeftUpLeg": new THREE.Quaternion(
            0.0019053755095228553,
            0.056365966796875,
            -0.9978452920913696,
            0.03352741152048111
        ),
        "LeftLeg": new THREE.Quaternion(0, 0, 0, 1),
        "RightUpLeg": new THREE.Quaternion(
            0.0019610640592873096,
            -0.05636449530720711,
            0.9978451728820801,
            0.03352941572666168
        ),
        "RightLeg": new THREE.Quaternion(0, 0, 0, 1),
    }

    limb_joint_pairs: { [key: string]: [string, string] } = {
        "LeftArm": ["LEFT_SHOULDER", "LEFT_ELBOW"],
        "RightArm": ["RIGHT_SHOULDER", "RIGHT_ELBOW"],
        "LeftForeArm": ["LEFT_ELBOW", "LEFT_WRIST"],
        "RightForeArm": ["RIGHT_ELBOW", "RIGHT_WRIST"],
        "LeftUpLeg": ["LEFT_HIP", "LEFT_KNEE"],
        "RightUpLeg": ["RIGHT_HIP", "RIGHT_KNEE"],
        "LeftLeg": ["LEFT_KNEE", "LEFT_ANKLE"],
        "RightLeg": ["RIGHT_KNEE", "RIGHT_ANKLE"],
    }

    limb_parent: { [key: string]: string[] } = {
        "LeftArm": ["Hips", "Spine2", "LeftShoulder"],
        "RightArm": ["Hips", "Spine2", "RightShoulder"],
        "LeftForeArm": ["Hips", "Spine2", "LeftShoulder", "LeftArm"],
        "RightForeArm": ["Hips", "Spine2", "RightShoulder", "RightArm"],
        "LeftUpLeg": ["Hips"],
        "RightUpLeg": ["Hips"],
        "LeftLeg": ["Hips", "LeftUpLeg"],
        "RightLeg": ["Hips", "RightUpLeg"],
    }

    getModelBoneNames(): string[] {
        return Object.keys(this.rotations);
    }

    getRotationsArray(): { [key: string]: QuaternionArray } {
        const rotations: { [key: string]: QuaternionArray } = {};
        for (const key in this.rotations) {
            rotations[key] = this.rotations[key].toArray() as QuaternionArray;
        }
        return rotations;
    }


    #pelvisRotation(): THREE.Quaternion {

        const left_shoulder = this.pose3d[this.joints_map["LEFT_SHOULDER"]];
        const right_shoulder = this.pose3d[this.joints_map["RIGHT_SHOULDER"]];
        const left_hip = this.pose3d[this.joints_map["LEFT_HIP"]];
        const right_hip = this.pose3d[this.joints_map["RIGHT_HIP"]];

        // let neck be the middle point of left and right shoulder
        const neck = new THREE.Vector3().addVectors(left_shoulder, right_shoulder).multiplyScalar(0.5);
        // let pelvis be the middle point of left and right hip
        const pelvis = new THREE.Vector3().addVectors(left_hip, right_hip).multiplyScalar(0.5);

        const xaxis = new THREE.Vector3()
            .subVectors(left_hip, right_hip)
            .normalize();

        const y_tmp = new THREE.Vector3()
            .subVectors(neck, pelvis)
            .normalize();

        const zaxis = new THREE.Vector3()
            .crossVectors(xaxis, y_tmp)
            .normalize();

        // console.log(xaxis, y_tmp, zaxis)

        const yaxis = new THREE.Vector3()
            .crossVectors(zaxis, xaxis)
            .normalize();

        // console.log(xaxis, yaxis, zaxis)

        // process.exit(0)

        const m0 = new THREE.Matrix4().makeBasis(
            new THREE.Vector3(1, 0, 0),
            new THREE.Vector3(0, 1, 0),
            new THREE.Vector3(0, 0, 1)
        );

        const m1 = new THREE.Matrix4().makeBasis(xaxis, yaxis, zaxis);

        const m = m1.multiply(m0.invert());
        // const m = m0.invert().multiply(m1);

        return new THREE.Quaternion().setFromRotationMatrix(m);
    }

    #spine2rotation(): THREE.Quaternion {
        const left_shoulder = this.pose3d[this.joints_map["LEFT_SHOULDER"]];
        const right_shoulder = this.pose3d[this.joints_map["RIGHT_SHOULDER"]];
        const left_hip = this.pose3d[this.joints_map["LEFT_HIP"]];
        const right_hip = this.pose3d[this.joints_map["RIGHT_HIP"]];

        // let neck be the middle point of left and right shoulder
        const neck = new THREE.Vector3().addVectors(left_shoulder, right_shoulder).multiplyScalar(0.5);
        // let spine be the middle point of left and right hip
        const spine = new THREE.Vector3().addVectors(left_hip, right_hip).multiplyScalar(0.5);

        const xaxis = new THREE.Vector3()
            .subVectors(left_shoulder, right_shoulder)
            .normalize();

        const y_tmp = new THREE.Vector3()
            .subVectors(neck, spine)
            .normalize();

        const zaxis = new THREE.Vector3()
            .crossVectors(xaxis, y_tmp)
            .normalize();

        const yaxis = new THREE.Vector3()
            .crossVectors(zaxis, xaxis)
            .normalize();

        const m0 = new THREE.Matrix4().makeBasis(
            new THREE.Vector3(1, 0, 0),
            new THREE.Vector3(0, 1, 0),
            new THREE.Vector3(0, 0, 1)
        );

        const m1 = new THREE.Matrix4().makeBasis(xaxis, yaxis, zaxis);

        const m = m1.multiply(m0.invert());

        // need to reduct pelvis rotation
        const spine2_q_world = new THREE.Quaternion().setFromRotationMatrix(m);

        // return spine2_q_world;

        //  spine2_q_local * pelvis_q_local  = spine2_q_world
        //  spine2_q_local = spine2_q_world * pelvis_q_local.conjugate()

        return new THREE.Quaternion().multiplyQuaternions(
            spine2_q_world,
            this.rotations["Hips"].clone().conjugate()
        );
    }

    #get_joint_world_vector(start_joint_name: string, end_joint_name: string): THREE.Vector3 {
        const start_joint =
            this.pose3d[this.joints_map[start_joint_name]];
        const end_joint =
            this.pose3d[this.joints_map[end_joint_name]];

        return new THREE.Vector3(
            end_joint.x - start_joint.x,
            end_joint.y - start_joint.y,
            end_joint.z - start_joint.z
        ).normalize();
    }

    #get_limb_quaternion(limb_name: string, up_vector: THREE.Vector3): THREE.Quaternion {
        const limb = this.limb_joint_pairs[limb_name];

        const target_vector = this.#get_joint_world_vector(limb[0], limb[1]);

        for (const parent_bone_name of this.limb_parent[limb_name]) {

            const parent_q = this.rotations[parent_bone_name];

            target_vector.applyQuaternion(parent_q.clone().conjugate());
        }

        const angle = up_vector.angleTo(target_vector);

        const axis = new THREE.Vector3().crossVectors(up_vector, target_vector).normalize();

        return new THREE.Quaternion().setFromAxisAngle(axis, angle);
    }

    /**
     * calculate the rotation of each bone based on the 3D pose
     * @param pose3D 3D pose
     * @returns {void}
     */
    applyPose2Bone(pose3D: Array<{ 'x': number, 'y': number, 'z': number }>): void {

        this.pose3d = pose3D;

        // afjust the coordinate system from videopose3d to threejs
        for (let i in this.pose3d) {
            this.pose3d[i].y = -this.pose3d[i].y;
            this.pose3d[i].z = -this.pose3d[i].z;
        }

        this.rotations["Hips"] = this.#pelvisRotation();

        this.rotations["Spine2"] = this.#spine2rotation();

        this.rotations["LeftShoulder"] = new THREE.Quaternion(0.4816880226135254, 0.4927692711353302, -0.5889065265655518, 0.4223082959651947);

        this.rotations["RightShoulder"] = new THREE.Quaternion(0.48168784379959106, -0.4927700459957123, 0.588905930519104, 0.42230847477912903);


        this.rotations["LeftArm"] = this.#get_limb_quaternion("LeftArm", new THREE.Vector3(0, 1, 0));
        this.rotations["RightArm"] = this.#get_limb_quaternion("RightArm", new THREE.Vector3(0, 1, 0));

        this.rotations["LeftForeArm"] = this.#get_limb_quaternion("LeftForeArm", new THREE.Vector3(0, 1, 0));
        this.rotations["RightForeArm"] = this.#get_limb_quaternion("RightForeArm", new THREE.Vector3(0, 1, 0));

        const leftUpLeg_local = this.#get_limb_quaternion("LeftUpLeg", new THREE.Vector3(0, -1, 0));
        this.rotations["LeftUpLeg"] = new THREE.Quaternion().multiplyQuaternions(leftUpLeg_local, new THREE.Quaternion(
            0.0019053755095228553,
            0.056365966796875,
            -0.9978452920913696,
            0.03352741152048111
        ));
        const rightUpLeg_local = this.#get_limb_quaternion("RightUpLeg", new THREE.Vector3(0, -1, 0));
        this.rotations["RightUpLeg"] = new THREE.Quaternion().multiplyQuaternions(rightUpLeg_local, new THREE.Quaternion(
            0.0019610640592873096,
            -0.05636449530720711,
            0.9978451728820801,
            0.03352941572666168
        ));

        this.rotations["LeftLeg"] = this.#get_limb_quaternion("LeftLeg", new THREE.Vector3(0, 1, 0));
        this.rotations["RightLeg"] = this.#get_limb_quaternion("RightLeg", new THREE.Vector3(0, 1, 0));
    }

    getRotationsEuler(): { [key: string]: Vector3Array } {
        const eulers: { [key: string]: Vector3Array } = {};
        for (const key in this.rotations) {
            const euler = new THREE.Euler().setFromQuaternion(this.rotations[key], "XYZ");
            eulers[key] = [euler.x, euler.y, euler.z];
        }
        return eulers;
    }

    getRotationsQuaternion(): { [key: string]: QuaternionArray } {
        const quaternions: { [key: string]: QuaternionArray } = {};
        for (const key in this.rotations) {
            quaternions[key] = [
                this.rotations[key].x,
                this.rotations[key].y,
                this.rotations[key].z,
                this.rotations[key].w
            ];
        }
        return quaternions;
    }
}