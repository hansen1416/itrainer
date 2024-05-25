import { writable } from "svelte/store";
// websocket connection status
const websocket_state = writable(0);

export default websocket_state;