class Queue {
    constructor() {
        this.queue = {};
        this.head = 0;
        this.tail = 0;
    }

    enqueue (value) {
        this.queue[this.tail] = value;
        this.tail++;
    }

    dequeue () {
        if (this.tail === this.head) {
            return undefined;
        }

        const value = this.queue[this.head];
        delete this.queue[this.head];
        this.head++;
        return value;
    }

    peek () {
        if (this.tail === this.head) {
            return undefined;
        }

        return this.queue[this.head];
    }

    get length () {
        return this.tail - this.head;
    }

    toString () {
        let result = '';
        for (let i = this.head; i < this.tail; i++) {
            result += this.queue[i] + ',';
        }
        return result;
    }

    valueOf () {
        let result = [];
        for (let i = this.head; i < this.tail; i++) {
            result.push(this.queue[i]);
        }
        return result;
    }
}