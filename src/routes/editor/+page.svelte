<script lang="ts">
	import { browser } from "$app/environment";
	import { onDestroy, onMount } from "svelte";
	import type { ComponentEvents } from "svelte";
	import * as THREE from "three";
	import Stats from "three/examples/jsm/libs/stats.module.js";

	import FrameSlider from "../../components/FrameSlider.svelte";
	import Panel from "../../components/Panel.svelte";
	import ThreeScene from "../../lib/ThreeScene";
	import AnimationData from "../../lib/AnimationData";
	import type {
		AnimationDataObject,
		ApplyMethod,
		ControlType,
	} from "../../types/index";
	import Skeleton from "../../lib/Skeleton";
	import { RotationControl, TranslationControl } from "../../lib/Controls";
	import {
		displayScene,
		controlType,
		currentRotation,
		selectedBone,
	} from "../../store/store";
	import {
		loadGLTF,
		loadJSON,
		getNamedIntersects,
		setMeshOpacity,
		getMousePosition,
	} from "../../utils/ropes";

	const BoneNames = [
		"Hips",
		"Spine",
		"Spine1",
		"Spine2",
		"Neck",
		"Head",
		"HeadTop_End",
		"LeftShoulder",
		"LeftArm",
		"LeftForeArm",
		"LeftHand",
		"RightShoulder",
		"RightArm",
		"RightForeArm",
		"RightHand",
		"LeftUpLeg",
		"LeftLeg",
		"LeftFoot",
		"LeftToeBase",
		"LeftToe_End",
		"RightUpLeg",
		"RightLeg",
		"RightFoot",
		"RightToeBase",
		"RightToe_End",
	];

	let canvas: HTMLCanvasElement;

	let threeScene: ThreeScene;

	let stats: Stats;

	let animation_pointer = 0;

	let total_frames = 0;
	let initial_frame = 0;
	let boneKeyframes: number[] = [];

	let animtionData: AnimationData = new AnimationData();

	let bones: { [key: string]: THREE.Bone } = {};

	let diva: THREE.Object3D;

	const raycaster = new THREE.Raycaster();

	const mouse = new THREE.Vector2();

	let intersects: THREE.Intersection[] = [];
	// this is first valid intersection object
	let intersection: THREE.Intersection | null = null;

	let skeleton = new Skeleton();

	let _selectedBone: THREE.Object3D | null = null;
	let rotationControl = new RotationControl();
	let translationControl = new TranslationControl();

	let _controlType: ControlType = "";

	let in_dragging: boolean = false;

	let drag_start: THREE.Vector2 = new THREE.Vector2();

	let allDone: boolean = false;

	let displaySceneUnscribe: Function;
	let controlTypeUnscribe: Function;

	function animate() {
		if (threeScene) {
			raycaster.setFromCamera(mouse, threeScene.camera);

			intersects = raycaster.intersectObjects(
				[
					...skeleton.group.children,
					...rotationControl.group.children,
					...translationControl.group.children,
				],
				true,
			);

			// update physics world and threejs renderer
			threeScene.onFrameUpdate(stats);
		}
		animation_pointer = requestAnimationFrame(animate);
	}

	onMount(() => {
		threeScene = new ThreeScene(
			canvas,
			document.documentElement.clientWidth,
			document.documentElement.clientHeight,
		);

		Promise.all([
			loadGLTF(`/glb/dors.glb`),
			loadJSON(`/anim-calculated-quaternion/my_animation.json`),
		]).then(([gltf, anim_data]) => {
			diva = gltf.scene.children[0];

			diva.name = "diva";

			diva.position.set(0, -1, 0);

			threeScene.scene.add(diva);

			diva.traverse((node: THREE.Object3D) => {
				// @ts-ignore
				if (node.isMesh) {
					node.castShadow = true;

					const mat = (node as THREE.SkinnedMesh)
						.material as THREE.MeshStandardMaterial;

					mat.transparent = true;
				}
				// @ts-ignore
				if (node.isBone) {
					// @ts-ignore
					if (bones[node.name] === undefined) {
						// somehow maximo has double bones, so only use the first one
						bones[node.name] = node as THREE.Bone;
					}
				}
			});

			// add the controls we need
			threeScene.scene.add(skeleton.group);
			threeScene.scene.add(rotationControl.group);
			threeScene.scene.add(translationControl.group);

			// initial animation data begin
			animtionData.loadData(
				(anim_data as any).data as AnimationDataObject,
				bones,
			);

			animtionData.loadKeyFrames(
				(anim_data as any).keyframes as { [key: string]: number[] },
			);

			total_frames = animtionData.total_frames;

			// initial frame
			animtionData.applyRotation(initial_frame);

			skeleton.setBones(bones);

			skeleton.updateBonePositions();
			// initial animation data end

			canvas.addEventListener("mousedown", onMouseDown);
			canvas.addEventListener("mousemove", onMouseMove);
			canvas.addEventListener("mouseup", onMouseUp);
			canvas.addEventListener("click", onClick);

			animate();

			// this subscribe must happen after the scene is loaded
			displaySceneUnscribe = displayScene.subscribe((value) => {
				if (value === "skeleton") {
					skeleton.show();

					setMeshOpacity(diva, 0.6);
				} else {
					skeleton.hide();

					setMeshOpacity(diva, 1);
				}
			});

			allDone = true;
		});
	});

	onDestroy(() => {
		if (browser) {
			// unscribe all the store
			if (displaySceneUnscribe) {
				displaySceneUnscribe();
			}

			if (controlTypeUnscribe) {
				controlTypeUnscribe();
			}

			cancelAnimationFrame(animation_pointer);

			threeScene.dispose();
		}
	});

	function onMouseDown(event: MouseEvent) {
		event.preventDefault();

		intersection = getNamedIntersects(intersects);

		if (intersection === null) {
			return;
		}

		in_dragging = true;

		// start dragging, disable control
		threeScene.disableControl();

		const pos = getMousePosition(event);

		drag_start.x = pos.x;
		drag_start.y = pos.y;
	}

	/**
	 * mouse position for interactions
	 */
	function onMouseMove(event: MouseEvent) {
		event.preventDefault();

		const currentPos = getMousePosition(event);

		mouse.copy(currentPos);

		// todo, use control to edit bone rotation
	}

	function onMouseUp(event: MouseEvent) {
		in_dragging = false;

		rotationControl.rotationDone();

		// dragging finished enable control
		threeScene.enableControl();
	}

	function onClick(event: MouseEvent) {
		event.preventDefault();

		//
		intersection = getNamedIntersects(intersects);

		if (intersection === null) {
			// de-select bone, set to empty
			return;
		}

		// intersection[0].instanceId;

		// selected bone joints
		const object_name = intersection.object.name;

		// check if object_name is of type BoneName
		if (BoneNames.includes(object_name)) {
			selectedBone.set(bones[object_name]);

			// get the keyframe info from AnimationData
			boneKeyframes = animtionData.getBoneKeyFrames(object_name);
		}
	}

	$: if (intersects.length > 0) {
		intersection = getNamedIntersects(intersects);

		if (intersection) {
			// todo could be bones, rotations, translations
			// console.log(intersection.object.name);

			skeleton.highlightBone(
				skeleton.getBoneIndex(intersection.object.name),
			);
		} else {
			skeleton.highlightBone(-1);
		}
	} else {
		skeleton.highlightBone(-1);
	}

	controlTypeUnscribe = selectedBone.subscribe(
		(value: THREE.Object3D | null) => {
			_selectedBone = value;

			if (value) {
				// get the current bone rotation, will be displayed in the control panel
				currentRotation.set(value.rotation.clone());

				rotationControl.setBone(value as THREE.Bone);
				translationControl.setBone(value as THREE.Bone);

				if (_controlType === "rotation") {
					translationControl.hide();
					rotationControl.update();
					rotationControl.show();
				} else if (_controlType === "translation") {
					rotationControl.hide();
					translationControl.update();
					translationControl.show();
				} else if (_controlType === "") {
					controlType.set("rotation");
				}
			} else {
				// de-select bone, and set  currentBoneRotation to empty
				currentRotation.set(null);

				rotationControl.setBone(null);
				translationControl.setBone(null);

				controlType.set("");
			}
		},
	);

	controlTypeUnscribe = controlType.subscribe((value: ControlType) => {
		// swicth between rotation and translation
		// this will not affect visibility of the control, which controled by selectedBone
		_controlType = value;

		if (value === "rotation") {
			translationControl.hide();
			rotationControl.update();
			rotationControl.show();
		} else if (value === "translation") {
			rotationControl.hide();
			translationControl.update();
			translationControl.show();
		} else {
			rotationControl.hide();
			translationControl.hide();
		}
	});

	/**
	 * update frame callback, set bone rotations and positions
	 * @param event
	 */
	function frameUpdateCallback(
		event: ComponentEvents<FrameSlider>["update"],
	) {
		if (!animtionData || !bones || !diva) {
			return;
		}

		animtionData.applyRotation(event.detail.frame_idx);

		skeleton.updateBonePositions();

		rotationControl.update();
		translationControl.update();
	}

	function editBoneRotation(
		event: CustomEvent<{ euler: THREE.Euler; method: ApplyMethod }>,
	) {
		if (!_selectedBone) {
			return;
		}

		// update the bone rotation at current frame
		animtionData.editBoneFrameRotation(
			_selectedBone.name,
			event.detail.euler,
			event.detail.method,
		);
	}

	function addKeyframeCallback(
		event: ComponentEvents<FrameSlider>["addKeyframe"],
	) {
		if (!_selectedBone) {
			return;
		}

		animtionData.addKeyFrame(_selectedBone.name, event.detail.frame_idx);

		// get the keyframe info from AnimationData
		boneKeyframes = animtionData.getBoneKeyFrames(_selectedBone.name);
	}

	function deleteKeyframeCallback(
		event: ComponentEvents<FrameSlider>["deleteKeyframe"],
	) {
		if (!_selectedBone) {
			return;
		}

		animtionData.deleteKeyFrame(_selectedBone.name, event.detail.frame_idx);

		// get the keyframe info from AnimationData
		boneKeyframes = animtionData.getBoneKeyFrames(_selectedBone.name);
	}

	function exportAnimation() {
		const data = animtionData.exportData();

		const blob = new Blob([JSON.stringify(data, null, 2)], {
			type: "application/json",
		});
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		const filename = "my_animation";

		a.href = url;
		a.download = `${filename}.json`;
		a.click();

		URL.revokeObjectURL(url);
	}

	function saveAnimation() {
		// save the json data to localstorage
		const data = animtionData.exportData();

		localStorage.setItem("animation_data", JSON.stringify(data, null, 2));
	}
</script>

<section class="three-editor">
	<canvas bind:this={canvas} />

	<div class="control-box">
		<FrameSlider
			min_value={0}
			max_value={total_frames}
			initial_value={initial_frame}
			keyFrames={boneKeyframes}
			on:update={frameUpdateCallback}
			on:addKeyframe={addKeyframeCallback}
			on:deleteKeyframe={deleteKeyframeCallback}
		/>
	</div>

	<Panel on:editBoneRotation={editBoneRotation} />

	<div class="actions">
		<button on:click={exportAnimation}>
			<span>Export</span>
		</button>

		<button on:click={saveAnimation}>
			<span>Save</span>
		</button>
	</div>
</section>

{#if allDone}
	<div id="done"></div>
{/if}

<style lang="scss">
	canvas {
		width: 100vw;
		height: 100vh;
		display: block;
	}

	.control-box {
		width: 80vw;
		height: 80px;
		position: absolute;
		left: 50%;
		bottom: 30px;
		margin-left: -40vw;
	}

	#done {
		position: absolute;
		bottom: -1;
		left: 0;
	}

	.actions {
		position: absolute;
		top: 16px;
		right: 16px;

		button {
			font-size: 16px;
			margin-left: 16px;
		}
	}
</style>
