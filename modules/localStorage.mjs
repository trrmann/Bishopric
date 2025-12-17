export function HasPreference(key) {
    return (GetPreference(key) != null);
}
export function SetPreference(key, value) {
    localStorage.setItem(key, value);
}
export function GetPreference(key) {
    return localStorage.getItem(key);
}
export function SetPreferenceObject(key, value) {
    SetPreference(key, JSON.stringify(value));
}
export function GetPreferenceObject(key) {
    return JSON.parse(GetPreference(key));
}