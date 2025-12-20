export class SessionStorage {
    static _keyRegistry = new Set();
    static _secureKeyRegistry = new Set();

    constructor() {
        // You can initialize any properties here if needed
    }

    // Set a value in sessionStorage
    setItem(key, value) {
        SessionStorage._keyRegistry.add(key);
        sessionStorage.setItem(key, value);
    }

    // Set a secure value in sessionStorage using public key encryption
    async setSecureItem(key, value, publicKey) {
        const encrypted = await PublicKeyCrypto.encrypt(publicKey, value);
        this.setItem(key, encrypted);
        SessionStorage._secureKeyRegistry.add(key);
    }

    // Get a value from sessionStorage
    getItem(key) {
        return sessionStorage.getItem(key);
    }

    // Get a secure value from sessionStorage using private key decryption
    async getSecureItem(key, privateKey) {
        let value = this.getItem(key);
        if (SessionStorage._secureKeyRegistry.has(key) && value != null) {
            if (privateKey) {
                try {
                    value = await PublicKeyCrypto.decrypt(privateKey, value);
                } catch (e) {
                    // If decryption fails, return the raw value
                }
            }
        }
        return value;
    }

    // Remove a value from sessionStorage
    removeItem(key) {
        sessionStorage.removeItem(key);
        SessionStorage._keyRegistry.delete(key);
        SessionStorage._secureKeyRegistry.delete(key);
    }

    // Clear all sessionStorage and registry
    clear() {
        sessionStorage.clear();
        SessionStorage._keyRegistry.clear();
        SessionStorage._secureKeyRegistry.clear();
    }

    // Get all registered keys
    static getAllKeys() {
        return Array.from(SessionStorage._keyRegistry);
    }

    static getAllSecureKeys() {
        return Array.from(SessionStorage._secureKeyRegistry);
    }

    // Check if a key exists in the registry
    static hasKey(key) {
        return SessionStorage._keyRegistry.has(key);
    }

    static hasSecureKey(key) {
        return SessionStorage._secureKeyRegistry.has(key);
    }
}