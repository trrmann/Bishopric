import { Members } from "../modules/members.mjs";
import { Users } from "../modules/users.mjs";

console.log('[DEBUG] VERY TOP OF AUTH.MJS - Module loaded');
// modules/auth.mjs
// Authentication management module for Unit Management Tools
export class Auth {
    constructor(config) {
        const configuration = config.configuration;
        // Defensive: handle missing or null configuration or sub-objects
        const login = configuration && configuration.login ? configuration.login : {};
        const main = configuration && configuration.main ? configuration.main : {};
        this._storageObj = config._storageObj;
        this.target = login.target || '';
        this.destinationID = login.destinationID || '';
        this.formID = login.formID || '';
        this.emailInputID = login.emailInputID || '';
        this.emailListID = login.emailListID || '';
        this.passwordInputID = login.passwordInputID || '';
        this.mainContainerID = main.container || '';
        this.roleSelectorID = main.roleSelector || '';
        this.selectedRolesID = main.selectedRoles || '';
        this.logoutID = main.logout || '';
        this.allUsers = [];
        this.currentUser = null;
    }
    static async Factory(storageObject) {
        console.log('[DEBUG] [TRACE] VERY FIRST LINE OF Auth.Factory');
        try { console.trace('[TRACE] Auth.Factory stack'); } catch {}
        console.log('[DEBUG] Auth.Factory called');
        console.log('[DEBUG] [TRACE] About to dynamic import configuration.mjs');
        let Configuration;
        try {
            const imported = await import('./configuration.mjs');
            Configuration = imported.Configuration;
            Auth.Configuration = Configuration; // Store on Auth for later use
            console.log('[DEBUG] [TRACE] Dynamic import of configuration.mjs succeeded');
        } catch (importErr) {
            console.error('[DEBUG] [TRACE] Dynamic import of configuration.mjs FAILED:', importErr);
            throw importErr;
        }
        console.log('[DEBUG] >>> ENTERED Auth.Factory');
        // Use Configuration.Fetch to leverage hierarchical caching
        const configInstance = await Configuration.Factory(storageObject);
        // Ensure configuration is loaded before passing to Auth
        let configData = null;
        if (typeof configInstance.Fetch === 'function') {
            configData = await configInstance.Fetch();
        }
        // Defensive: if configData is not loaded, throw error
        if (!configData) {
            throw new Error('Auth.Factory: Configuration could not be loaded.');
        }
        // Attach configuration data to configInstance for Auth constructor
        configInstance.configuration = configData;
        configInstance._storageObj = storageObject; // Ensure _storageObj is set
        const auth = new Auth(configInstance);
        auth.CreateLoginModalWithSpecs();
        console.log('[DEBUG] Login modal should now be created and appended to body.');
        (async function() {
            try {
                // Always reload users for login page
                const usersObj = await Users.Factory({
                    configuration: configInstance.configuration,
                    _storageObj: configInstance._storageObj
                });
                auth.allUsers = await usersObj.UsersDetails();
                auth.PopulateEmailList(auth.emailListID);
            } catch (error) {
                console.error('Error loading users:', error);
                auth.allUsers = [];
            }
            const loggedInUser = sessionStorage.getItem('currentUser');
            console.log('[DEBUG] sessionStorage.getItem("currentUser"):', loggedInUser);
            if (loggedInUser) {
                try {
                    auth.currentUser = JSON.parse(loggedInUser);
                    console.log('[DEBUG] Restoring session for user:', auth.currentUser);
                    await auth.ShowDashboard();
                } catch (error) {
                    console.error('Error restoring session:', error);
                    auth.ShowLoginForm();
                }
            } else {
                console.log('[DEBUG] No session found, showing login modal.');
                auth.ShowLoginForm();
            }
        })();
        return auth;
    }

