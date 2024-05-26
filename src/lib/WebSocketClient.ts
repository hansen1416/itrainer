let instance: WebSocketClient;

export default class WebSocketClient {

	socket: WebSocket | null = null;

	onConnect: (readyState: number) => void = () => { };

	onMessage: (event: MessageEvent) => void = () => { };

	onError: (error: Event) => void = () => { };

	onClose: (event: CloseEvent) => void = () => { };

	constructor() {

		// make it a singleton, so we only have 1 threejs scene
		if (instance) {
			return instance;
		}

		instance = this;
	}

	connect(url: string) {
		this.socket = new WebSocket(url);

		// Set the binaryType property to send binary data
		this.socket.binaryType = "arraybuffer";

		// Function to send a ping message
		// keep the connection alive,
		// Example: Send a ping every 10 seconds
		setInterval(() => {
			const pingData = new ArrayBuffer(0); // Empty payload
			(this.socket as WebSocket).send(pingData);
		}, 10000);

		this.socket.onopen = () => {
			console.log("websocket connected, state change to", (this.socket as WebSocket).readyState);
			this.onConnect((this.socket as WebSocket).readyState); // Call user-defined onConnect handler
		};

		this.socket.onmessage = (event) => {
			this.onMessage(event.data); // Call user-defined onMessage handler
		};

		this.socket.onerror = (error) => {
			console.error("WebSocket error:", error);
			// this.onError(error); // Call user-defined onError handler
		};

		this.socket.onclose = (event) => {
			console.log("WebSocket closed:", event.code, event.reason);
			// this.onClose(event); // Call user-defined onClose handler
		};
	}

	sendMessage(message: string) {
		if ((this.socket as WebSocket).readyState === WebSocket.OPEN) {
			(this.socket as WebSocket).send(message);
		} else {
			console.error("WebSocket is not open, cannot send message.");
		}
	}

	close() {
		if (this.socket) {
			this.socket.close();
			this.socket = null;
		}
	}
}
