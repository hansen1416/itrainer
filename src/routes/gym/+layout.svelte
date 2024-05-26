<script lang="ts">
	import { browser } from "$app/environment";
	import { onDestroy, onMount } from "svelte";
	import * as THREE from "three";
	import Stats from "three/examples/jsm/libs/stats.module.js";
	import { derived } from "svelte/store";

	import ThreeScene from "../../lib/ThreeScene";
	import { loadDiva, loadScenery, invokeCamera } from "../../utils/ropes";
	// import PoseDetector from "../../lib/PoseDetector";
	import type { AnimationQueueItem } from "../../types/index";
	import {
		animationDictStore,
		diva,
		scenery,
		conversationStore,
		animationQueueStore,
	} from "../../store/store";
	import TextBubble from "../../components/TextBubble.svelte";

	let video: HTMLVideoElement;

	let canvas: HTMLCanvasElement;

	let threeScene: ThreeScene;

	let stats: Stats;

	// let poseDetector = new PoseDetector();

	// let playerController = undefined;

	let capture_pose = false;
	let detector_ready = false;
	let show_video = false;
	let animation_pointer = 0;

	let diva_mixer: THREE.AnimationMixer;

	let diva_action: THREE.AnimationAction;

	const clock = new THREE.Clock();

	function animate() {
		if (diva_mixer && diva_action) {
			diva_mixer.update(clock.getDelta());
		}

		// update physics world and threejs renderer
		threeScene.onFrameUpdate(stats);

		if (detector_ready && capture_pose) {
			// todo try to run prediction asynchrously
			// poseDetector.predict(video);
		}

		animation_pointer = requestAnimationFrame(animate);
	}

	onMount(() => {
		threeScene = new ThreeScene(
			canvas,
			document.documentElement.clientWidth,
			document.documentElement.clientHeight,
			new THREE.Vector3(0, 0.6, 2), // this is the camera position for mixamo model
		);

		// -100 is ground level
		threeScene.scene.position.set(0, -1, 0);

		if (import.meta.env.DEV) {
			stats = new Stats();
			stats.showPanel(1);
			document.body.appendChild(stats.dom);

			stats.dom.style.top = "auto";
			stats.dom.style.bottom = "0";
		}

		Promise.all([
			loadDiva($diva as THREE.Object3D),
			loadScenery($scenery as THREE.Object3D),
		])
			.then(([fbx, room]) => {
				diva.set(fbx as THREE.Object3D);

				scenery.set(room as THREE.Object3D);
			})
			.catch((err) => {
				console.error(err);
			});

		// initialize camera
		// invokeCamera(video, () => {});
		// initialize pose detector
		// Promise.all([poseDetector.init(poseCallback)]).then(([_]) => {
		// 	detector_ready = true;
		// });

		animate();
	});

	// function poseCallback(keypoints3D) {
	// 	if (playerController) {
	// 		playerController.applyPose2Bone(keypoints3D, true);
	// 	}
	// }

	// we need to watch both animation_queue and animation_data, make sure they both complete
	const _derived_queue_data = derived(
		[scenery, diva, animationQueueStore, animationDictStore],
		([_scenery, _diva, _animationQueue, _animationDict]) => {
			return [_scenery, _diva, _animationQueue, _animationDict];
		},
	);

	/**
	 * watch animation_queue, when it changes,
	 * check all the resouces needed for the animation is ready
	 * check whether animation in play
	 * if no, play the first animation
	 * if yes, do nothing
	 */
	const unsubscribe_queue_data = _derived_queue_data.subscribe(
		([_scenery, _diva, _animationQueue, _animationDict]) => {
			if (!threeScene) {
				return;
			}

			if (!_diva || !_scenery) {
				// diva/scenery is not ready, do nothing
				return;
			}

			if (!threeScene.scene.getObjectByName("diva")) {
				// diva is already in the scene, do nothing
				(_diva as THREE.Object3D).name = "diva";

				diva_mixer = new THREE.AnimationMixer(_diva as THREE.Object3D);

				diva_mixer.addEventListener("finished", () => {
					// when one animation finished, remove the first animation from queue
					// this will trigger the watch function on `animation_queue` below
					animationQueueStore.update(
						(a_queue: AnimationQueueItem[]) => {
							if (!a_queue || !a_queue.length) {
								return [];
							}
							// return the rest of the queue but the first one
							return a_queue.slice(1);
						},
					);
				});

				threeScene.scene.add(_diva as THREE.Object3D);

				console.log("add diva to scene");
			}

			if (!threeScene.scene.getObjectByName("scenery")) {
				// scenery is already in the scene, do nothing
				(_scenery as THREE.Object3D).name = "scenery";

				threeScene.scene.add(_scenery as THREE.Object3D);

				console.log("add scenery to scene");
			}

			// when animation_queue and animation_data are both ready
			// we can start to play the animation

			if (
				!_animationQueue ||
				!_animationDict ||
				(_animationQueue as []).length === 0
			) {
				// animation_queue or animation_data is not ready, do nothing
				return;
			}

			// another animation is playing, do nothing
			if (diva_action && diva_action.isRunning()) {
				return;
			}

			// diva is not ready, do nothing
			if (!diva_mixer) {
				return;
			}

			if (!threeScene) {
				return;
			}

			const firstAnimation = (_animationQueue as AnimationQueueItem[])[0];

			const animation_name = firstAnimation.name;
			const animation_repeat = firstAnimation.repeat;
			const animation_text = firstAnimation.text;

			if (
				!(_animationDict as { [key: string]: string })[animation_name]
			) {
				// animation data is not ready, do nothing
				return;
			}

			// check is current animation item has a `message` field, if yes, render TextBubble component
			if (animation_text) {
				conversationStore.set([animation_text]);
			} else {
				conversationStore.set(null);
			}

			console.log(
				`start animation: ${animation_name}, repeat: ${animation_repeat}`,
			);

			diva_mixer.stopAllAction();

			// play the first animation in queue, the animation_data should be prepared before hand
			const animation_json = JSON.parse(
				(_animationDict as { [key: string]: string })[animation_name],
			);

			const animation_clip = THREE.AnimationClip.parse(animation_json);

			diva_action = diva_mixer.clipAction(animation_clip);

			diva_action.reset();

			diva_action.setLoop(THREE.LoopRepeat, animation_repeat);

			// keep model at the position where it stops
			diva_action.clampWhenFinished = true;

			diva_action.enabled = true;

			// diva_action.fadeIn(0.5);

			diva_action.play();

			console.log("play animation", animation_name);
		},
	);

	/**
	 * Out of onMount, beforeUpdate, afterUpdate and onDestroy,
	 * this is the only one that runs inside a server-side component.
	 */
	onDestroy(() => {
		if (browser) {
			cancelAnimationFrame(animation_pointer);

			if (diva_mixer) {
				diva_mixer.stopAllAction();

				diva_mixer.removeEventListener("finished", () => {});
			}

			threeScene.dispose();
		}

		// unsubscribe all stores
		unsubscribe_queue_data();
	});
