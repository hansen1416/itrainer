import { writable } from "svelte/store";
// models to be rendered
const diva = writable(null);
const shadow = writable(null);
const scenery = writable(null);

export { diva, shadow, scenery };