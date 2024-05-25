<script>
	/**
	 * 
		By Focus:

		Strength Building: Exercises involving bodyweight or equipment that target specific muscle groups.
		Cardiovascular: Activities that elevate heart rate and improve endurance.
		Flexibility and Balance: Movements promoting joint mobility and stability.
		Mind-Body Connection: Practices like yoga and tai chi that combine physical movement with mindfulness.
		Low-Impact: Gentle exercises suitable for all fitness levels and joint limitations.

		By Equipment:

		Bodyweight Only: Workouts requiring no equipment, relying solely on your own body weight.
		Minimal Equipment: Exercises utilizing readily available household items like chairs, towels, or water bottles.
		Resistance Band Workouts: Activities targeting different muscle groups with resistance bands.
		Free Weight Workouts: Exercises using dumbbells, barbells, or kettlebells (if space allows).

		By Intensity:

		Low-Intensity: Gentle movements for beginners or recovery days.
		Moderate-Intensity: Workouts that elevate heart rate and challenge muscles without extreme exertion.
		High-Intensity: Intense activities for experienced individuals seeking a maximal effort.
		Interval Training: Alternating periods of high and low intensity for a challenging and time-efficient workout.

		By Duration:

		Short Bursts: Quick workouts under 15 minutes ideal for busy schedules.
		Mid-Length Sessions: Workouts lasting 20-30 minutes for a balanced approach.
		Longer Workouts: Activities exceeding 30 minutes for those seeking a more substantial challenge.
    */
	import { onDestroy, onMount } from "svelte";
	// import axios from "axios";

	// CORS
	const menu_request = getMenu();

	async function getMenu() {
		return null;
		// try {
		// 	const response = await axios.get("http://localhost:3333/menu");

		// 	return response.data;
		// } catch (error) {
		// 	console.error(error);
		// }
	}

	onMount(() => {});

	onDestroy(() => {});
</script>

<section class="menu">
	<!-- iterate over menu -->
	{#await menu_request}
		<!-- promise is pending -->
		<p>waiting for the promise to resolve...</p>
	{:then items}
		<!-- promise was fulfilled or not a Promise -->
		{#each items as { name, children }}
			<div class="menu-item">
				<div>{name}</div>
				{#each children as { name, id }}
					<div>
						<a href="/gym/{id}">{name}</a>
					</div>
				{/each}
			</div>
		{/each}
	{:catch error}
		<!-- promise was rejected -->
		<p>Something went wrong: {error.message}</p>
	{/await}
</section>

<style>
	.menu {
		position: absolute;
		top: 50%;
		left: 50%;
		width: 400px;
		height: 300px;
		margin-left: -200px;
		margin-top: -50px;
		background-color: rgba(255, 255, 255, 0.6);
	}
</style>
