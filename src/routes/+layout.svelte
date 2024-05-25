<script lang="ts">
	import "./app.scss";
</script>

<svelte:head>
	<title>iTrainer</title>
	<meta name="description" content="AI Trainer" />
</svelte:head>

<div class="nav">
	<a href="/gym">Gym</a>
	<a href="/editor">Editor</a>
	<a href="/recorder">recorder</a>
</div>

<div class="main">
	<slot></slot>
</div>
