// modules/crypto.mjs
// Standalone Public/Private Key Encryption Module using Web Crypto API


export class CryptoKeyPair {
    // ===== Instance Accessors =====
    get PublicKey() { return this.publicKey; }
    get PrivateKey() { return this.privateKey; }

    // ===== Constructor =====
    constructor(publicKey = null, privateKey = null) {
        this.publicKey = publicKey;
        this.privateKey = privateKey;
    }

    // ===== Static Methods =====
    static CopyFromJSON(dataJSON) {
        return new CryptoKeyPair(dataJSON.publicKey, dataJSON.privateKey);
    }
    static CopyToJSON(instance) {
        return {
            publicKey: instance.publicKey,
            privateKey: instance.privateKey
        };
    }
    static CopyFromObject(destination, source) {
        destination.publicKey = source.publicKey;
        destination.privateKey = source.privateKey;
    }
    static async Factory(publicKey = null, privateKey = null) {
        return new CryptoKeyPair(publicKey, privateKey);
    }
}

export class PublicKeyCrypto {
    // ===== Static Methods =====
    static async Factory() {
        return new PublicKeyCrypto();
    }

    static CopyFromJSON(dataJSON) {
        // No instance state, return new instance
        return new PublicKeyCrypto();
    }
    static CopyToJSON(instance) {
        return {};
    }
    static CopyFromObject(destination, source) {
        // No instance state to copy
    }

    // Generate a new RSA-OAEP key pair
    static async generateKeyPair() {
        const keyPair = await window.crypto.subtle.generateKey(
            {
                name: "RSA-OAEP",
                modulusLength: 2048,
                publicExponent: new Uint8Array([1, 0, 1]),
                hash: "SHA-256"
            },
            true,
            ["encrypt", "decrypt"]
        );
        return new CryptoKeyPair(keyPair.publicKey, keyPair.privateKey);
    }

    // Export a key to base64 string (spki for public, pkcs8 for private)
    static async exportKey(key, type = "public") {
        const format = type === "public" ? "spki" : "pkcs8";
        const exported = await window.crypto.subtle.exportKey(format, key);
        return PublicKeyCrypto._arrayBufferToBase64(exported);
    }

    // Import a key from base64 string
    static async importKey(base64, type = "public") {
        const format = type === "public" ? "spki" : "pkcs8";
        const usages = type === "public" ? ["encrypt"] : ["decrypt"];
        const keyData = PublicKeyCrypto._base64ToArrayBuffer(base64);
        return await window.crypto.subtle.importKey(
            format,
            keyData,
            {
                name: "RSA-OAEP",
                hash: "SHA-256"
            },
            true,
            usages
        );
    }

    // Encrypt data with a public key
    static async encrypt(publicKey, data) {
        const encoded = new TextEncoder().encode(data);
        const encrypted = await window.crypto.subtle.encrypt(
            { name: "RSA-OAEP" },
            publicKey,
            encoded
        );
        return PublicKeyCrypto._arrayBufferToBase64(encrypted);
    }

    // Decrypt data with a private key
    static async decrypt(privateKey, base64Ciphertext) {
        const encrypted = PublicKeyCrypto._base64ToArrayBuffer(base64Ciphertext);
        const decrypted = await window.crypto.subtle.decrypt(
            { name: "RSA-OAEP" },
            privateKey,
            encrypted
        );
        return new TextDecoder().decode(decrypted);
    }

    // Helper: ArrayBuffer to base64
    static _arrayBufferToBase64(buffer) {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }

    // Helper: base64 to ArrayBuffer
    static _base64ToArrayBuffer(base64) {
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return bytes.buffer;
    }
}