    // Dynamically create and insert the login modal HTML
    CreateLoginModalWithSpecs() {
        // ...existing code...
    }
    // Handle login form submission
    async HandleLogin(event) {
        // ...existing code...
    }
    // Populate email datalist with users from JSON
    PopulateEmailList(elementID) {
        // ...existing code...
    }
    ShowLoginForm() {
        // ...existing code...
    }
    // Show dashboard
    async ShowDashboard() {
        // ...existing code...
    }
    // Load and configure role selector
    async LoadRoleSelector() {
        // ...existing code...
    }
    // Role display update function
    UpdateRole() {
        // ...existing code...
    }
    // Get display name for role value
    GetRoleDisplayName(roleValue) {
        // ...existing code...
    }
    static get SESSION_KEY() { return 'currentUser'; }
    // Store user session in sessionStorage
    static setSession(user) {
        // ...existing code...
    }
    // Retrieve user session from sessionStorage
    static getSession() {
        // ...existing code...
    }
    // Remove user session from sessionStorage
    static clearSession() {
        // ...existing code...
    }
    // Check if a user is currently authenticated
    static isAuthenticated() {
        // ...existing code...
    }
    // Handle login (returns user object if successful, null otherwise)
    static login(email, password, users) {
        // ...existing code...
    }
    // Handle logout
    static logout() {
        // ...existing code...
    }
    // Render members table (moved from scripts/script.js)
    async renderMembersTable() {
        // ...existing code...
    }
    // Dynamically create and insert the login modal HTML
    CreateLoginModalWithSpecs() {
        console.log('[DEBUG] >>> TOP OF CreateLoginModalWithSpecs');
        console.log('[DEBUG] Entering CreateLoginModalWithSpecs');
        console.log('[DEBUG] Modal creation IDs:', {
            destinationID: this.destinationID,
            formID: this.formID,
            emailInputID: this.emailInputID,
            emailListID: this.emailListID,
            passwordInputID: this.passwordInputID,
            mainContainerID: this.mainContainerID,
            roleSelectorID: this.roleSelectorID,
            selectedRolesID: this.selectedRolesID,
            logoutID: this.logoutID
        });
        if (!this.destinationID) {
            console.warn('[DEBUG] destinationID is empty or undefined! Modal will not be created.');
        }
        if (document.getElementById(this.destinationID)) {
            console.log('[DEBUG] Modal already exists in DOM, skipping creation.');
            return;
        }
        const modal = document.createElement('div');
        const loginFormContainer = document.createElement('div');
        const loginHeader = document.createElement('div');
        const churchLogo = document.createElement('img');
        const loginTitle = document.createElement('h2');
        const loginMessage = document.createElement('p');
        const loginForm = document.createElement('form');
        const emailFormGroup = document.createElement('div');
        const emailLabel = document.createElement('label');
        const emailInput = document.createElement('input');
        const emailDataList = document.createElement('datalist');
        const passwordFormGroup = document.createElement('div');
        const passwordLabel = document.createElement('label');
        const passwordInput = document.createElement('input');
        const loginButton = document.createElement('button');
        const loginSpecialAttentionSection = document.createElement('div');
        const loginSpecialAttentionSectionTitle = document.createElement('p');
        const loginSpecialAttentionSectionMessage = document.createElement('small');

        modal.id = this.destinationID;
        loginForm.id = this.formID;
        emailInput.id = this.emailInputID;
        emailDataList.id = this.emailListID;
        passwordInput.id = this.passwordInputID;

        modal.className = 'modal active';
        modal.style.zIndex = '10001'; // Ensure above static modal
        modal.style.position = 'fixed';
        modal.style.left = '0';
        modal.style.top = '0';
        modal.style.width = '100vw';
        modal.style.height = '100vh';
        modal.style.display = 'flex';
        modal.style.alignItems = 'center';
        modal.style.justifyContent = 'center';
        modal.style.background = 'rgba(0,0,0,0.7)';

        loginFormContainer.className = 'modal-content login-form-container';
        loginHeader.className = 'login-header';
        churchLogo.className = 'login-logo';
        emailFormGroup.className = 'form-group';
        passwordFormGroup.className = 'form-group';
        loginButton.className = 'btn-login';
        loginSpecialAttentionSection.className = 'demo-users';
        // ...existing code...

        loginTitle.textContent = 'Unit Management Tools';
        loginMessage.textContent = 'Sign In to Your Account';
        emailLabel.textContent = 'Email Address';
        passwordLabel.textContent = 'Password';
        loginButton.textContent = 'Sign In';
        loginSpecialAttentionSectionTitle.textContent = 'Demo Accounts:';
        loginSpecialAttentionSectionMessage.textContent = 'Use any email from the dropdown with password: demo';
        emailInput.placeholder = 'Enter or select your email';
        passwordInput.placeholder = 'Enter your password';

        churchLogo.alt = 'The Church of Jesus Christ of Latter-day Saints';
        churchLogo.src = 'images/church-logo.png';

        emailInput.type = 'text';
        passwordInput.type = 'password';
        loginButton.type = 'submit';

        emailInput.required = true;
        passwordInput.required = true;

        emailInput.name = 'email';
        passwordInput.name = 'password';
        loginForm.onsubmit = async (event) => {await this.HandleLogin(event);};

        emailLabel.for = 'email';
        passwordLabel.for = 'password';
        emailInput.setAttribute('list','emailList');

        emailFormGroup.appendChild(emailLabel);
        emailFormGroup.appendChild(emailInput);
        emailFormGroup.appendChild(emailDataList);
        passwordFormGroup.appendChild(passwordLabel);
        passwordFormGroup.appendChild(passwordInput);
        loginSpecialAttentionSection.appendChild(loginSpecialAttentionSectionTitle);
        loginSpecialAttentionSection.appendChild(loginSpecialAttentionSectionMessage);
        loginHeader.appendChild(churchLogo);
        loginHeader.appendChild(loginTitle);
        loginHeader.appendChild(loginMessage);
        loginForm.appendChild(emailFormGroup);
        loginForm.appendChild(passwordFormGroup);
        loginForm.appendChild(loginButton);
        loginForm.appendChild(loginSpecialAttentionSection);
        loginFormContainer.appendChild(loginHeader);
        loginFormContainer.appendChild(loginForm);
        modal.appendChild(loginFormContainer);
        // Always append as last child of body for highest stacking
        document.body.appendChild(modal);
        // Hide static modal if present
        const staticModal = document.getElementById('modal');
        if (staticModal) staticModal.style.display = 'none';
        // Debug log
        console.log('[Auth] Login modal created and appended to body.');
    }
    // Handle login form submission
    async HandleLogin(event) {
        //emailInputID, passwordInputID
        event.preventDefault();
        
        const email = document.getElementById(this.emailInputID).value;
        const password = document.getElementById(this.passwordInputID).value;
        
        // Find user by email
        const user = this.allUsers.find(u => u.email === email);
        if (!user) {
            alert('Email not found. Please check and try again.');
            return;
        }
        // Verify password against stored password in JSON
        if (password !== user.password) {
            alert('Invalid password. Please try again.');
            return;
        }
        // Store user session
        // Store all user fields in session
        this.currentUser = { ...user };
        sessionStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        document.getElementById(this.formID).reset();
        this.ShowDashboard();
    }
    // Populate email datalist with users from JSON
    PopulateEmailList(elementID) {
        const emailList = document.getElementById(elementID);
        if (!emailList || !this.allUsers) return;
        emailList.innerHTML = '';
        this.allUsers.forEach(user => {
            if ((user.memberactive || user.active) && user.email && typeof user.email === 'string' && user.email.trim() !== '') {
                const option = document.createElement('option');
                option.value = user.email;
                emailList.appendChild(option);
            }
        });
    }
    ShowLoginForm() {
        const loginModal = document.getElementById(this.destinationID);
        const mainContainer = document.getElementById(this.mainContainerID);
        if (loginModal) {
            loginModal.style.display = '';
            loginModal.classList.add('active');
            loginModal.style.zIndex = '9999';
            console.log('[DEBUG] ShowLoginForm: login modal should now be visible.', loginModal);
        } else {
            console.warn('[DEBUG] ShowLoginForm: login modal not found in DOM!');
        }
        if (mainContainer) {
            mainContainer.style.display = 'none';
            console.log('[DEBUG] ShowLoginForm: mainContainer hidden.');
        }
    }
    // Show dashboard
    async ShowDashboard() {
        let config = null;
        if(this.configuration) {
            config = this.configuration;
        } else if (Auth.Configuration) {
            config = await Auth.Configuration.Factory(this._storageObj);
        } else {
            throw new Error('Auth.ShowDashboard: Configuration class is not available.');
        }

        // Ensure members table is rendered for the current user
        if (typeof this.renderMembersTable === 'function') {
            this.renderMembersTable();
        }

        // Update the dashboard username/title display
        const userNameSpan = document.getElementById('userName');
        if (userNameSpan && this.currentUser) {
            // Prefer fullname with title if available, fallback to email
            let displayName = this.currentUser.fullname || this.currentUser.name || this.currentUser.email || '';
            // If callingTitles exist, append the first title
            if (Array.isArray(this.currentUser.callingTitles) && this.currentUser.callingTitles.length > 0) {
                displayName = `${this.currentUser.callingTitles[0]} ${displayName}`;
            }
            userNameSpan.textContent = displayName;
        }
        const loginModal = document.getElementById(this.destinationID);
        const mainContainer = document.getElementById(this.mainContainerID);
        const logoutButton = document.getElementById(this.logoutID);
        const roleSelector = document.getElementById(this.roleSelectorID);

        if (loginModal) {
            loginModal.classList.remove('active');
            loginModal.style.display = 'none';
        }
        if (mainContainer) mainContainer.style.display = 'block';
        if (logoutButton) logoutButton.addEventListener('click', () => { Auth.logout(); });
        // Get selected role from role selector
        let selectedRole = null;
        const roleSelectorEl = document.getElementById(this.roleSelectorID);
        if (roleSelectorEl && roleSelectorEl.value) {
            selectedRole = roleSelectorEl.value;
        } else if (this.currentUser && this.currentUser.activeRole) {
            selectedRole = this.currentUser.activeRole;
        }

        // Helper to control menu item and part visibility using only selected role
        // Use unique names to avoid redeclaration errors if ShowDashboard is called multiple times
        const _setMenuAccess = (menuClass, accessConfig) => {
            const menuItem = document.querySelector('.' + menuClass);
            if (!menuItem || !config || !config.access || !config.access[accessConfig] || !Array.isArray(config.access[accessConfig].page)) return;
            const allowedRoleIDs = config.access[accessConfig].page;
            // Get the user's role IDs (from currentUser)
            const userRoleIDs = (this.currentUser && Array.isArray(this.currentUser.roleIDs)) ? this.currentUser.roleIDs : [];
            // If a role is selected, try to map it to its ID (fallback to all userRoleIDs if not found)
            let selectedRoleID = null;
            if (selectedRole && this.currentUser && Array.isArray(this.currentUser.roleNames) && Array.isArray(this.currentUser.roleIDs)) {
                const idx = this.currentUser.roleNames.indexOf(selectedRole);
                if (idx !== -1) {
                    selectedRoleID = this.currentUser.roleIDs[idx];
                }
            }
            // Check access: if a role is selected, use its ID; otherwise, check all userRoleIDs
            let hasAccess = false;
            if (selectedRoleID !== null && allowedRoleIDs.includes(selectedRoleID)) {
                hasAccess = true;
            } else if (selectedRoleID === null && userRoleIDs.some(id => allowedRoleIDs.includes(id))) {
                hasAccess = true;
            }
            if (!hasAccess) {
                menuItem.classList.add('hide');
            } else {
                menuItem.classList.remove('hide');
            }
        };

        // Helper for parts (recursive for nested parts)
        const _setPartsAccess = (section, parts, prefix) => {
            if (!parts) return;
            // Get the user's role IDs (from currentUser)
            const userRoleIDs = (this.currentUser && Array.isArray(this.currentUser.roleIDs)) ? this.currentUser.roleIDs : [];
            // If a role is selected, try to map it to its ID (fallback to all userRoleIDs if not found)
            let selectedRoleID = null;
            if (selectedRole && this.currentUser && Array.isArray(this.currentUser.roleNames) && Array.isArray(this.currentUser.roleIDs)) {
                const idx = this.currentUser.roleNames.indexOf(selectedRole);
                if (idx !== -1) {
                    selectedRoleID = this.currentUser.roleIDs[idx];
                }
            }
            Object.entries(parts).forEach(([key, value]) => {
                if (Array.isArray(value)) {
                    // Direct access array
                    const partClass = `${section}-${key}`;
                    const partEls = document.querySelectorAll('.' + partClass);
                    let hasAccess = false;
                    if (selectedRoleID !== null && value.includes(selectedRoleID)) {
                        hasAccess = true;
                    } else if (selectedRoleID === null && userRoleIDs.some(id => value.includes(id))) {
                        hasAccess = true;
                    }
                    partEls.forEach(el => {
                        if (!hasAccess) {
                            el.classList.add('hide');
                        } else {
                            el.classList.remove('hide');
                        }
                    });
                } else if (typeof value === 'object' && value !== null) {
                    // Nested parts (e.g., QuickActions, Statistics)
                    if (value.parts) {
                        _setPartsAccess(`${section}-${key}`, value.parts, `${prefix}${key}-`);
                    }
                    // For objects with direct access arrays (e.g., card)
                    if (value.card && Array.isArray(value.card)) {
                        const partClass = `${section}-${key}`;
                        const partEls = document.querySelectorAll('.' + partClass);
                        let hasAccess = false;
                        if (selectedRoleID !== null && value.card.includes(selectedRoleID)) {
                            hasAccess = true;
                        } else if (selectedRoleID === null && userRoleIDs.some(id => value.card.includes(id))) {
                            hasAccess = true;
                        }
                        partEls.forEach(el => {
                            if (!hasAccess) {
                                el.classList.add('hide');
                            } else {
                                el.classList.remove('hide');
                            }
                        });
                    }
                    // For objects with string references (e.g., QuickActions)
                    Object.entries(value).forEach(([subKey, subValue]) => {
                        if (typeof subValue === 'string' && subValue.startsWith('access.')) {
                            // Resolve string reference
                            const refPath = subValue.replace('access.', '').split('.');
                            let ref = config.access;
                            for (const p of refPath) {
                                ref = ref && ref[p];
                            }
                            if (Array.isArray(ref)) {
                                const partClass = `${section}-${key}`;
                                const partEls = document.querySelectorAll('.' + partClass);
                                let hasAccess = false;
                                if (selectedRoleID !== null && ref.includes(selectedRoleID)) {
                                    hasAccess = true;
                                } else if (selectedRoleID === null && userRoleIDs.some(id => ref.includes(id))) {
                                    hasAccess = true;
                                }
                                partEls.forEach(el => {
                                    if (!hasAccess) {
                                        el.classList.add('hide');
                                    } else {
                                        el.classList.remove('hide');
                                    }
                                });
                            }
                        }
                    });
                }
            });
        };

        // Bind helpers to this (declare once, outside any conditional)
        // Use let to avoid redeclaration errors if this function is called multiple times
        // Use only instance properties to avoid redeclaration errors
        _setMenuAccess('dashboardmenuitem', 'dashboard');
        _setMenuAccess('membersmenuitem', 'members');
        _setMenuAccess('assignmentsmenuitem', 'assignments');
        _setMenuAccess('schedulingmenuitem', 'scheduling');
        _setMenuAccess('formsmenuitem', 'forms');
        _setMenuAccess('reportsmenuitem', 'reports');

        // Apply access control to all parts
        if (config && config.access) {
            Object.entries(config.access).forEach(([section, sectionObj]) => {
                if (sectionObj.parts) {
                    _setPartsAccess(section, sectionObj.parts, section + '-');
                }
            });
        }
    }

