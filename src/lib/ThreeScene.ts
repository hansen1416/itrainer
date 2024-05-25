import * as THREE from "three";
import { OrbitControls } from '@three-ts/orbit-controls';
import Stats from "three/examples/jsm/libs/stats.module.js";


const CAMERA_DISTANCE = 2;

const CameraOffset = new THREE.Vector3(0, 0.6, CAMERA_DISTANCE);


/**
 * @class ThreeScene
 * @description
 * This class is a singleton, so we only have 1 threejs scene
 *
 * @property {THREE.Scene} scene
 * @property {THREE.PerspectiveCamera} camera
 * @property {THREE.WebGLRenderer} renderer
 * @property {OrbitControls} controls
 * @property {THREE.DirectionalLight} light
 * @property {THREE.Clock} clock
 *
 * @method onFrameUpdate
 * @method resetControl
 */
export default class ThreeScene {

    scene: THREE.Scene;

    camera: THREE.PerspectiveCamera;

    renderer: THREE.WebGLRenderer;

    controls: OrbitControls;


    /**
     * 
     * @param canvas 
     * @param width 
     * @param height 
     */
    constructor(canvas: HTMLCanvasElement, width: number, height: number) {


        this.scene = new THREE.Scene();

        // this.scene.matrixWorldAutoUpdate = false;

        // this.scene.add(new THREE.AxesHelper(5));

        this.camera = new THREE.PerspectiveCamera(
            75,
            width / height,
            0.01,
            4000
        );
        // camera initial position
        this.camera.position.set(
            CameraOffset.x,
            CameraOffset.y,
            CameraOffset.z
        );

        this.camera.updateProjectionMatrix(); // update the camera's projection matrix

        // env light
        this.scene.add(new THREE.AmbientLight(0xffffff, 1));

        this.scene.background = new THREE.Color(0x008dda);

        const direct_light = new THREE.DirectionalLight(0xffffff, 1);
        direct_light.position.set(0, 100, 100);
        direct_light.castShadow = true;

        direct_light.target = new THREE.Object3D();
        direct_light.target.position.set(0, 0, 0);

        this.scene.add(direct_light);
        this.scene.add(direct_light.target);

        // env fog
        // this.scene.fog = new THREE.Fog(0x000000, 50, 200);

        this.renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            alpha: true,
            antialias: true,
        });

        this.renderer.shadowMap.enabled = true;
        // this.renderer.shadowMap.type = THREE.BasicShadowMap;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMappingExposure = 0.5;

        this.controls = new OrbitControls(this.camera, canvas);

        // this.controls.minDistance = 150;
        // this.controls.maxDistance = 800;

        this.renderer.setSize(width, height);


    }

    dispose() {
        // this.renderer.dispose();
        // this.renderer.forceContextLoss();
        // this.renderer.context = null;
        // this.renderer.domElement = null;
        // this.renderer = null;
    }

    onFrameUpdate(stats: Stats | null = null) {

        // this.followTarget(0, 270);

        this.controls.update();

        this.renderer.render(this.scene, this.camera);

        if (stats) {
            stats.update();
        }
    }

    resetControl() {
        this.controls.reset();
    }

    disableControl() {
        this.controls.enabled = false;
    }

    enableControl() {
        this.controls.enabled = true;
    }
}
