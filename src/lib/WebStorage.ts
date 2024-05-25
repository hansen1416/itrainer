import { browser } from '$app/environment';

export default class WebStorage {

    static storage: Storage | null = browser ? window.sessionStorage : null;

    constructor() {

    }

    static save(key: string, data: any) {

        if (!WebStorage.storage) {
            return;
        }

        if (typeof data === 'object') {
            WebStorage.storage.setItem(key, JSON.stringify(data));
        } else {
            WebStorage.storage.setItem(key, data);
        }
    }

    static read(key: string) {

        if (!WebStorage.storage) {
            return null;
        }

        const data = WebStorage.storage.getItem(key);

        if (!data) {
            return null;
        }

        try {
            return JSON.parse(data);
        } catch (e) {
            return data;
        }
    }
}