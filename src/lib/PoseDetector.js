
// import { Pose } from "@mediapipe/pose";

// // function deepClone<T> (obj: T): T {
// // 	return JSON.parse(JSON.stringify(obj)) as T;
// // }


// function deepClone (obj) {
// 	return JSON.parse(JSON.stringify(obj));
// }

// let instance;

// export default class PoseDetector {
// 	/** @type {Pose} */
// 	#detector;

// 	/** @type {bool} */
// 	#detector_available = true;

// 	/** @type {number} */
// 	#counter = 0;

// 	constructor() {
// 		if (instance) {
// 			return instance;
// 		}

// 		instance = this;
// 	}

// 	/**
// 	 *
// 	 * @param {Function} onResultCallback
// 	 */
// 	init (onResultCallback) {
// 		this.#detector = new Pose({
// 			locateFile: (file) => {
// 				return `/mediapipe/${file}`;
// 				// return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
// 			},
// 		});

// 		this.#detector.setOptions({
// 			modelComplexity: 2,
// 			smoothLandmarks: true,
// 			enableSegmentation: false,
// 			smoothSegmentation: false,
// 			minDetectionConfidence: 0.5,
// 			minTrackingConfidence: 0.5,
// 		});

// 		// make sure `onResultCallback` is callable
// 		if (typeof onResultCallback === "function") {
// 			this.#detector.onResults((result) => {
// 				if (
// 					!result ||
// 					!result.poseLandmarks ||
// 					!result.poseWorldLandmarks
// 				) {
// 					this.#detector_available = true;
// 					return;
// 				}

// 				const keypoints3D = deepClone(result.poseWorldLandmarks);

// 				const width_ratio = 30;
// 				const height_ratio = (width_ratio * 480) / 640;

// 				// multiply x,y by differnt factor
// 				for (let v of keypoints3D) {
// 					v["x"] *= -width_ratio;
// 					v["y"] *= -height_ratio;
// 					v["z"] *= -width_ratio;
// 				}

// 				onResultCallback(keypoints3D);

// 				this.#detector_available = true;
// 			});
// 		}

// 		return this.#detector.initialize();
// 	}

// 	/**
// 	 *
// 	 * @param {HTMLVideoElement} video
// 	 * @returns
// 	 */
// 	predict (video) {
// 		if (!this.#detector_available) {
// 			return;
// 		}

// 		if (!video || video.readyState < 2) {
// 			console.error("Video is not ready");
// 		}

// 		if (this.#counter % 6 === 0) {
// 			this.#detector_available = false;

// 			this.#detector.send({ image: video });
// 		}

// 		this.#counter += 1;
// 		// we don't want to too big int
// 		if (this.#counter === 10000) {
// 			this.#counter = 0;
// 		}
// 	}
// }
