<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import * as THREE from "three";
	import type { ApplyMethod, ControlType, DiaplayScene } from "../types";

	import Icon from "../icons/Icon.svelte";
	import {
		displayScene,
		controlType,
		currentRotation,
		selectedBone,
	} from "../store";
	import WebStorage from "../lib/WebStorage";

	const iconSize: number = 36;

	let eulerX: number = 0;
	let eulerY: number = 0;
	let eulerZ: number = 0;

	let showEulerInputs: boolean = false;

	// when currentRotation change, update eulerX, eulerY, eulerZ
	currentRotation.subscribe((value: THREE.Euler | null) => {
		if (value) {
			eulerX = value.x;
			eulerY = value.y;
			eulerZ = value.z;

			showEulerInputs = true;
		} else {
			showEulerInputs = false;
		}
	});

	const dispatch = createEventDispatcher();

	let _controlType: ControlType = "";

	controlType.subscribe((value) => {
		_controlType = value;
	});

	function swicthDisplayScene(value: DiaplayScene) {
		displayScene.set(value);
		WebStorage.save("display_scene", value);
		if (value === "mesh") {
			selectedBone.set(null);
		}
	}

	function swicthControlType(value: ControlType) {
		if (value === _controlType) {
			controlType.set("");
		} else {
			controlType.set(value);
		}

		WebStorage.save("control_type", value);
	}

	function editRotation(interpolation: ApplyMethod) {
		const rot = new THREE.Euler(eulerX, eulerY, eulerZ);

		dispatch("editBoneRotation", {
			euler: rot,
			method: interpolation,
		});
	}
</script>

<section class="panel">
	<button
		on:click={() => {
			swicthDisplayScene("skeleton");
		}}
	>
		<Icon name="bones" size={iconSize} />
	</button>
	<button
		on:click={() => {
			swicthDisplayScene("mesh");
		}}
	>
		<Icon name="mesh" size={iconSize} />
	</button>
	<button
		on:click={() => {
			swicthControlType("translation");
		}}
	>
		<Icon name="axis" size={iconSize} />
	</button>
	<button
		on:click={() => {
			swicthControlType("rotation");
		}}
	>
		<Icon name="rotate" size={iconSize} />
	</button>
	{#if showEulerInputs}
		<div class="euler-inputs">
			<label>
				<span>x:</span>
				<input bind:value={eulerX} />
			</label>
			<label>
				<span>y:</span>
				<input bind:value={eulerY} />
			</label>
			<label>
				<span>z:</span>
				<input bind:value={eulerZ} />
			</label>
			<button
				on:click={() => {
					editRotation("linear");
				}}
			>
				<span>Apply</span>
			</button>
		</div>
	{/if}
</section>

<style>
	.panel {
		position: absolute;
		top: 25vh;
		right: 30px;
		width: auto;
		height: auto;
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		align-items: flex-end;
	}

	.panel button {
		margin-bottom: 8px;
	}

	.euler-inputs {
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		align-items: center;
		padding-top: 12px;
		color: #fff;
	}

	.euler-inputs button {
		color: #fff;
		font-size: 18px;
		padding-top: 8px;
	}

	.panel input {
		width: 60px;
		border: 0;
	}
</style>
