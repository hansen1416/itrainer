<script lang="ts">
	import { browser } from "$app/environment";
	import { goto } from "$app/navigation";
	import { onDestroy, onMount } from "svelte";
	import * as THREE from "three";
	import Stats from "three/examples/jsm/libs/stats.module.js";
	import { derived } from "svelte/store";

	import ThreeScene from "../../lib/ThreeScene";
	import {
		loadDiva,
		loadScenery,
		animtionThreeFormat,
	} from "../../utils/ropes";
	import type { AnimationQueueItem } from "../../types/index";
	import {
		gymReady,
		animationDictStore,
		conversationStore,
		animationQueueStore,
		selectedAnimationKeyStore,
	} from "../../store/store";
	import TextBubble from "../../components/TextBubble.svelte";

	let canvas: HTMLCanvasElement;

	let threeScene: ThreeScene;

	let stats: Stats;

	let animation_pointer = 0;

	let diva_mixer: THREE.AnimationMixer;

	let diva_action: THREE.AnimationAction;

	let selectedAnimationKeyUnsubscribe: Function;

	const clock = new THREE.Clock();

	function animate() {
		if (diva_mixer && diva_action) {
			diva_mixer.update(clock.getDelta());
		}

		// update physics world and threejs renderer
		threeScene.onFrameUpdate(stats);

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

		Promise.all([loadDiva(), loadScenery()])
			.then(([_diva, _scenery]) => {
				_diva.name = "diva";

				diva_mixer = new THREE.AnimationMixer(_diva);

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

				_scenery.name = "scenery";

				threeScene.scene.add(_scenery as THREE.Object3D);

				threeScene.scene.add(_diva as THREE.Object3D);

				gymReady.set(true);
			})
			.catch((err) => {
				console.error(err);
			});

		animate();
	});

	// we need to watch both animation_queue and animation_data, make sure they both complete
	const _derived_queue_data = derived(
		[animationQueueStore, animationDictStore],
		([_animationQueue, _animationDict]) => {
			return [_animationQueue, _animationDict];
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
		([_animationQueue, _animationDict]) => {
			if (!threeScene) {
				return;
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

			// need convert bones:euler to threejs animation format
			const animation_clip_json = animtionThreeFormat(animation_json);

			const animation_clip =
				THREE.AnimationClip.parse(animation_clip_json);

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

	selectedAnimationKeyUnsubscribe = selectedAnimationKeyStore.subscribe(
		(key) => {
			if (browser && key) {
				// go to the gym/[id], with the selected animation
				goto(`/gym/${key}`);
			}
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

		if (selectedAnimationKeyUnsubscribe) {
			selectedAnimationKeyUnsubscribe();
		}
	});

	/**
 * 
import { browser } from "$app/environment";
import WebSocketClient from "../lib/WebSocketClient";
import type { AnimationQueueItem } from "../types/index";
import {
	animationDictStore,
	animationQueueStore,
	websocketStateStore,
} from "../store/store";

let socket: WebSocketClient;

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
});

onDestroy(() => {
	if (browser) {
		socket.close();
	}
});
*/
</script>

<!-- section is not needed, only for readablity -->
<section>
	<canvas bind:this={canvas} />
</section>

<slot></slot>

<TextBubble />

<style lang="scss">
	canvas {
		/* this will only affect <canvas> elements in this component */
		/* z-index: -1; */
		position: absolute;
		top: 0;
		left: 0;
		bottom: 0;
		right: 0;
	}
</style>
