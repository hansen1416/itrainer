<section>
	<div>
		<p>
			Step1: go to Recorder page, choose a video and extract animation
			from it, click save when it's done
		</p>
		<video controls={true}>
			<source src="/videos/step1.webm" type="video/webm" />
			<track label="English" kind="captions" default />
		</video>
	</div>
	<div>
		<p>
			Step2: Edit the extracted animation in edit page. Save it as an
			exercise
		</p>
		<video controls={true}>
			<source src="/videos/step2.webm" type="video/webm" />
			<track label="English" kind="captions" default />
		</video>
	</div>
	<div>
		<p>
			Step2: Go to Gym and choose an exercise and play with it, the more
			close you follow the higher the score.
		</p>
		<video controls={true}>
			<source src="/videos/step3.webm" type="video/webm" />
			<track label="English" kind="captions" default />
		</video>
	</div>
</section>

<style lang="scss">
	:global(body) {
		overflow: scroll !important;
	}

	section {
		width: 1000px;
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		align-items: center;
		padding: 60px 0 60px 0;
		background: rgba(0, 0, 0, 0.5);
		margin-top: 60px;
		// overflow: scroll;
		height: 1400px;

		div {
			margin-bottom: 48px;
		}

		p {
			color: #aaa;
			margin-bottom: 12px;
		}

		video {
			width: 800px;
			height: 380px;
		}
	}
</style>