    // Load and configure role selector
    async LoadRoleSelector() {
        if (!this.currentUser) return;
        const roleSelector = document.getElementById(this.roleSelectorID);
        const selectedRoles = document.getElementById(this.selectedRolesID);
        const roleNames = this.currentUser.roleNames || [];
        const callingTitles = this.currentUser.callingTitles || [];
        const displayName = this.currentUser.fullname || '';
        const isMobile = window.innerWidth <= 600;
        // Determine if any roleName is different from the displayName/calling title
        const filteredRoleNames = roleNames.filter(roleName => {
            if (!roleName) return false;
            const normRole = roleName.trim().toLowerCase();
            const normDisplay = displayName.trim().toLowerCase();
            const matchesDisplay = normRole === normDisplay;
            const matchesAnyTitle = callingTitles.some(title => (title || '').trim().toLowerCase() === normRole);
            return !(matchesDisplay || matchesAnyTitle);
        });
        roleSelector.classList.remove('show');
        if (filteredRoleNames.length > 1) {
            if (roleSelector) {
                // Only show in mobile if multiple roles
                if (isMobile) {
                    roleSelector.classList.add('show-mobile');
                }
                roleSelector.style.display = 'block';
                while (roleSelector.options.length > 1) {
                    roleSelector.remove(1);
                }
                filteredRoleNames.forEach((roleName, idx) => {
                    const option = document.createElement('option');
                    option.value = roleName;
                    option.textContent = roleName;
                    roleSelector.appendChild(option);
                });
                // Set selector to user's activeRole if valid, else default to first
                let setValue = filteredRoleNames[0];
                if (this.currentUser && this.currentUser.activeRole && filteredRoleNames.includes(this.currentUser.activeRole)) {
                    setValue = this.currentUser.activeRole;
                }
                roleSelector.value = setValue;
                if (selectedRoles) selectedRoles.innerHTML = '';
                this.UpdateRole();
            }
        } else if (filteredRoleNames.length === 1) {
            if (roleSelector) {
                roleSelector.classList.remove('show');
            }
            if (selectedRoles) {
                selectedRoles.innerHTML = '';
                const roleName = filteredRoleNames[0] || '';
                if (roleName) {
                    const badge = document.createElement('span');
                    badge.className = `role-badge`;
                    badge.textContent = roleName;
                    selectedRoles.appendChild(badge);
                }
            }
        } else {
            // No roles to select, hide selector and badge
            if (roleSelector) {
                roleSelector.style.display = 'none';
                roleSelector.classList.remove('show-mobile');
            }
            if (selectedRoles) {
                selectedRoles.innerHTML = '';
            }
        }
    }
    // Role display update function
    UpdateRole() {
        const selector = document.getElementById(this.roleSelectorID);
        const selectedRoles = document.getElementById(this.selectedRolesID);
        if (!selector) return;
        const selectedValue = selector.value;
        // Clear previous roles
        if (selectedRoles) selectedRoles.innerHTML = '';
        if (selectedValue) {
            // Create and add the role badge using roleNames
            const badge = document.createElement('span');
            badge.className = `role-badge`;
            badge.textContent = selectedValue;
            // If selector has multiple roles, add 'hidden' class
            if (selector.options.length > 2) {
                badge.classList.add('hidden');
            }
            if (selectedRoles) selectedRoles.appendChild(badge);
            // Update current user's active role
            if (this.currentUser) {
                this.currentUser.activeRole = selectedValue;
            }
        }
    }
    // Get display name for role value
    GetRoleDisplayName(roleValue) {
        const roleMap = {
            'bishop': 'Bishop',
            'counselor-1': 'First Counselor',
            'counselor-2': 'Second Counselor',
            'secretary': 'Secretary',
            'asst-secretary': 'Assistant Secretary',
            'clerk': 'Clerk',
            'asst-clerk-membership': 'Assistant Clerk - Membership',
            'asst-clerk-finance': 'Assistant Clerk - Finance'
        };
        return roleMap[roleValue] || roleValue;
    }




