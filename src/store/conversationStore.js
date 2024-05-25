import { writable } from "svelte/store";
// key, value dictionary, keep all the animation data
const conversation = writable([])

export default conversation