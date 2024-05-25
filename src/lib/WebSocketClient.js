let instance;

export default class WebSocketClient {
	constructor() {

		// make it a singleton, so we only have 1 threejs scene
		if (instance) {
			return instance;
		}

		this.socket = null;
		this.onConnect = () => { };
		this.onMessage = () => { }; // Define empty default event handlers
		// this.onError = () => { };
		// this.onClose = () => { };

		instance = this;
	}

	connect (url) {
		this.socket = new WebSocket(url);

		// Set the binaryType property to send binary data
		this.socket.binaryType = "arraybuffer";

		// Function to send a ping message
		// keep the connection alive,
		// Example: Send a ping every 10 seconds
		setInterval(() => {
			const pingData = new ArrayBuffer(0); // Empty payload
			this.socket.send(pingData);
		}, 10000);

		this.socket.onopen = () => {
			console.log("websocket connected, state change to", this.socket.readyState);
			this.onConnect(this.socket.readyState); // Call user-defined onConnect handler
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

	sendMessage (message) {
		if (this.socket.readyState === WebSocket.OPEN) {
			this.socket.send(message);
		} else {
			console.error("WebSocket is not open, cannot send message.");
		}
	}

	close () {
		if (this.socket) {
			this.socket.close();
			this.socket = null;
		}
	}
}
