import { writable } from "svelte/store";
// message received from websocket
const websocket_messages = writable([]);

export default websocket_messages;
