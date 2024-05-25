import * as THREE from 'three';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';



abstract class BaseControl {

    group: THREE.Group = new THREE.Group();

    bone: THREE.Bone | null = null;

    constructor() {

        this.hide();
    }

    hide() {
        this.group.position.set(-1000, -1000, -1000);
        this.group.visible = false;
    }

    show() {
        if (this.bone) {
            this.group.visible = true;
        }
    }

    setBone(bone: THREE.Bone | null) {
        this.bone = bone;

        this.update();
    }

    update() {
        if (this.bone) {
            this.group.position.copy(this.bone.getWorldPosition(new THREE.Vector3()));
            this.group.rotation.copy(this.bone.rotation);
        }
    }
}

function samplePointsOnCircle(radius: number, numPoints: number) {
    const points = [];
    const angleStep = (Math.PI * 2) / numPoints;

    for (let i = 0; i < numPoints; i++) {
        const angle = i * angleStep;
        const x = radius * Math.cos(angle);
        const y = radius * Math.sin(angle);
        points.push(new THREE.Vector3(x, y, 0)); // Adjust z-coordinate if needed
    }

    points.push(points[0]); // Close the circle

    return points;
}

export class RotationControl extends BaseControl {

    radius: number = 0.2

    xaxis: Line2;

    yaxis: Line2;

    zaxis: Line2;

    constructor() {

        super();

        this.xaxis = this._circle(0xff0000, "rotation_x");
        this.xaxis.rotation.y = Math.PI / 2;

        this.yaxis = this._circle(0x00ff00, "rotation_y");
        this.yaxis.rotation.x = Math.PI / 2;

        this.zaxis = this._circle(0x0000ff, "rotation_z");
        this.zaxis.rotation.z = Math.PI / 2;

        this.group.add(this.xaxis);
        this.group.add(this.yaxis);
        this.group.add(this.zaxis);
    }


    /**
     * 
     * @param color 
     * @returns 
     */
    _circle(color: number, name = ""): Line2 {

        // get points from a circle
        const points = samplePointsOnCircle(this.radius, 100);
        const positions: Array<number> = []

        for (let i = 0; i < points.length; i++) {
            positions.push(points[i].x, points[i].y, points[i].z);
        }


        const geometry = new LineGeometry();
        geometry.setPositions(positions);

        const matLine = new LineMaterial({

            color: color,
            linewidth: 0.005, // in world units with size attenuation, pixels otherwise
            // vertexColors: true,

            //resolution:  // to be set by renderer, eventually
            dashed: false,
            alphaToCoverage: true,

            transparent: true,
        });

        const line = new Line2(geometry, matLine);
        line.computeLineDistances();
        line.name = name;

        return line;

    }

    rotate(axis: string, angle: number): void {
        if (!this.bone) {
            return;
        }

        switch (axis) {
            case "rotation_x":
                this.bone.rotation.x += angle;

                this.xaxis.material.opacity = 0.5;

                this.xaxis.rotation.x += angle;
                break;
            case "rotation_y":
                this.bone.rotation.y += angle;

                this.yaxis.material.opacity = 0.5;

                this.yaxis.rotation.z += angle;

                break;
            case "rotation_z":
                this.bone.rotation.z += angle;

                this.zaxis.material.opacity = 0.5;

                this.zaxis.rotation.z += angle;
                break;
        }
    }

    rotationDone() {
        this.xaxis.material.opacity = 1;
        this.yaxis.material.opacity = 1;
        this.zaxis.material.opacity = 1;
    }
}

export class TranslationControl extends BaseControl {

    size: number = 0.3

    constructor() {

        super();

        this.init();
    }

    init() {
        const xaxis = this._axis(0xff0000, "translation_x");
        xaxis.rotation.z = -Math.PI / 2;

        const yaxis = this._axis(0x00ff00, "translation_y");
        // yaxis.rotation.x = Math.PI / 2;

        const zaxis = this._axis(0x0000ff, "translation_z");
        zaxis.rotation.x = Math.PI / 2;

        this.group.add(xaxis);
        this.group.add(yaxis);
        this.group.add(zaxis);
    }

    _axis(color = 0xff0000, name = "") {

        const group = new THREE.Group();

        const stem = this._axis_stem(color);
        const head = this._axis_head(color, name);

        group.add(stem);
        group.add(head);

        return group;
    }

    _axis_stem(color = 0xff0000) {
        const geometry = new THREE.CylinderGeometry(0.004, 0.004, this.size, 32);
        const material = new THREE.MeshBasicMaterial({ color: color });

        const mesh = new THREE.Mesh(geometry, material);

        mesh.position.y = this.size / 2;

        return mesh
    }

    _axis_head(color = 0xff0000, name = "") {
        const geometry = new THREE.ConeGeometry(0.05, 0.1, 32);
        const material = new THREE.MeshBasicMaterial({ color: color });

        const mesh = new THREE.Mesh(geometry, material);

        mesh.position.y = this.size;

        mesh.name = name;

        return mesh
    }
}