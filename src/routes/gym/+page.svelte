<script lang="ts">
	/**
	 * this is the welcome page of the gym
	 */

	import { onDestroy, onMount } from "svelte";

	// import Menu from "../../components/Menu.svelte";
	import { loadJSON } from "../../utils/ropes";
	import {
		animationQueueStore,
		animationDictStore,
		conversationStore,
	} from "../../store/store";

	// show menu when animation queue is empty
	let show_menu = false;
	// make sure menu only show when animation played, not when page first loaded
	let animation_played = false;

	onMount(() => {
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
	});

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
