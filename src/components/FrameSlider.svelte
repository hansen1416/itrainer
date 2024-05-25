<script lang="ts">
	import { onDestroy, onMount, createEventDispatcher } from "svelte";
	import * as THREE from "three";
	import * as noUiSlider from "nouislider";
	import "nouislider/dist/nouislider.css";
	import { selectedBone } from "../store";

	interface SlierHTMLElement extends HTMLElement {
		noUiSlider: any;
	}

	const dispatch = createEventDispatcher();

	export let min_value: number;

	export let max_value: number;

	export let initial_value: number;

	export let keyFrames: number[];

	let current_value: number = initial_value;

	let slider: HTMLElement;

	let _selectedBone: THREE.Object3D | null = null;

	let deleteFrameIdx: number | null = null;

	onMount(() => {
		// todo update range.min and max
		noUiSlider.create(slider, {
			start: [0],
			tooltips: {
				to: function (value: number) {
					return ~~value;
				},
			},
			range: {
				min: 0,
				max: 100,
			},
			// step: 1,
			pips: {
				mode: "steps" as any,
				density: 1,
			},
		});

		(slider as SlierHTMLElement).noUiSlider.on(
			"update.one",
			function (values: number[]) {
				current_value = ~~values[0];
				dispatch("update", { frame_idx: current_value });
			},
		);
	});

	$: if (
		min_value !== undefined &&
		max_value !== undefined &&
		slider !== undefined &&
		(slider as SlierHTMLElement).noUiSlider !== undefined
	) {
		(slider as SlierHTMLElement).noUiSlider.updateOptions({
			range: {
				min: min_value,
				max: max_value,
			},
		});
	}

	onDestroy(() => {
		if (slider) {
			(slider as SlierHTMLElement).noUiSlider.destroy();
		}
	});

	selectedBone.subscribe((value: THREE.Object3D | null) => {
		_selectedBone = value;
	});
</script>

<div class="slidecontainer">
	<div class="keyframe-panel">
		<div>
			<button
				on:click={() => {
					dispatch("addKeyframe", { frame_idx: current_value });
				}}
				disabled={!_selectedBone}
			>
				<span>Add Keyframe</span>
			</button>
			<button
				on:click={() => {
					dispatch("deleteKeyframe", {
						frame_idx: deleteFrameIdx,
					});
					// do this in a callback is more proper, settle for now
					deleteFrameIdx = null;
				}}
				disabled={deleteFrameIdx === null}
			>
				<span>Delete Keyframe</span>
			</button>
		</div>
	</div>
	<div class="slide-box">
		<div bind:this={slider}></div>
	</div>
	<div class="keyframes">
		{#each keyFrames as value, idx (value)}
			<div
				class="keyframe"
				class:disabled={deleteFrameIdx === value}
				style="left: {(value / max_value) * 100}%"
			>
				<button
					on:click={() => {
						if (deleteFrameIdx === value) {
							deleteFrameIdx = null;
						} else {
							deleteFrameIdx = value;
						}
					}}
				>
					<div class="upper-nob"></div>
					<div class="lower-nob"></div>
				</button>
				<div class="needle"></div>
			</div>
		{/each}
	</div>
</div>

<style>
	.slidecontainer {
		width: 100%; /* Width of the outside container */
	}

	.keyframe-panel {
		position: relative;
		display: flex;
		justify-content: flex-end;
		align-items: center;
		width: 100%;
		height: 20px;
	}

	.slide-box {
		position: absolute;
		top: 40px;
		width: 100%;
	}

	.keyframes {
		position: relative;
		width: 100%;
		height: 12px;
		margin-bottom: 8px;
	}

	.keyframe {
		position: absolute;
		top: 0;
		width: 10px;
		height: 20px;
	}

	.keyframe .upper-nob {
		width: 10px;
		height: 10px;
		background-color: #000;
	}

	.keyframe .lower-nob {
		width: 0px;
		height: 0px;
		border-top: 10px solid #000;
		border-left: 5px solid transparent;
		border-right: 5px solid transparent;
	}

	.keyframe .needle {
		position: absolute;
		top: 20px;
		left: 4px;
		width: 2px;
		height: 20px;
		background-color: #000;
	}

	.keyframe.disabled .upper-nob {
		background-color: #ccc;
	}

	.keyframe.disabled .lower-nob {
		border-top: 10px solid #ccc;
	}

	.keyframe.disabled .needle {
		background-color: #ccc;
	}
</style>
