import { CacheStore } from '../modules/cacheStore.mjs';

// Testing tab UI logic
export function resetCache() {
    // Remove all cache entries regardless of expire time
    if (typeof window !== 'undefined') {
        if (window.Storage && window.Storage.Cache && typeof window.Storage.Cache.clearAll === 'function') {
            window.Storage.Cache.clearAll();
        } else if (window.CacheStore && typeof window.CacheStore.clearAll === 'function') {
            window.CacheStore.clearAll();
        }
        alert('Cache reset triggered.');
    }
}
export function resetSessionStorage() {
    if (typeof window !== 'undefined') {
        if (window.sessionStorage && typeof window.sessionStorage.clear === 'function') {
            window.sessionStorage.clear();
        }
        alert('Session Storage reset triggered. All session storage entries removed.');
    }
}
export function resetLocalStorage() {
    if (typeof window !== 'undefined') {
        if (window.localStorage && typeof window.localStorage.clear === 'function') {
            window.localStorage.clear();
        }
        alert('Local Storage reset triggered. All local storage entries removed.');
    }
}
export function resetCloudStorage() {
    if (typeof window !== 'undefined') {
        // Placeholder: implement actual cloud storage clearing logic here
        if (window.CloudStorage && typeof window.CloudStorage.clearAll === 'function') {
            window.CloudStorage.clearAll();
        }
        alert('Cloud Storage reset triggered. All cloud storage entries removed.');
    }
}

