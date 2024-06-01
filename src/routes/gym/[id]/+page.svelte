<script lang="ts">
	import { browser } from "$app/environment";
	import { onDestroy } from "svelte";
	import { page } from "$app/stores";
	import * as THREE from "three";
	import { PoseLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
	import type { PoseLandmarkerResult } from "@mediapipe/tasks-vision";

	import type { WorldPoseLandmarks } from "../../../types";
	import JointsPosition2Rotation from "../../../lib/JointsPosition2Rotation";
	import ApiRequest from "../../../lib/ApiRequest";
	import {
		gymReady,
		animationQueueStore,
		animationDictStore,
	} from "../../../store/store";
	import {
		createPoseLandmarksDetector,
		invokeCamera,
		loadDiva,
		rotateBones,
	} from "../../../utils/ropes";
	import ThreeScene from "../../../lib/ThreeScene";

	let threeScene: ThreeScene;

	let animation_pointer = 0;

	let video: HTMLVideoElement;

	let camera_ready = false;
	let detector_ready = false;

	let poseLandmarkerDetector: PoseLandmarker;

	let bones: { [key: string]: THREE.Bone } = {};
	// convert pose landmarks to bone rotations
	let jointsPos2Rot = new JointsPosition2Rotation();

	function animate() {
		if (detector_ready && camera_ready) {
			try {
				poseLandmarkerDetector.detectForVideo(
					video,
					performance.now(),
					(result: PoseLandmarkerResult) => {
						const worldLandmarks: WorldPoseLandmarks =
							result.worldLandmarks[0];
						console.log(worldLandmarks);
						// calculate the rotation of each bone based on the landmarks
						jointsPos2Rot.applyPose2Bone(worldLandmarks);
						// console.log(jointsPos2Rot.getRotationsArray());
						// apply the rotation to the bones of the model
						rotateBones(jointsPos2Rot.getRotationsArray(), bones);
						// save the rotation data of the frame for the animation
					},
				);
			} catch (e) {
				console.error("detector error");
			}
		}

		animation_pointer = requestAnimationFrame(animate);
	}

	const gymReadyStoreUnsubscribe = gymReady.subscribe((ready) => {
		if (!ready) {
			return;
		}

		video.onloadeddata = () => {
			camera_ready = true;
		};

		// load the animation data by `$page.params.id`
		// and load mediapipe pose landmarker
		Promise.all([
			loadDiva(),
			ApiRequest.getAnimationData($page.params.id),
			FilesetResolver.forVisionTasks(`/task-vision/`),
		]).then(([shadow, animData, vision]) => {
			threeScene = ThreeScene.getInstance();

			shadow.traverse((node: THREE.Object3D) => {
				// @ts-ignore
				if (node.isMesh) {
					node.castShadow = true;

					const mat = (node as THREE.SkinnedMesh)
						.material as THREE.MeshStandardMaterial;

					mat.transparent = true;
					mat.opacity = 0.3;
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

			threeScene.scene.add(shadow);

			animationDictStore.update((oldStore) => {
				return {
					...oldStore,
					[$page.params.id]: JSON.stringify(animData.data),
				};
			});

			animationQueueStore.update((oldStore) => {
				oldStore.push({
					name: $page.params.id,
					repeat: 1,
					text: "",
				});

				return oldStore;
			});

			// todo add shaow which follow the user's movement
			createPoseLandmarksDetector(vision).then(
				(detector: PoseLandmarker) => {
					poseLandmarkerDetector = detector;

					detector_ready = true;
				},
			);

			animate();
		});
	});

	onDestroy(() => {
		if (browser) {
			cancelAnimationFrame(animation_pointer);
		}
		gymReadyStoreUnsubscribe();
	});

	/**
	const _derived_diva_ws = derived(
		[diva, websocketStateStore],
		([_diva, _websocket_state]) => {
			return [_diva, _websocket_state];
		},
	);

	const unsubscribe_derived_diva_ws = _derived_diva_ws.subscribe(
		([_diva, _websocket_state]) => {
			// when websocket is connected, and diva is loaded
			// request the animation data needed in this component from redis
			// make only send request once

			if (
				!_diva ||
				typeof _diva !== "object" ||
				_diva.isObject3D !== true
			) {
				// diva is not ready, do nothing
				return;
			}

			if (_websocket_state !== WebSocket.OPEN) {
				// websocket is not ready, do nothing
				return;
			}

			if (animation_request_sent) {
				return;
			}

			if (!$page.params.id) {
				console.error("id is not provided");
				return;
			}

			const msg = "amq:" + $page.params.id;

			// when websocket is connected, request the animation sequence data needed in this component
			// it's a list of animation metadata
			wsClient.sendMessage(msg);

			console.log("request animation data from redis msg: " + msg);

			animation_request_sent = true;
		},
	);

	const unsubscribe_animation_queue = animationQueueStore.subscribe(
		(a_queue) => {
			if (a_queue.length === 0) {
				if (animation_played) {
					// do something when animation queue is finished
				}
			} else {
				animation_played = true;
			}
		},
	);
	*/
</script>

<section>
	<video
		bind:this={video}
		autoPlay={true}
		width={480 / 2}
		height={360 / 2}
		style="position: absolute; top:0; left: 0; display: block;"
	>
		<track label="English" kind="captions" default />
	</video>

	<div class="controls">
		<div>
			<button
				class={camera_ready ? "active" : ""}
				on:click={() => {
					if (camera_ready) {
						return;
					}
					// initialize camera
					invokeCamera(video, () => {});
				}}><img src="/svg/camera.svg" alt="Play" /></button
			>
		</div>
	</div>
</section>

<style lang="scss">
	.controls {
		position: absolute;
		bottom: 0;
		right: 0;
		padding: 10px;
		display: flex;
		justify-content: space-between;
	}
</style>
