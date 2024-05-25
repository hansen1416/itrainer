<script lang="ts">
	import { onMount } from "svelte";
	// import * as THREE from "three";

	export let name: string;

	export let size: number = 30;

	let IconComponent: ConstructorOfATypedSvelteComponent;

	onMount(async () => {
		IconComponent = (await import(/* @vite-ignore */ `./${name}.svelte`))
			.default;
	});
</script>

<div class="icon">
	<svelte:component this={IconComponent} {size} color="#fff" />
</div>

<style>
	.icon {
		cursor: pointer;
	}
</style>
