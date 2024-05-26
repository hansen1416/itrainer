<script lang="ts">
	import { onDestroy, onMount } from "svelte";

	import WebSocketClient from "../../../lib/WebSocketClient";
	import { derived } from "svelte/store";
	import {
		diva,
		animationQueueStore,
		websocketStateStore,
	} from "../../../store/store";

	export let id;

	// websocket client
	let wsClient = new WebSocketClient();
	// make sure animation data only send once dispite of websocket state change
	let animation_request_sent = false;
	// make sure menu only show when animation played, not when page first loaded
	let animation_played = false;

	onMount(() => {});

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

			const msg = "amq:" + id;

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

	onDestroy(() => {
		unsubscribe_derived_diva_ws();
		unsubscribe_animation_queue();
	});
</script>