// Only assign to window in browser context
export function attachTestingTabHandlers() {
                                                                    // --- Event Schedule Templates (Mock, unique vars) ---
                                                                    const est_importRawInput = document.getElementById('importRawEventScheduleTemplatesInput');
                                                                    const est_exportRawBtn = document.getElementById('exportRawEventScheduleTemplatesBtn');
                                                                    const est_importRawBtn = document.getElementById('importRawEventScheduleTemplatesBtn');
                                                                    const est_exportDetailedBtn = document.getElementById('exportDetailedEventScheduleTemplatesBtn');
                                                                    const est_importDetailedInput = document.getElementById('importDetailedEventScheduleTemplatesInput');
                                                                    const est_importDetailedBtn = document.getElementById('importDetailedEventScheduleTemplatesBtn');

                                                                    if (est_exportRawBtn) est_exportRawBtn.onclick = () => {
                                                                        alert('Mock: Export Raw Event Schedule Templates triggered.');
                                                                    };
                                                                    if (est_importRawInput) est_importRawInput.onchange = () => {
                                                                        alert('Mock: Import Raw Event Schedule Templates triggered.');
                                                                    };
                                                                    if (est_exportDetailedBtn) est_exportDetailedBtn.onclick = () => {
                                                                        alert('Mock: Export Detailed Event Schedule Templates triggered.');
                                                                    };
                                                                    if (est_importDetailedInput) est_importDetailedInput.onchange = () => {
                                                                        alert('Mock: Import Detailed Event Schedule Templates triggered.');
                                                                    };
                                                                    if (est_importRawBtn && est_importRawInput) est_importRawBtn.onclick = () => est_importRawInput.click();
                                                                    if (est_importDetailedBtn && est_importDetailedInput) est_importDetailedBtn.onclick = () => est_importDetailedInput.click();
                                                            // --- Workflows (Mock, unique vars) ---
                                                            const wf_importRawInput = document.getElementById('importRawWorkflowsInput');
                                                            const wf_exportRawBtn = document.getElementById('exportRawWorkflowsBtn');
                                                            const wf_importRawBtn = document.getElementById('importRawWorkflowsBtn');
                                                            const wf_exportDetailedBtn = document.getElementById('exportDetailedWorkflowsBtn');
                                                            const wf_importDetailedInput = document.getElementById('importDetailedWorkflowsInput');
                                                            const wf_importDetailedBtn = document.getElementById('importDetailedWorkflowsBtn');

                                                            if (wf_exportRawBtn) wf_exportRawBtn.onclick = () => {
                                                                alert('Mock: Export Raw Workflows triggered.');
                                                            };
                                                            if (wf_importRawInput) wf_importRawInput.onchange = () => {
                                                                alert('Mock: Import Raw Workflows triggered.');
                                                            };
                                                            if (wf_exportDetailedBtn) wf_exportDetailedBtn.onclick = () => {
                                                                alert('Mock: Export Detailed Workflows triggered.');
                                                            };
                                                            if (wf_importDetailedInput) wf_importDetailedInput.onchange = () => {
                                                                alert('Mock: Import Detailed Workflows triggered.');
                                                            };
                                                            if (wf_importRawBtn && wf_importRawInput) wf_importRawBtn.onclick = () => wf_importRawInput.click();
                                                            if (wf_importDetailedBtn && wf_importDetailedInput) wf_importDetailedBtn.onclick = () => wf_importDetailedInput.click();
                                                    // --- Workflows (Mock) ---
                                                    const importRawWorkflowsInput = document.getElementById('importRawWorkflowsInput');
                                                    const exportRawWorkflowsBtn = document.getElementById('exportRawWorkflowsBtn');
                                                    const importRawWorkflowsBtn = document.getElementById('importRawWorkflowsBtn');
                                                    const exportDetailedWorkflowsBtn = document.getElementById('exportDetailedWorkflowsBtn');
                                                    const importDetailedWorkflowsInput = document.getElementById('importDetailedWorkflowsInput');
                                                    const importDetailedWorkflowsBtn = document.getElementById('importDetailedWorkflowsBtn');

                                                    if (exportRawWorkflowsBtn) exportRawWorkflowsBtn.onclick = () => {
                                                        alert('Mock: Export Raw Workflows triggered.');
                                                    };
                                                    if (importRawWorkflowsInput) importRawWorkflowsInput.onchange = (e) => {
                                                        alert('Mock: Import Raw Workflows triggered.');
                                                    };
                                                    if (exportDetailedWorkflowsBtn) exportDetailedWorkflowsBtn.onclick = () => {
                                                        alert('Mock: Export Detailed Workflows triggered.');
                                                    };
                                                    if (importDetailedWorkflowsInput) importDetailedWorkflowsInput.onchange = (e) => {
                                                        alert('Mock: Import Detailed Workflows triggered.');
                                                    };
                                                    if (importRawWorkflowsBtn && importRawWorkflowsInput) importRawWorkflowsBtn.onclick = () => importRawWorkflowsInput.click();
                                                    if (importDetailedWorkflowsBtn && importDetailedWorkflowsInput) importDetailedWorkflowsBtn.onclick = () => importDetailedWorkflowsInput.click();
                                            // --- Users ---
                                            function getUsersInstance() {
                                                if (window.Users && typeof window.Users === 'object') {
                                                    return window.Users;
                                                }
                                                if (window.Storage && window.Storage.Users && typeof window.Storage.Users === 'object') {
                                                    return window.Storage.Users;
                                                }
                                                return null;
                                            }

                                            const importRawUsersInput = document.getElementById('importRawUsersInput');
                                            const exportRawUsersBtn = document.getElementById('exportRawUsersBtn');
                                            const importRawUsersBtn = document.getElementById('importRawUsersBtn');
                                            const exportDetailedUsersBtn = document.getElementById('exportDetailedUsersBtn');
                                            const importDetailedUsersInput = document.getElementById('importDetailedUsersInput');
                                            const importDetailedUsersBtn = document.getElementById('importDetailedUsersBtn');

                                            // Export Raw: export users as-is
                                            if (exportRawUsersBtn) exportRawUsersBtn.onclick = () => {
                                                const usersInstance = getUsersInstance();
                                                if (!usersInstance || !usersInstance.users) {
                                                    alert('No users found to export.');
                                                    return;
                                                }
                                                const blob = new Blob([JSON.stringify(usersInstance.users, null, 2)], { type: 'application/json' });
                                                const url = URL.createObjectURL(blob);
                                                const a = document.createElement('a');
                                                a.href = url;
                                                a.download = 'users.raw.json';
                                                document.body.appendChild(a);
                                                a.click();
                                                document.body.removeChild(a);
                                                URL.revokeObjectURL(url);
                                            };

                                            // Import Raw: import users as-is
                                            if (importRawUsersInput) importRawUsersInput.onchange = (e) => {
                                                const file = e.target.files[0];
                                                if (!file) return;
                                                const reader = new FileReader();
                                                reader.onload = function(evt) {
                                                    try {
                                                        const data = JSON.parse(evt.target.result);
                                                        const usersInstance = getUsersInstance();
                                                        if (usersInstance) {
                                                            usersInstance.users = data;
                                                            alert('Raw users import successful.');
                                                        } else {
                                                            alert('No users instance found.');
                                                        }
                                                    } catch (err) {
                                                        alert('Raw users import failed: ' + err.message);
                                                    }
                                                };
                                                reader.readAsText(file);
                                            };

                                            // Export Detailed: export full users object (including storageObj)
                                            if (exportDetailedUsersBtn) exportDetailedUsersBtn.onclick = () => {
                                                const usersInstance = getUsersInstance();
                                                if (!usersInstance) {
                                                    alert('No users found to export.');
                                                    return;
                                                }
                                                const detailed = (typeof usersInstance.constructor.CopyToJSON === 'function')
                                                    ? usersInstance.constructor.CopyToJSON(usersInstance)
                                                    : usersInstance;
                                                const blob = new Blob([JSON.stringify(detailed, null, 2)], { type: 'application/json' });
                                                const url = URL.createObjectURL(blob);
                                                const a = document.createElement('a');
                                                a.href = url;
                                                a.download = 'users.detailed.json';
                                                document.body.appendChild(a);
                                                a.click();
                                                document.body.removeChild(a);
                                                URL.revokeObjectURL(url);
                                            };

                                            // Import Detailed: import full users object (including storageObj)
                                            if (importDetailedUsersInput) importDetailedUsersInput.onchange = (e) => {
                                                const file = e.target.files[0];
                                                if (!file) return;
                                                const reader = new FileReader();
                                                reader.onload = function(evt) {
                                                    try {
                                                        const data = JSON.parse(evt.target.result);
                                                        let usersInstance = getUsersInstance();
                                                        if (usersInstance && typeof usersInstance.constructor.CopyFromObject === 'function') {
                                                            usersInstance.constructor.CopyFromObject(usersInstance, data);
                                                            alert('Detailed users import successful.');
                                                        } else if (usersInstance) {
                                                            Object.assign(usersInstance, data);
                                                            alert('Detailed users import successful (fallback).');
                                                        } else {
                                                            alert('No users instance found.');
                                                        }
                                                    } catch (err) {
                                                        alert('Detailed users import failed: ' + err.message);
                                                    }
                                                };
                                                reader.readAsText(file);
                                            };

                                            // Button triggers file input for import
                                            if (importRawUsersBtn && importRawUsersInput) importRawUsersBtn.onclick = () => importRawUsersInput.click();
                                            if (importDetailedUsersBtn && importDetailedUsersInput) importDetailedUsersBtn.onclick = () => importDetailedUsersInput.click();
                                    // --- Members ---
                                    function getMembersInstance() {
                                        if (window.Members && typeof window.Members === 'object') {
                                            return window.Members;
                                        }
                                        if (window.Storage && window.Storage.Members && typeof window.Storage.Members === 'object') {
                                            return window.Storage.Members;
                                        }
                                        return null;
                                    }

                                    const importRawMembersInput = document.getElementById('importRawMembersInput');
                                    const exportRawMembersBtn = document.getElementById('exportRawMembersBtn');
                                    const importRawMembersBtn = document.getElementById('importRawMembersBtn');
                                    const exportDetailedMembersBtn = document.getElementById('exportDetailedMembersBtn');
                                    const importDetailedMembersInput = document.getElementById('importDetailedMembersInput');
                                    const importDetailedMembersBtn = document.getElementById('importDetailedMembersBtn');

                                    // Export Raw: export members as-is
                                    if (exportRawMembersBtn) exportRawMembersBtn.onclick = () => {
                                        const membersInstance = getMembersInstance();
                                        if (!membersInstance || !membersInstance.members) {
                                            alert('No members found to export.');
                                            return;
                                        }
                                        const blob = new Blob([JSON.stringify(membersInstance.members, null, 2)], { type: 'application/json' });
                                        const url = URL.createObjectURL(blob);
                                        const a = document.createElement('a');
                                        a.href = url;
                                        a.download = 'members.raw.json';
                                        document.body.appendChild(a);
                                        a.click();
                                        document.body.removeChild(a);
                                        URL.revokeObjectURL(url);
                                    };

                                    // Import Raw: import members as-is
                                    if (importRawMembersInput) importRawMembersInput.onchange = (e) => {
                                        const file = e.target.files[0];
                                        if (!file) return;
                                        const reader = new FileReader();
                                        reader.onload = function(evt) {
                                            try {
                                                const data = JSON.parse(evt.target.result);
                                                const membersInstance = getMembersInstance();
                                                if (membersInstance) {
                                                    membersInstance.members = data;
                                                    alert('Raw members import successful.');
                                                } else {
                                                    alert('No members instance found.');
                                                }
                                            } catch (err) {
                                                alert('Raw members import failed: ' + err.message);
                                            }
                                        };
                                        reader.readAsText(file);
                                    };

                                    // Export Detailed: export full members object (including storageObj)
                                    if (exportDetailedMembersBtn) exportDetailedMembersBtn.onclick = () => {
                                        const membersInstance = getMembersInstance();
                                        if (!membersInstance) {
                                            alert('No members found to export.');
                                            return;
                                        }
                                        const detailed = (typeof membersInstance.constructor.CopyToJSON === 'function')
                                            ? membersInstance.constructor.CopyToJSON(membersInstance)
                                            : membersInstance;
                                        const blob = new Blob([JSON.stringify(detailed, null, 2)], { type: 'application/json' });
                                        const url = URL.createObjectURL(blob);
                                        const a = document.createElement('a');
                                        a.href = url;
                                        a.download = 'members.detailed.json';
                                        document.body.appendChild(a);
                                        a.click();
                                        document.body.removeChild(a);
                                        URL.revokeObjectURL(url);
                                    };

                                    // Import Detailed: import full members object (including storageObj)
                                    if (importDetailedMembersInput) importDetailedMembersInput.onchange = (e) => {
                                        const file = e.target.files[0];
                                        if (!file) return;
                                        const reader = new FileReader();
                                        reader.onload = function(evt) {
                                            try {
                                                const data = JSON.parse(evt.target.result);
                                                let membersInstance = getMembersInstance();
                                                if (membersInstance && typeof membersInstance.constructor.CopyFromObject === 'function') {
                                                    membersInstance.constructor.CopyFromObject(membersInstance, data);
                                                    alert('Detailed members import successful.');
                                                } else if (membersInstance) {
                                                    Object.assign(membersInstance, data);
                                                    alert('Detailed members import successful (fallback).');
                                                } else {
                                                    alert('No members instance found.');
                                                }
                                            } catch (err) {
                                                alert('Detailed members import failed: ' + err.message);
                                            }
                                        };
                                        reader.readAsText(file);
                                    };

                                    // Button triggers file input for import
                                    if (importRawMembersBtn && importRawMembersInput) importRawMembersBtn.onclick = () => importRawMembersInput.click();
                                    if (importDetailedMembersBtn && importDetailedMembersInput) importDetailedMembersBtn.onclick = () => importDetailedMembersInput.click();
                            // --- Roles ---
                            function getRolesInstance() {
                                if (window.Roles && typeof window.Roles === 'object') {
                                    return window.Roles;
                                }
                                if (window.Storage && window.Storage.Roles && typeof window.Storage.Roles === 'object') {
                                    return window.Storage.Roles;
                                }
                                return null;
                            }

                            const importRawRolesInput = document.getElementById('importRawRolesInput');
                            const exportRawRolesBtn = document.getElementById('exportRawRolesBtn');
                            const importRawRolesBtn = document.getElementById('importRawRolesBtn');
                            const exportDetailedRolesBtn = document.getElementById('exportDetailedRolesBtn');
                            const importDetailedRolesInput = document.getElementById('importDetailedRolesInput');
                            const importDetailedRolesBtn = document.getElementById('importDetailedRolesBtn');

                            // Export Raw: export roles as-is
                            if (exportRawRolesBtn) exportRawRolesBtn.onclick = () => {
                                const rolesInstance = getRolesInstance();
                                if (!rolesInstance || !rolesInstance.roles) {
                                    alert('No roles found to export.');
                                    return;
                                }
                                const blob = new Blob([JSON.stringify(rolesInstance.roles, null, 2)], { type: 'application/json' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = 'roles.raw.json';
                                document.body.appendChild(a);
                                a.click();
                                document.body.removeChild(a);
                                URL.revokeObjectURL(url);
                            };

                            // Import Raw: import roles as-is
                            if (importRawRolesInput) importRawRolesInput.onchange = (e) => {
                                const file = e.target.files[0];
                                if (!file) return;
                                const reader = new FileReader();
                                reader.onload = function(evt) {
                                    try {
                                        const data = JSON.parse(evt.target.result);
                                        const rolesInstance = getRolesInstance();
                                        if (rolesInstance) {
                                            rolesInstance.roles = data;
                                            alert('Raw roles import successful.');
                                        } else {
                                            alert('No roles instance found.');
                                        }
                                    } catch (err) {
                                        alert('Raw roles import failed: ' + err.message);
                                    }
                                };
                                reader.readAsText(file);
                            };

                            // Export Detailed: export full roles object (including storageObj)
                            if (exportDetailedRolesBtn) exportDetailedRolesBtn.onclick = () => {
                                const rolesInstance = getRolesInstance();
                                if (!rolesInstance) {
                                    alert('No roles found to export.');
                                    return;
                                }
                                const detailed = (typeof rolesInstance.constructor.CopyToJSON === 'function')
                                    ? rolesInstance.constructor.CopyToJSON(rolesInstance)
                                    : rolesInstance;
                                const blob = new Blob([JSON.stringify(detailed, null, 2)], { type: 'application/json' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = 'roles.detailed.json';
                                document.body.appendChild(a);
                                a.click();
                                document.body.removeChild(a);
                                URL.revokeObjectURL(url);
                            };

                            // Import Detailed: import full roles object (including storageObj)
                            if (importDetailedRolesInput) importDetailedRolesInput.onchange = (e) => {
                                const file = e.target.files[0];
                                if (!file) return;
                                const reader = new FileReader();
                                reader.onload = function(evt) {
                                    try {
                                        const data = JSON.parse(evt.target.result);
                                        let rolesInstance = getRolesInstance();
                                        if (rolesInstance && typeof rolesInstance.constructor.CopyFromObject === 'function') {
                                            rolesInstance.constructor.CopyFromObject(rolesInstance, data);
                                            alert('Detailed roles import successful.');
                                        } else if (rolesInstance) {
                                            Object.assign(rolesInstance, data);
                                            alert('Detailed roles import successful (fallback).');
                                        } else {
                                            alert('No roles instance found.');
                                        }
                                    } catch (err) {
                                        alert('Detailed roles import failed: ' + err.message);
                                    }
                                };
                                reader.readAsText(file);
                            };

                            // Button triggers file input for import
                            if (importRawRolesBtn && importRawRolesInput) importRawRolesBtn.onclick = () => importRawRolesInput.click();
                            if (importDetailedRolesBtn && importDetailedRolesInput) importDetailedRolesBtn.onclick = () => importDetailedRolesInput.click();
                    // --- Callings ---
                    function getCallingsInstance() {
                        if (window.Callings && typeof window.Callings === 'object') {
                            return window.Callings;
                        }
                        if (window.Storage && window.Storage.Callings && typeof window.Storage.Callings === 'object') {
                            return window.Storage.Callings;
                        }
                        return null;
                    }

                    const importRawCallingsInput = document.getElementById('importRawCallingsInput');
                    const exportRawCallingsBtn = document.getElementById('exportRawCallingsBtn');
                    const importRawCallingsBtn = document.getElementById('importRawCallingsBtn');
                    const exportDetailedCallingsBtn = document.getElementById('exportDetailedCallingsBtn');
                    const importDetailedCallingsInput = document.getElementById('importDetailedCallingsInput');
                    const importDetailedCallingsBtn = document.getElementById('importDetailedCallingsBtn');

                    // Export Raw: export callings as-is
                    if (exportRawCallingsBtn) exportRawCallingsBtn.onclick = () => {
                        const callingsInstance = getCallingsInstance();
                        if (!callingsInstance || !callingsInstance.callings) {
                            alert('No callings found to export.');
                            return;
                        }
                        const blob = new Blob([JSON.stringify(callingsInstance.callings, null, 2)], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'callings.raw.json';
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                    };

                    // Import Raw: import callings as-is
                    if (importRawCallingsInput) importRawCallingsInput.onchange = (e) => {
                        const file = e.target.files[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = function(evt) {
                            try {
                                const data = JSON.parse(evt.target.result);
                                const callingsInstance = getCallingsInstance();
                                if (callingsInstance) {
                                    callingsInstance.callings = data;
                                    alert('Raw callings import successful.');
                                } else {
                                    alert('No callings instance found.');
                                }
                            } catch (err) {
                                alert('Raw callings import failed: ' + err.message);
                            }
                        };
                        reader.readAsText(file);
                    };

                    // Export Detailed: export full callings object (including storageObj)
                    if (exportDetailedCallingsBtn) exportDetailedCallingsBtn.onclick = () => {
                        const callingsInstance = getCallingsInstance();
                        if (!callingsInstance) {
                            alert('No callings found to export.');
                            return;
                        }
                        const detailed = (typeof callingsInstance.constructor.CopyToJSON === 'function')
                            ? callingsInstance.constructor.CopyToJSON(callingsInstance)
                            : callingsInstance;
                        const blob = new Blob([JSON.stringify(detailed, null, 2)], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'callings.detailed.json';
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                    };

                    // Import Detailed: import full callings object (including storageObj)
                    if (importDetailedCallingsInput) importDetailedCallingsInput.onchange = (e) => {
                        const file = e.target.files[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = function(evt) {
                            try {
                                const data = JSON.parse(evt.target.result);
                                let callingsInstance = getCallingsInstance();
                                if (callingsInstance && typeof callingsInstance.constructor.CopyFromObject === 'function') {
                                    callingsInstance.constructor.CopyFromObject(callingsInstance, data);
                                    alert('Detailed callings import successful.');
                                } else if (callingsInstance) {
                                    Object.assign(callingsInstance, data);
                                    alert('Detailed callings import successful (fallback).');
                                } else {
                                    alert('No callings instance found.');
                                }
                            } catch (err) {
                                alert('Detailed callings import failed: ' + err.message);
                            }
                        };
                        reader.readAsText(file);
                    };

                    // Button triggers file input for import
                    if (importRawCallingsBtn && importRawCallingsInput) importRawCallingsBtn.onclick = () => importRawCallingsInput.click();
                    if (importDetailedCallingsBtn && importDetailedCallingsInput) importDetailedCallingsBtn.onclick = () => importDetailedCallingsInput.click();
            // --- Organization ---
            function getOrgInstance() {
                if (window.Organization && typeof window.Organization === 'object') {
                    return window.Organization;
                }
                if (window.Storage && window.Storage.Organization && typeof window.Storage.Organization === 'object') {
                    return window.Storage.Organization;
                }
                return null;
            }

            const importRawOrgInput = document.getElementById('importRawOrgInput');
            const exportRawOrgBtn = document.getElementById('exportRawOrgBtn');
            const importRawOrgBtn = document.getElementById('importRawOrgBtn');
            const exportDetailedOrgBtn = document.getElementById('exportDetailedOrgBtn');
            const importDetailedOrgInput = document.getElementById('importDetailedOrgInput');
            const importDetailedOrgBtn = document.getElementById('importDetailedOrgBtn');

            // Export Raw: export organization as-is
            if (exportRawOrgBtn) exportRawOrgBtn.onclick = () => {
                const orgInstance = getOrgInstance();
                if (!orgInstance || !orgInstance.organization) {
                    alert('No organization found to export.');
                    return;
                }
                const blob = new Blob([JSON.stringify(orgInstance.organization, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'organization.raw.json';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            };

            // Import Raw: import organization as-is
            if (importRawOrgInput) importRawOrgInput.onchange = (e) => {
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = function(evt) {
                    try {
                        const data = JSON.parse(evt.target.result);
                        const orgInstance = getOrgInstance();
                        if (orgInstance) {
                            orgInstance.organization = data;
                            alert('Raw organization import successful.');
                        } else {
                            alert('No organization instance found.');
                        }
                    } catch (err) {
                        alert('Raw organization import failed: ' + err.message);
                    }
                };
                reader.readAsText(file);
            };

            // Export Detailed: export full org object (including storageObj)
            if (exportDetailedOrgBtn) exportDetailedOrgBtn.onclick = () => {
                const orgInstance = getOrgInstance();
                if (!orgInstance) {
                    alert('No organization found to export.');
                    return;
                }
                const detailed = (typeof orgInstance.constructor.CopyToJSON === 'function')
                    ? orgInstance.constructor.CopyToJSON(orgInstance)
                    : orgInstance;
                const blob = new Blob([JSON.stringify(detailed, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'organization.detailed.json';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            };

            // Import Detailed: import full org object (including storageObj)
            if (importDetailedOrgInput) importDetailedOrgInput.onchange = (e) => {
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = function(evt) {
                    try {
                        const data = JSON.parse(evt.target.result);
                        let orgInstance = getOrgInstance();
                        if (orgInstance && typeof orgInstance.constructor.CopyFromObject === 'function') {
                            orgInstance.constructor.CopyFromObject(orgInstance, data);
                            alert('Detailed organization import successful.');
                        } else if (orgInstance) {
                            Object.assign(orgInstance, data);
                            alert('Detailed organization import successful (fallback).');
                        } else {
                            alert('No organization instance found.');
                        }
                    } catch (err) {
                        alert('Detailed organization import failed: ' + err.message);
                    }
                };
                reader.readAsText(file);
            };

            // Button triggers file input for import
            if (importRawOrgBtn && importRawOrgInput) importRawOrgBtn.onclick = () => importRawOrgInput.click();
            if (importDetailedOrgBtn && importDetailedOrgInput) importDetailedOrgBtn.onclick = () => importDetailedOrgInput.click();
    if (typeof window !== 'undefined') {
        window.resetCache = resetCache;
        window.resetSessionStorage = resetSessionStorage;
        window.resetLocalStorage = resetLocalStorage;
        window.resetCloudStorage = resetCloudStorage;
        // --- Cache ---
        const resetCacheBtn = document.getElementById('resetCacheBtn');
        const viewCacheBtn = document.getElementById('viewCacheBtn');
        const exportCacheBtn = document.getElementById('exportCacheBtn');
        const importCacheInput = document.getElementById('importCacheInput');
        if (resetCacheBtn) resetCacheBtn.onclick = resetCache;
        if (viewCacheBtn) viewCacheBtn.onclick = () => {
            let entries = [];
            if (window.CacheStore && typeof window.CacheStore.entries === 'function') {
                entries = window.CacheStore.entries();
            }
            alert('Cache Entries:\n' + JSON.stringify(entries, null, 2));
        };
        if (exportCacheBtn) exportCacheBtn.onclick = () => {
            let entries = [];
            if (window.CacheStore && typeof window.CacheStore.entries === 'function') {
                entries = window.CacheStore.entries();
            }
            const blob = new Blob([JSON.stringify(entries, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'cache-entries.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        };
        if (importCacheInput) importCacheInput.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = function(evt) {
                try {
                    const data = JSON.parse(evt.target.result);
                    if (Array.isArray(data) && window.CacheStore && typeof window.CacheStore.Set === 'function') {
                        data.forEach(([key, value]) => window.CacheStore.Set(key, value));
                        alert('Cache import successful.');
                    }
                } catch (err) {
                    alert('Cache import failed: ' + err.message);
                }
            };
            reader.readAsText(file);
        };

        // --- Session Storage ---
        const resetSessionStorageBtn = document.getElementById('resetSessionStorageBtn');
        const viewSessionStorageBtn = document.getElementById('viewSessionStorageBtn');
        const exportSessionStorageBtn = document.getElementById('exportSessionStorageBtn');
        const importSessionStorageInput = document.getElementById('importSessionStorageInput');
        if (resetSessionStorageBtn) resetSessionStorageBtn.onclick = resetSessionStorage;
        if (viewSessionStorageBtn) viewSessionStorageBtn.onclick = () => {
            let entries = {};
            if (window.sessionStorage) {
                for (let i = 0; i < window.sessionStorage.length; i++) {
                    const key = window.sessionStorage.key(i);
                    entries[key] = window.sessionStorage.getItem(key);
                }
            }
            alert('Session Storage Entries:\n' + JSON.stringify(entries, null, 2));
        };
        if (exportSessionStorageBtn) exportSessionStorageBtn.onclick = () => {
            let entries = {};
            if (window.sessionStorage) {
                for (let i = 0; i < window.sessionStorage.length; i++) {
                    const key = window.sessionStorage.key(i);
                    entries[key] = window.sessionStorage.getItem(key);
                }
            }
            const blob = new Blob([JSON.stringify(entries, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'session-storage.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        };
        if (importSessionStorageInput) importSessionStorageInput.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = function(evt) {
                try {
                    const data = JSON.parse(evt.target.result);
                    if (typeof data === 'object' && window.sessionStorage) {
                        Object.entries(data).forEach(([key, value]) => window.sessionStorage.setItem(key, value));
                        alert('Session Storage import successful.');
                    }
                } catch (err) {
                    alert('Session Storage import failed: ' + err.message);
                }
            };
            reader.readAsText(file);
        };

        // --- Local Storage ---
        const resetLocalStorageBtn = document.getElementById('resetLocalStorageBtn');
        const viewLocalStorageBtn = document.getElementById('viewLocalStorageBtn');
        const exportLocalStorageBtn = document.getElementById('exportLocalStorageBtn');
        const importLocalStorageInput = document.getElementById('importLocalStorageInput');
        if (resetLocalStorageBtn) resetLocalStorageBtn.onclick = resetLocalStorage;
        if (viewLocalStorageBtn) viewLocalStorageBtn.onclick = () => {
            let entries = {};
            if (window.localStorage) {
                for (let i = 0; i < window.localStorage.length; i++) {
                    const key = window.localStorage.key(i);
                    entries[key] = window.localStorage.getItem(key);
                }
            }
            alert('Local Storage Entries:\n' + JSON.stringify(entries, null, 2));
        };
        if (exportLocalStorageBtn) exportLocalStorageBtn.onclick = () => {
            let entries = {};
            if (window.localStorage) {
                for (let i = 0; i < window.localStorage.length; i++) {
                    const key = window.localStorage.key(i);
                    entries[key] = window.localStorage.getItem(key);
                }
            }
            const blob = new Blob([JSON.stringify(entries, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'local-storage.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        };
        if (importLocalStorageInput) importLocalStorageInput.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = function(evt) {
                try {
                    const data = JSON.parse(evt.target.result);
                    if (typeof data === 'object' && window.localStorage) {
                        Object.entries(data).forEach(([key, value]) => window.localStorage.setItem(key, value));
                        alert('Local Storage import successful.');
                    }
                } catch (err) {
                    alert('Local Storage import failed: ' + err.message);
                }
            };
            reader.readAsText(file);
        };

        // --- Cloud Storage ---
        const resetCloudStorageBtn = document.getElementById('resetCloudStorageBtn');
        const viewCloudStorageBtn = document.getElementById('viewCloudStorageBtn');
        const exportCloudStorageBtn = document.getElementById('exportCloudStorageBtn');
        const importCloudStorageInput = document.getElementById('importCloudStorageInput');
        if (resetCloudStorageBtn) resetCloudStorageBtn.onclick = resetCloudStorage;
        if (viewCloudStorageBtn) viewCloudStorageBtn.onclick = () => {
            let entries = [];
            if (window.CloudStorage && typeof window.CloudStorage.entries === 'function') {
                entries = window.CloudStorage.entries();
            }
            alert('Cloud Storage Entries:\n' + JSON.stringify(entries, null, 2));
        };
        if (exportCloudStorageBtn) exportCloudStorageBtn.onclick = () => {
            let entries = [];
            if (window.CloudStorage && typeof window.CloudStorage.entries === 'function') {
                entries = window.CloudStorage.entries();
            }
            const blob = new Blob([JSON.stringify(entries, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'cloud-storage.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        };
        if (importCloudStorageInput) importCloudStorageInput.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = function(evt) {
                try {
                    const data = JSON.parse(evt.target.result);
                    if (Array.isArray(data) && window.CloudStorage && typeof window.CloudStorage.Set === 'function') {
                        data.forEach(([key, value]) => window.CloudStorage.Set(key, value));
                        alert('Cloud Storage import successful.');
                    }
                } catch (err) {
                    alert('Cloud Storage import failed: ' + err.message);
                }
            };
            reader.readAsText(file);
        };

        // --- Configuration ---
        const importRawConfigInput = document.getElementById('importRawConfigInput');
        const exportRawConfigBtn = document.getElementById('exportRawConfigBtn');
        const importDetailedConfigInput = document.getElementById('importDetailedConfigInput');
        const exportDetailedConfigBtn = document.getElementById('exportDetailedConfigBtn');

        // Helper to get config instance
        function getConfigInstance() {
            if (window.Configuration && typeof window.Configuration === 'object') {
                return window.Configuration;
            }
            if (window.Storage && window.Storage.Configuration && typeof window.Storage.Configuration === 'object') {
                return window.Storage.Configuration;
            }
            return null;
        }

        // Export Raw: export configuration as-is
        if (exportRawConfigBtn) exportRawConfigBtn.onclick = () => {
            const configInstance = getConfigInstance();
            if (!configInstance || !configInstance.configuration) {
                alert('No configuration found to export.');
                return;
            }
            const blob = new Blob([JSON.stringify(configInstance.configuration, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'configuration.raw.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        };

        // Import Raw: import configuration as-is
        if (importRawConfigInput) importRawConfigInput.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = function(evt) {
                try {
                    const data = JSON.parse(evt.target.result);
                    const configInstance = getConfigInstance();
                    if (configInstance) {
                        configInstance.configuration = data;
                        alert('Raw configuration import successful.');
                    } else {
                        alert('No configuration instance found.');
                    }
                } catch (err) {
                    alert('Raw configuration import failed: ' + err.message);
                }
            };
            reader.readAsText(file);
        };

        // Export Detailed: export full config object (including storageObj)
        if (exportDetailedConfigBtn) exportDetailedConfigBtn.onclick = () => {
            const configInstance = getConfigInstance();
            if (!configInstance) {
                alert('No configuration found to export.');
                return;
            }
            // Use static method to get full object
            const detailed = (typeof configInstance.constructor.CopyToJSON === 'function')
                ? configInstance.constructor.CopyToJSON(configInstance)
                : configInstance;
            const blob = new Blob([JSON.stringify(detailed, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'configuration.detailed.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        };

        // Import Detailed: import full config object (including storageObj)
        if (importDetailedConfigInput) importDetailedConfigInput.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = function(evt) {
                try {
                    const data = JSON.parse(evt.target.result);
                    let configInstance = getConfigInstance();
                    if (configInstance && typeof configInstance.constructor.CopyFromObject === 'function') {
                        configInstance.constructor.CopyFromObject(configInstance, data);
                        alert('Detailed configuration import successful.');
                    } else if (configInstance) {
                        // fallback: assign properties
                        Object.assign(configInstance, data);
                        alert('Detailed configuration import successful (fallback).');
                    } else {
                        alert('No configuration instance found.');
                    }
                } catch (err) {
                    alert('Detailed configuration import failed: ' + err.message);
                }
            };
            reader.readAsText(file);
        };
    }
}

if (typeof window !== 'undefined') {
    if (document.readyState !== 'loading') {
        attachTestingTabHandlers();
    } else {
        window.addEventListener('DOMContentLoaded', attachTestingTabHandlers);
    }
}
