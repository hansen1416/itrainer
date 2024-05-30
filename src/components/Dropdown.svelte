<script lang="ts">
	import { selectedAnimationKeyStore } from "../store/store";

	export let title: string = "Dropdown";

	export let contentList: string[] = [];

	let listElement: HTMLDivElement;

	// When the user clicks on the button,
	// toggle between hiding and showing the dropdown content
	function toggleShow() {
		listElement.classList.toggle("show");
	}
</script>

<div class="dropdown">
	<button on:click={toggleShow} class="dropbtn">{title}</button>
	<div bind:this={listElement} class="dropdown-content">
		{#each contentList as content}
			<button
				on:click={() => {
					selectedAnimationKeyStore.set(content);
				}}
			>
				<div class="content">{content}</div>
			</button>
		{/each}
	</div>
</div>

<style lang="scss">
	/* Dropdown Button */
	.dropbtn {
		background-color: #3498db;
		color: white;
		padding: 16px;
		font-size: 16px;
		border: none;
		cursor: pointer;
	}

	/* Dropdown button on hover & focus */
	.dropbtn:hover,
	.dropbtn:focus {
		background-color: #2980b9;
	}

	/* The container <div> - needed to position the dropdown content */
	.dropdown {
		position: relative;
		display: inline-block;
	}

	/* Dropdown Content (Hidden by Default) */
	.dropdown-content {
		display: none;
		position: absolute;
		background-color: #f1f1f1;
		min-width: 160px;
		box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
		z-index: 1;
	}

	/* Links inside the dropdown */
	.dropdown-content .content {
		color: black;
		padding: 12px 16px;
		text-decoration: none;
		display: block;
	}

	/* Change color of dropdown links on hover */
	.dropdown-content .content:hover {
		background-color: #ddd;
	}

	/* Show the dropdown menu (use JS to add this class to the .dropdown-content container when the user clicks on the dropdown button) */
	.show {
		display: block;
	}
</style>
