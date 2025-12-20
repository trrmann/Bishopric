import { PublicKeyCrypto } from "./crypto.mjs";

export class LocalStorage {
    static _keyRegistry = new Set();
    static _secureKeyRegistry = new Set();

    static async HasPreference(key) {
        const pref = await LocalStorage.GetPreference(key);
        const result = (pref != null);
        if(result) {
            if(!LocalStorage._keyRegistry.has(key)) {
                LocalStorage._keyRegistry.add(key);
            }
        } else {
            if(LocalStorage._keyRegistry.has(key)) {
                LocalStorage._keyRegistry.remove(key);
            }
        }
        return result;
    }
    static SetPreference(key, value) {
        LocalStorage._keyRegistry.add(key);
        localStorage.setItem(key, value);
    }
    // GetPreference is now async to support decryption
    static async GetPreference(key, privateKey = null) {
        let value = localStorage.getItem(key);
        if (LocalStorage._secureKeyRegistry.has(key) && value != null) {
            // Decrypt if secure and privateKey is provided
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
    static async SetPreferenceObject(key, value) {
        LocalStorage.SetPreference(key, JSON.stringify(value));
    }
    static async GetPreferenceObject(key, privateKey = null) {
        const val = await LocalStorage.GetPreference(key, privateKey);
        return JSON.parse(val);
    }
    static GetAllKeys() {
        return Array.from(LocalStorage._keyRegistry);
    }
    static DeletePreference(key) {
        localStorage.removeItem(key);
        LocalStorage._keyRegistry.delete(key);
    }
    // Set a secure preference using public key encryption
    static async SetSecurePreference(key, value, publicKey) {
        // Encrypt value with the provided publicKey (must be a CryptoKey)
        const encrypted = await PublicKeyCrypto.encrypt(publicKey, value);
        LocalStorage.SetPreference(key, encrypted);
        LocalStorage._secureKeyRegistry.add(key);
    }

    static GetAllSecureKeys() {
        return Array.from(LocalStorage._secureKeyRegistry);
    }
}