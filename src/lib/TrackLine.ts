import * as THREE from 'three';

export default class TrackLine {

    group: THREE.Group = new THREE.Group();

    constructor() {

        this.hide();
    }

    hide() {
        this.group.position.set(-1000, -1000, -1000);
    }

    show(position: THREE.Vector3) {
        this.group.position.copy(position);
    }

    createLine(): THREE.Line {
        const geometry = new THREE.BufferGeometry();
        const material = new THREE.LineBasicMaterial({ color: 0xffffff });

        const vertices = new Float32Array([
            0, 0, 0,
            0, 0, 1
        ]);

        geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));

        const line = new THREE.Line(geometry, material);

        return line;
    }
}