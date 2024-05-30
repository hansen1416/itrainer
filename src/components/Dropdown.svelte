<script lang="ts">
	import { selectedAnimationKeyStore } from "../store/store";

	export let title: string = "Dropdown";

	export let contentList: string[] = [];

	let listElement: HTMLDivElement;

	// When the user clicks on the button,
	// toggle between hiding and showing the dropdown content
	function toggleShow() {
		listElement.classList.toggle("hide");
	}
</script>

<div class="dropdown">
	<button on:click={toggleShow} class="dropbtn">{title}</button>
	<div bind:this={listElement} class="dropdown-content hide">
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
	$nav-height: 40px;

	.dropbtn {
		color: white;
		height: $nav-height;
		line-height: $nav-height;
		font-size: 18px;
		font-weight: bold;
		border: none;
		cursor: pointer;
	}

	/* The container <div> - needed to position the dropdown content */
	.dropdown {
		position: relative;
		display: inline-block;
		margin-left: 24px;
	}

	/* Dropdown Content (Hidden by Default) */
	.dropdown-content {
		display: block;
		position: absolute;
		background-color: #f1f1f1;
		min-width: 160px;
		box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
		z-index: 1;
		min-height: 30px;

		&.hide {
			display: none;
		}

		.content {
			color: black;
			padding: 12px 16px;
			text-decoration: none;
			display: block;

			&:hover {
				background-color: #ddd;
			}
		}
	}
</style>
