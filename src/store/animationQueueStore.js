import { writable } from "svelte/store";
// list of animation metadata, {name: string, repeat: int}
const animation_queue = writable([]);

export default animation_queue;
