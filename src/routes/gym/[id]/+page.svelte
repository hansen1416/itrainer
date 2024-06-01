<script lang="ts">
	import { onDestroy, onMount } from "svelte";
	import { page } from "$app/stores";

	import ApiRequest from "../../../lib/ApiRequest";
	import {
		animationQueueStore,
		animationDictStore,
	} from "../../../store/store";
	import {
		createPoseLandmarksDetector,
		invokeCamera,
	} from "../../../utils/ropes";
	import { PoseLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

	let video: HTMLVideoElement;

	let camera_ready = false;
	let detector_ready = false;
	let show_video = false;

	let poseLandmarkerDetector: PoseLandmarker;

	let animation_pointer = 0;

	function animate() {
		if (detector_ready && camera_ready) {
			// todo try to run prediction asynchrously
			// poseDetector.predict(video);
		}

		animation_pointer = requestAnimationFrame(animate);
	}

	onMount(() => {
		console.log("page params id: ", $page.params.id);
		// load the animation data by `$page.params.id`
		// and load mediapipe pose landmarker
		Promise.all([
			ApiRequest.getAnimationData($page.params.id),
			FilesetResolver.forVisionTasks(`/task-vision/`),
		]).then(([animData, vision]) => {
			animationDictStore.set({
				[`${$page.params.id}`]: JSON.stringify(animData.data),
			});

			animationQueueStore.set([
				{
					name: $page.params.id,
					repeat: 1,
					text: "",
				},
			]);

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

	onDestroy(() => {});

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
		style="position: absolute; top:0; left: 0; display: {show_video
			? 'block'
			: 'none'}"
	>
		<track label="English" kind="captions" default />
	</video>

	<div class="controls">
		<div>
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
				class={camera_ready ? "active" : ""}
				on:click={() => {
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
