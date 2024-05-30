<script lang="ts">
	import { browser } from "$app/environment";
	import { onDestroy, onMount } from "svelte";

	import "./app.scss";
	import WebSocketClient from "../lib/WebSocketClient";
	import type { AnimationQueueItem } from "../types/index";
	import {
		animationDictStore,
		animationQueueStore,
		websocketStateStore,
	} from "../store/store";
	import ApiRequest from "../lib/ApiRequest";
	import Dropdown from "../components/Dropdown.svelte";

	let socket: WebSocketClient;

	let myAnimations: string[] = [];

	onMount(() => {
		socket = new WebSocketClient();
		// When you write $websocket, you're essentially saying, "Get the current value from the store named websocket."

		// websocket.set(socket); // Assign the instance to the store
		// Connect to the websocket
		socket.connect("ws://localhost:3333/ws");

		socket.onConnect = (ws_state) => {
			websocketStateStore.set(ws_state);
		};

		socket.onMessage = (msg) => {
			// check if msg is an ArrayBuffer(0)
			if (msg instanceof ArrayBuffer && msg.byteLength === 0) {
				console.log("received heartbeat message");
				return;
			}

			if (typeof msg !== "string") {
				console.log(
					"websocket message received non-string message",
					msg,
				);
				return;
			}

			// first split the message
			const [redis_key, data] = (msg as string).split("::");

			const [category, name] = redis_key.split(":");

			if (category === "am") {
				// 'am' is animation data for a single animation
				console.log("received animation data", name);

				animationDictStore.update((old_data) => {
					return { ...old_data, [name]: data };
				});
			} else if (category === "amq") {
				// 'amq' is animation queue, a list of animation metadata

				const anim_quque = JSON.parse(data);

				console.log("received animation queue", anim_quque);

				// update animation_queue
				animationQueueStore.update((old_queue) => {
					return [...old_queue, ...anim_quque];
				});

				// iterate through animation_queue, and request animation data
				anim_quque.forEach((anim: AnimationQueueItem) => {
					const msg = "am:" + anim.name;

					socket.sendMessage(msg);
				});
			} else {
				console.log("received unknown message", msg);
			}
		};

		ApiRequest.getAnimationList().then((res) => {
			myAnimations = res.data;
		});
	});

	onDestroy(() => {
		if (browser) {
			socket.close();
		}
	});
</script>

<svelte:head>
	<title>iTrainer</title>
	<meta name="description" content="AI Trainer" />
</svelte:head>

<div class="main">
	<slot></slot>
</div>

<div class="nav">
	<a href="/gym">Gym</a>
	<a href="/editor">Editor</a>
	<a href="/recorder">Recorder</a>
	<Dropdown title="My Animations" contentList={myAnimations} />
</div>

<style lang="scss">
	$nav-height: 40px;

	.nav {
		display: block;
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: $nav-height;

		a {
			display: inline-block;
			height: $nav-height;
			line-height: $nav-height;
			text-align: center;
			text-decoration: none;
			color: white;
			font-size: 18px;
			font-weight: bold;
			margin-left: 24px;
		}
	}

	.main {
		position: relative;
		display: block;
		width: 100%;
		height: 100vh;
	}
</style>