    static get SESSION_KEY() { return 'currentUser'; }

    // Store user session in sessionStorage
    static setSession(user) {
        if (!user) return;
        sessionStorage.setItem(Auth.SESSION_KEY, JSON.stringify(user));
    }

    // Retrieve user session from sessionStorage
    static getSession() {
        const data = sessionStorage.getItem(Auth.SESSION_KEY);
        if (!data) return null;
        try {
            return JSON.parse(data);
        } catch (e) {
            console.error('Error parsing session data:', e);
            return null;
        }
    }

    // Remove user session from sessionStorage
    static clearSession() {
        sessionStorage.removeItem(Auth.SESSION_KEY);
    }

    // Check if a user is currently authenticated
    static isAuthenticated() {
        return !!Auth.getSession();
    }

    // Handle login (returns user object if successful, null otherwise)
    static login(email, password, users) {
        if (!users || !Array.isArray(users)) return null;
        const user = users.find(u => u.email === email);
        if (!user) return null;
        if (password !== user.password) return null;
        // Only store safe fields
        const sessionUser = {
            memberNumber: user.memberNumber,
            name: user.name,
            email: user.email,
            phone: user.phone,
            roles: user.roles,
            active: user.memberactive !== undefined ? user.memberactive : user.active
        };
        Auth.setSession(sessionUser);
        return sessionUser;
    }

