<script lang="ts">
	/**
	 * this is the welcome page of the gym
	 */

	import { onDestroy } from "svelte";

	import { loadJSON } from "../../utils/ropes";
	import {
		gymReady,
		animationQueueStore,
		animationDictStore,
		conversationStore,
	} from "../../store/store";

	// make sure menu only show when animation played, not when page first loaded
	let animation_played = false;

	const gymReadyStoreUnsubscribe = gymReady.subscribe((ready) => {
		if (ready) {
			// when gym is ready, start the animation
			// wsClient = $websocket;
			// we need store to keep diva and scenery
			Promise.all([loadJSON("json/waving.json")])
				.then(([waving]) => {
					animationDictStore.set({
						waving: JSON.stringify(waving),
					});

					animationQueueStore.set([
						{
							name: "waving",
							repeat: 1,
							text: "Hi there, I am Anya, let's start the gym session!",
						},
					]);
				})
				.catch((err) => {
					console.error(err);
				});
		}
	});

	const animationQueueStoreUnsubscribe = animationQueueStore.subscribe(
		(a_queue) => {
			if (a_queue.length === 0) {
				if (animation_played) {
					conversationStore.set(null);
				}
			} else {
				animation_played = true;
			}
		},
	);

	onDestroy(() => {
		// // unsubscribe all stores
		gymReadyStoreUnsubscribe();
		animationQueueStoreUnsubscribe();
	});
</script>

<!-- 
{#if show_menu}
	<Menu />
{/if} -->
