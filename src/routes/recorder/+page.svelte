<script lang="ts">
	import { browser } from "$app/environment";
	import { onDestroy, onMount } from "svelte";
	import * as THREE from "three";
	import Stats from "three/examples/jsm/libs/stats.module.js";
	import { PoseLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
	import type { PoseLandmarkerResult } from "@mediapipe/tasks-vision";

	import type { WorldPoseLandmarks } from "../../types";
	import ThreeScene from "../../lib/ThreeScene";
	import JointsPosition2Rotation from "../../lib/JointsPosition2Rotation";
	import AnimationData from "../../lib/AnimationData";
	import ApiRequest from "../../lib/ApiRequest";
	import { loadGLTF, rotateBones } from "../../utils/ropes";

	let rightHandBlock: HTMLDivElement;

	let video: HTMLVideoElement;

	let canvas: HTMLCanvasElement;

	let stats: Stats;

	let animation_pointer = 0;

	let threeScene: ThreeScene;

	let diva: THREE.Object3D;

	let bones: { [key: string]: THREE.Bone } = {};

	let videoReady = false;
	// mediapipe pose landmarker detector
	let poseLandmarker: PoseLandmarker;
	// convert pose landmarks to bone rotations
	let jointsPos2Rot = new JointsPosition2Rotation();
	// animation data in format of {boneName: quaternion[]}
	let animationData = new AnimationData();

	let startExtract = false;
	let videoDuration = 0;
	let extractDone = false;

	function animate() {
		if (threeScene) {
			// update physics world and threejs renderer
			threeScene.onFrameUpdate(stats);

			if (
				videoReady &&
				startExtract &&
				poseLandmarker &&
				video.currentTime <= videoDuration
			) {
				poseLandmarker.detectForVideo(
					video,
					video.currentTime * 1000,
					(result: PoseLandmarkerResult) => {
						const worldLandmarks: WorldPoseLandmarks =
							result.worldLandmarks[0];

						// calculate the rotation of each bone based on the landmarks
						jointsPos2Rot.applyPose2Bone(worldLandmarks);
						// apply the rotation to the bones of the model
						rotateBones(jointsPos2Rot.getRotationsArray(), bones);
						// save the rotation data of the frame for the animation
						animationData.appendData(
							jointsPos2Rot.getRotationsArray(),
						);
					},
				);
			}
		}

		animation_pointer = requestAnimationFrame(animate);
	}

	onMount(() => {
		const rect = rightHandBlock.getBoundingClientRect();

		threeScene = new ThreeScene(canvas, rect.width, rect.height);
		// initialize the animation data with the model bone names
		animationData.initalize(jointsPos2Rot.getModelBoneNames());

		Promise.all([
			loadGLTF(`/glb/dors.glb`),
			FilesetResolver.forVisionTasks(`/task-vision/`),
		]).then(([gltf, vision]) => {
			diva = gltf.scene.children[0];

			diva.name = "diva";

			diva.position.set(0, -1, 0);

			threeScene.scene.add(diva);

			diva.traverse((node: THREE.Object3D) => {
				if ((node as THREE.SkinnedMesh).isMesh) {
					node.castShadow = true;
				}

				if ((node as THREE.Bone).isBone) {
					if (bones[node.name] === undefined) {
						// somehow maximo has double bones, so only use the first one
						bones[node.name] = node as THREE.Bone;
					}
				}
			});

			PoseLandmarker.createFromOptions(vision, {
				baseOptions: {
					modelAssetPath: `/task-vision/pose_landmarker_lite.task`,
					delegate: "GPU",
				},
				runningMode: "VIDEO",
				numPoses: 1,
			}).then((landmarker: PoseLandmarker) => {
				poseLandmarker = landmarker;
			});

			animate();
		});
	});

	onDestroy(() => {
		if (browser) {
			cancelAnimationFrame(animation_pointer);

			threeScene.dispose();
		}
	});

	function uploadVideo(e: Event) {
		const inputs = e.target as HTMLInputElement;

		if (!inputs.files) {
			return;
		}

		const file = inputs.files[0];
		const reader = new FileReader();
		reader.onload = (e: ProgressEvent) => {
			video.src = (e.target as FileReader).result as string;
		};

		video.onloadedmetadata = () => {
			videoDuration = video.duration;
		};

		video.onloadeddata = () => {
			videoReady = true;
		};

		video.onended = () => {
			// disable pose detection
			startExtract = false;
			// when video finished, show save animation button
			extractDone = true;
		};

		reader.readAsDataURL(file);
	}
</script>

<section>
	<div class="left-hand">
		<div class="input-box">
			<input type="file" accept="video/*" on:change={uploadVideo} />
		</div>
		<div class="video-box">
			<video controls={false} bind:this={video}>
				<track kind="captions" srclang="en" label="English" default />
			</video>
		</div>
		<div class="extract">
			<button
				disabled={!videoReady || !video}
				class:disabled={startExtract}
				on:click={() => {
					startExtract = !startExtract;

					if (video) {
						video.currentTime = 0;
						video.play();
					}
				}}>Extract</button
			>
		</div>
		{#if extractDone}
			<div class="done-btns">
				<button
					on:click={() => {
						const data = animationData.exportData();

						ApiRequest.saveAnimationData(data).then((res) => {
							console.log(res, "saved");
						});
					}}>Save to mine</button
				>
				<button
					on:click={() => {
						const data = animationData.exportData();

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
					}}>Download</button
				>
			</div>
		{/if}
	</div>
	<div class="right-hand" bind:this={rightHandBlock}>
		<canvas bind:this={canvas} />
	</div>
</section>

<style lang="scss">
	.left-hand,
	.right-hand {
		position: absolute;
		width: 50%;
		height: 100%;
		top: 0;
	}

	.left-hand {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		left: 0;
	}

	.right-hand {
		right: 0;
	}

	.input-box {
		margin: 10px 0;
		position: absolute;
		top: 0;
	}

	.video-box {
		max-width: 80%;
		max-height: 80%;
	}

	video {
		max-width: 100%;
		max-height: 100%;
	}

	.extract {
		position: absolute;
		top: 50%;
		right: -48px;
		width: 96px;
		height: 32px;
		font-size: 18px;
		text-align: center;
		line-height: 30px;
		z-index: 2;

		button {
			width: 100%;
			height: 100%;
			background-color: #fff;

			&.disabled {
				opacity: 0.5;
			}
		}
	}

	.done-btns {
		position: absolute;
		top: calc(50% + 60px);
		right: -48px;
		width: 96px;
		height: auto;
		font-size: 18px;
		text-align: center;
		z-index: 2;

		button {
			width: 100%;
			height: 32px;
			margin-bottom: 12px;
			background-color: #fff;
		}
	}
</style>
