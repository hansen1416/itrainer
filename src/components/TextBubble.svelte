<script>
	import { onDestroy, onMount } from "svelte";
	import Typed from "typed.js";
	import conversation from "../store/conversationStore";

	let typedInstance;

	let show_bubble = false;

	onMount(() => {
		typedInstance = new Typed("#text_bubble", {
			strings: [""],
			//   typeSpeed: 50,
			//   loop: false,
		});
	});

	const unsubscribe_conversation = conversation.subscribe((value) => {
		if (typedInstance) {
			typedInstance.destroy();

			if (value && value instanceof Array) {
				show_bubble = true;

				typedInstance = new Typed("#text_bubble", {
					strings: value,
					//   typeSpeed: 50,
					//   loop: false,
				});

				console.log('text changed to "' + typedInstance.strings + '"');

				typedInstance.start();
			} else {
				show_bubble = false;
			}
		}
	});

	onDestroy(() => {
		typedInstance.destroy();

		unsubscribe_conversation();
	});
</script>

<div
	id="text_bubble"
	class="text-bubble"
	style:visibility={show_bubble ? "visible" : "hidden"}
></div>

<style>
	.text-bubble {
		position: absolute;
		top: 30px;
		left: 50%;
		width: 300px;
		min-height: 30px;
		margin-left: -150px;
		background-color: rgba(255, 255, 255, 0.6);
	}
</style>
