<script lang="ts">
	import { onDestroy, onMount } from "svelte";
	import { page } from "$app/stores";

	import ApiRequest from "../../../lib/ApiRequest";
	import {
		animationQueueStore,
		animationDictStore,
	} from "../../../store/store";
	import { createPoseLandmarksDetector } from "../../../utils/ropes";
	import { PoseLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

	let poseLandmarkerDetector: PoseLandmarker;

	onMount(() => {
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
				},
			);
		});
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

	onDestroy(() => {});
</script>
