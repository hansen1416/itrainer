<script lang="ts">
	import "./app.scss";
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