</script>

<!-- section is not needed, only for readablity -->
<section>
	<canvas bind:this={canvas} />

	<video
		bind:this={video}
		autoPlay={true}
		width={480 / 2}
		height={360 / 2}
		style="position: absolute; top:0; left: 0; display: {show_video
			? 'block'
			: 'none'}"
	>
		<track label="English" kind="captions" default />
	</video>

	<div class="controls">
		<div>
			<button
				on:click={() => {
					threeScene.resetControl();
				}}>Reset Control</button
			>
			<!-- 
			{#if show_video}
				<button
					on:click={() => {
						show_video = !show_video;
					}}>hide video</button
				>
			{:else}
				<button
					on:click={() => {
						show_video = !show_video;
					}}>show video</button
				>
			{/if} -->

			<button
				class={capture_pose ? "active" : ""}
				on:click={() => {
					capture_pose = !capture_pose;
				}}><img src="/svg/camera.svg" alt="Play" /></button
			>

			<button on:click={() => {}}>
				<img src="/svg/play.svg" alt="Camera" />
			</button>
		</div>
	</div>
</section>

<slot></slot>

<TextBubble />

<style>
	canvas {
		/* this will only affect <canvas> elements in this component */
		/* z-index: -1; */
		position: absolute;
		top: 0;
		left: 0;
		bottom: 0;
		right: 0;
	}

	.controls {
		position: absolute;
		bottom: 0;
		right: 0;
		padding: 10px;
		display: flex;
		justify-content: space-between;
	}
</style>
