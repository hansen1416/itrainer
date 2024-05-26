<script lang="ts">
	import { onDestroy, onMount } from "svelte";
	import { derived } from "svelte/store";
	import * as THREE from "three";

	// import Menu from "../../components/Menu.svelte";
	import WebSocketClient from "../../lib/WebSocketClient";
	import { loadDiva, loadScenery, loadJSON } from "../../utils/ropes";
	import {
		diva,
		scenery,
		animationQueueStore,
		animationDictStore,
		conversationStore,
	} from "../../store/store";

	// websocket client
	let wsClient = new WebSocketClient();
	// make sure animation data only send once dispite of websocket state change
	let animation_request_sent = false;
	// show menu when animation queue is empty
	let show_menu = false;
	// make sure menu only show when animation played, not when page first loaded
	let animation_played = false;

	onMount(() => {
		// wsClient = $websocket;
		// we need store to keep diva and scenery
		Promise.all([
			loadDiva($diva as THREE.Object3D),
			loadScenery($scenery as THREE.Object3D),
			loadJSON("json/waving.json"),
		])
			.then(([fbx, room, waving]) => {
				diva.set(fbx as THREE.Object3D);
				scenery.set(room as THREE.Object3D);

				animationDictStore.set({
					waving: JSON.stringify(waving),
				});

				animationQueueStore.set([
					{
						name: "waving",
						repeat: 1,
						text: "Hi, I am Diva, nice to meet you!",
					},
				]);
			})
			.catch((err) => {
				console.error(err);
			});
	});

	// let _derived_store = derived(
	// 	[diva, websocketStateStore],
	// 	([_diva, _websocket_state]) => {
	// 		return [_diva, _websocket_state];
	// 	},
	// );

	// const unsubscribe_derived_store = _derived_store.subscribe(
	// 	([_diva, _websocket_state]) => {
	// 		// when websocket is connected, and diva is loaded
	// 		// request the animation data needed in this component from redis
	// 		// make only send request once

	// 		if (
	// 			!_diva ||
	// 			typeof _diva !== "object" ||
	// 			_diva.isObject3D !== true
	// 		) {
	// 			// diva is not ready, do nothing
	// 			return;
	// 		}

	// 		if (_websocket_state !== WebSocket.OPEN) {
	// 			// websocket is not ready, do nothing
	// 			return;
	// 		}

	// 		if (animation_request_sent) {
	// 			return;
	// 		}

	// 		const msg = "amq:greeting";

	// 		// when websocket is connected, request the animation data needed in this component
	// 		wsClient.sendMessage(msg);

	// 		console.log("request animation data from redis msg: " + msg);

	// 		animation_request_sent = true;
	// 	},
	// );

	const unsubscribe_animation_queue = animationQueueStore.subscribe(
		(a_queue) => {
			if (a_queue.length === 0) {
				if (animation_played) {
					// when there is animation palyed, and the queue empty render menu component
					show_menu = true;

					conversationStore.set(null);
				}
			} else {
				animation_played = true;
			}
		},
	);

	onDestroy(() => {
		// // unsubscribe all stores
		// unsubscribe_derived_store();
		unsubscribe_animation_queue();
	});
</script>

<!-- 
{#if show_menu}
	<Menu />
{/if} -->