    // Handle logout
    static logout() {
        Auth.clearSession();
        // Hide main container and show login modal if possible
        const mainContainer = document.getElementById('mainContainer');
        const loginModal = document.getElementById('loginModal');
        if (mainContainer) mainContainer.style.display = 'none';
        if (loginModal) {
            loginModal.style.display = '';
            loginModal.classList.add('active');
            loginModal.style.zIndex = '9999';
        }
    }
    // Render members table (moved from scripts/script.js)
    async renderMembersTable() {
        if (!this.membersInstance) {
            this.membersInstance = await Members.Factory({configuration: this.configuration, _storageObj:this._storageObj});
        }
        const members = await this.membersInstance.MembersDetails();
        window.allMembers = members;
        // Pagination logic
        let membersPerPage = window.membersPerPage || 10;
        let membersCurrentPage = window.membersCurrentPage || 1;
        const pageSizeSelect = document.getElementById('membersPageSize');
        if (pageSizeSelect) {
            const val = parseInt(pageSizeSelect.value, 10);
            if (!isNaN(val) && val > 0) membersPerPage = val;
        }
        const totalPages = Math.ceil(members.length / membersPerPage) || 1;
        if (membersCurrentPage > totalPages) membersCurrentPage = totalPages;
        const startIdx = (membersCurrentPage - 1) * membersPerPage;
        const endIdx = startIdx + membersPerPage;
        const pageMembers = members.slice(startIdx, endIdx);
        // Render table and pagination
        if (typeof window.renderMembersTable === 'function') {
            window.renderMembersTable(pageMembers);
        }
        if (typeof window.renderMembersPagination === 'function') {
            window.renderMembersPagination(membersCurrentPage, totalPages);
        }
        // Wire up page change handlers
        window.changeMembersPage = function(page) {
            window.membersCurrentPage = page;
            if (window.authInstance && typeof window.authInstance.renderMembersTable === 'function') {
                window.authInstance.renderMembersTable();
            }
        };
        window.changeMembersPageSize = function() {
            window.membersCurrentPage = 1;
            if (window.authInstance && typeof window.authInstance.renderMembersTable === 'function') {
                window.authInstance.renderMembersTable();
            }
        };
    }
}
