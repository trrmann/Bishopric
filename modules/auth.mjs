import { Members } from "../modules/members.mjs";
import { Users } from "../modules/users.mjs";
import { Configuration } from "./configuration.mjs";
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
        //const callings = await Callings.Factory();
        //console.log(callings);
        //console.log(callings.CallingsDetails);
        //const roles = await Roles.Factory();
        //console.log(roles);
        //console.log(roles.GetRoles());
        //const members = await Members.Factory();
        //console.log(members);
        //console.log(await members.GetMembers());
        //const users = await Users.Factory();
        //console.log(users);
        //console.log(await users.GetUsers());
        //console.log('data ready');

        const configuration = await Configuration.Factory(storageObject);
        //console.log(configuration);
        const auth = new Auth(configuration);
        // Call this before any login modal logic        
        auth.CreateLoginModalWithSpecs();
        // Module-level initialization (runs after DOM is parsed because modules are deferred)
        (async function() {
            try {
                // Always reload users for login page
                const usersObj = await Users.Factory(configuration);
                auth.allUsers = await usersObj.GetUsers();
                auth.PopulateEmailList(auth.emailListID);
            } catch (error) {
                console.error('Error loading users:', error);
                auth.allUsers = [];
            }
            const loggedInUser = sessionStorage.getItem('currentUser');
            if (loggedInUser) {
                try {
                    auth.currentUser = JSON.parse(loggedInUser);
                    await auth.ShowDashboard();
                } catch (error) {
                    console.error('Error restoring session:', error);
                    auth.ShowLoginForm();
                }
            } else {
                auth.ShowLoginForm();
            }
        })();
        return auth;
    }
    // Dynamically create and insert the login modal HTML
    CreateLoginModalWithSpecs() {
        if (document.getElementById(this.destinationID)) return;
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
        loginFormContainer.className = 'modal-content login-form-container';
        loginHeader.className = 'login-header';
        churchLogo.className = 'login-logo';
        emailFormGroup.className = 'form-group';
        passwordFormGroup.className = 'form-group';
        loginButton.className = 'btn-login';
        loginSpecialAttentionSection.className = 'demo-users';

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
        if(this.target==='body:prepend') {
            document.body.prepend(modal);
        } else {
            document.getElementById(this.target).appendChild(modal);
        }
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
        if (loginModal) loginModal.classList.add('active');
        if (mainContainer) mainContainer.style.display = 'none';
    }
    // Show dashboard
    async ShowDashboard() {
        /*const config = {
            configuration: this.configuration,
            _storageObj: this._storageObj
        };/**/
        let config = null;
        if(this.configuration) {
            config = this.configuration;
        } else {
            config = await Configuration.Factory(this._storageObj);
        }

        // Ensure members table is rendered for the current user
        if (typeof this.renderMembersTable === 'function') {
            this.renderMembersTable();
        }
        const loginModal = document.getElementById(this.destinationID);
        const mainContainer = document.getElementById(this.mainContainerID);
        const logoutButton = document.getElementById(this.logoutID);
        const roleSelector = document.getElementById(this.roleSelectorID);

        if (loginModal) loginModal.classList.remove('active');
        if (mainContainer) mainContainer.style.display = 'block';
        if (logoutButton) logoutButton.addEventListener('click', () => { this.Logout(); });
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
            const config = this.configuration;
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
        Object.entries(config.configuration.access).forEach(([section, sectionObj]) => {
            if (sectionObj.parts) {
                _setPartsAccess(section, sectionObj.parts, section + '-');
            }
        });
        if (roleSelector && !roleSelector._copilotRoleHandlerSet) {
            // Remove previous event listeners to avoid stacking
            roleSelector.onchange = null;
            roleSelector.addEventListener('change', (e) => {
                // Set the selected role as activeRole on the user
                if (this.currentUser) {
                    this.currentUser.activeRole = roleSelector.value;
                }
                this.UpdateRole();
                this.ShowDashboard();
            });
            roleSelector._copilotRoleHandlerSet = true;
        }


        // All setMenuAccess and setPartsAccess logic is now handled by _setMenuAccess and _setPartsAccess above

        // Initialize dashboard
        if (this.currentUser) {
            this.InitializeDashboard();
        }
    }
    // Logout function
    Logout() {
        // Prevent multiple confirmations by using a static flag
        if (this._logoutConfirming) return;
        this._logoutConfirming = true;
        //const confirmed = confirm('Are you sure you want to log out?');
        const confirmed = true;
        this._logoutConfirming = false;
        if (confirmed) {
            // Clear all session and role info
            sessionStorage.removeItem('currentUser');
            sessionStorage.removeItem('activeRole');
            sessionStorage.removeItem('roles');
            sessionStorage.removeItem('userRoles');
            sessionStorage.removeItem('roleSelector');
            this.currentUser = null;
            // Also clear any role selector UI
            const roleSelector = document.getElementById(this.roleSelectorID);
            if (roleSelector) {
                roleSelector.style.display = 'none';
                roleSelector.classList.remove('show-mobile');
                while (roleSelector.options.length > 1) {
                    roleSelector.remove(1);
                }
            }
            const selectedRoles = document.getElementById(this.selectedRolesID);
            if (selectedRoles) selectedRoles.innerHTML = '';
            // Show login form
            this.ShowLoginForm();
            // Clear any form data
            const form = document.getElementById(this.formID);
            if (form) form.reset();
        }
    }
    // Initialize dashboard with user data
    InitializeDashboard() {
        this.UpdateUserDisplay();
        this.LoadRoleSelector();
    }
    // Update user display in header
    UpdateUserDisplay() {
                        // ...existing code...
                // ...existing code...
        if (!this.currentUser) return;
        const userName = document.getElementById('userName');
        if (userName) {
            // Show only the user's full name (no unit or stake info)
            userName.textContent = this.currentUser.fullname;
        }

        // Update the Management Tools label with the stake name before the unit name and type, with a comma if both are present
        const subtitleElem = document.querySelector('.subtitle');
        if (subtitleElem) {
            let stake = this.currentUser.stakeName || '';
            let unit = this.currentUser.unitName || '';
            let unitType = this.currentUser.unitType || '';
            if (unitType) {
                unitType = unitType.charAt(0).toUpperCase() + unitType.slice(1);
            }
            if (stake && unit) {
                subtitleElem.textContent = `${stake} Stake, ${unit} ${unitType} Management Tools`;
            } else if (unit) {
                subtitleElem.textContent = `${unit} ${unitType} Management Tools`;
            } else if (stake) {
                subtitleElem.textContent = `${stake} Stake Management Tools`;
            } else {
                subtitleElem.textContent = 'Management Tools';
            }
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
    }
    // Render members table (moved from scripts/script.js)
    async renderMembersTable() {
        if (!this.membersInstance) {
            this.membersInstance = await Members.Factory({configuration: this.configuration, _storageObj:this._storageObj});
        }
        const members = await this.membersInstance.GetMembers();
        let filteredMembers = members;
        let showUnitColumn = false;
        const user = this.currentUser;
        let userMember = null;
        if (user && user.memberNumber) {
            userMember = members.find(m => m.memberNumber === user.memberNumber);
        }
        // Determine calling level from member's callings
        let callingLevel = null;
        if (userMember && Array.isArray(userMember.levels) && userMember.levels.length > 0) {
            if (userMember.levels.includes('mission')) callingLevel = 'mission';
            else if (userMember.levels.includes('stake')) callingLevel = 'stake';
            else if (userMember.levels.includes('ward')) callingLevel = 'ward';
        }
        if (callingLevel === 'mission' && userMember && userMember.stakeUnitNumber) {
            filteredMembers = members.filter(m => m.stakeUnitNumber === userMember.stakeUnitNumber);
            showUnitColumn = true;
        } else if ((callingLevel === 'stake' || callingLevel === 'ward') && userMember && userMember.unitNumber) {
            filteredMembers = members.filter(
                m => m.unitNumber === userMember.unitNumber
            );
            showUnitColumn = false;
        } else {
            filteredMembers = members;
        }
        // Show/hide Unit column header (always show for mission-level users)
        const unitHeader = document.getElementById('unitHeader');
        if (unitHeader) {
            if (showUnitColumn) {
                unitHeader.style.display = '';
            } else {
                unitHeader.style.display = 'none';
            }
        }
        const tbody = document.getElementById('membersBody');
        if (tbody) tbody.innerHTML = '';
        // Update dashboard total members stat
        const dashboardTotalMembers = document.getElementById('dashboardTotalMembers');
        if (dashboardTotalMembers) {
            dashboardTotalMembers.textContent = filteredMembers.length;
        }
        // Pagination logic
        let membersPerPage = window.membersPerPage || 10;
        let membersCurrentPage = window.membersCurrentPage || 1;
        const pageSizeSelect = document.getElementById('membersPageSize');
        if (pageSizeSelect) {
            const val = parseInt(pageSizeSelect.value, 10);
            if (!isNaN(val) && val > 0) membersPerPage = val;
        }
        const totalPages = Math.ceil(filteredMembers.length / membersPerPage) || 1;
        if (membersCurrentPage > totalPages) membersCurrentPage = totalPages;
        const startIdx = (membersCurrentPage - 1) * membersPerPage;
        const endIdx = startIdx + membersPerPage;
        const pageMembers = filteredMembers.slice(startIdx, endIdx);
        window.changeMembersPageSize = function() {
            window.membersCurrentPage = 1;
            if (window.authInstance && typeof window.authInstance.renderMembersTable === 'function') {
                window.authInstance.renderMembersTable();
            }
        };
        if (typeof window.renderMembersPagination === 'function') {
            window.renderMembersPagination(membersCurrentPage, totalPages);
        }
        if (tbody) {
            pageMembers.forEach(async member => {
                const tr = document.createElement('tr');
                // Name (titleless)
                const nameTd = document.createElement('td');
                nameTd.textContent = member.titlelessFullname || member.fullname || '';
                tr.appendChild(nameTd);
                // Email
                const emailTd = document.createElement('td');
                emailTd.textContent = member.email || '';
                tr.appendChild(emailTd);
                // Phone
                const phoneTd = document.createElement('td');
                phoneTd.textContent = member.phone || '';
                tr.appendChild(phoneTd);
                // Unit (only for mission-level users)
                if (showUnitColumn) {
                    const unitTd = document.createElement('td');
                    let unitDisplay = '';
                    if (member.unitName) {
                        unitDisplay = member.unitName;
                        if (member.unitType) {
                            unitDisplay += ` ${member.unitType.charAt(0).toUpperCase() + member.unitType.slice(1)}`;
                        }
                    } else if (member.unitNumber) {
                        unitDisplay = member.unitNumber;
                    }
                    unitTd.textContent = unitDisplay;
                    tr.appendChild(unitTd);
                } else {
                    const unitTd = document.createElement('td');
                    unitTd.style.display = 'none';
                    tr.appendChild(unitTd);
                }
                // Calling(s)
                const callingTd = document.createElement('td');
                if (Array.isArray(member.callingNames) && member.callingNames.length > 0 && member.callingNames.some(n => n)) {
                    callingTd.textContent = member.callingNames.filter(Boolean).join(', ');
                } else {
                    callingTd.textContent = 'no calling';
                }
                tr.appendChild(callingTd);
                // Actions (only show if user has access)
                const actionsTd = document.createElement('td');
                let canEdit = false;
                let canRemove = false;
                // Check access config for current role
                const config = this.configuration;
                let selectedRoleID = null;
                if (this.currentUser && this.currentUser.activeRole && Array.isArray(this.currentUser.roleNames) && Array.isArray(this.currentUser.roleIDs)) {
                    const idx = this.currentUser.roleNames.indexOf(this.currentUser.activeRole);
                    if (idx !== -1) {
                        selectedRoleID = this.currentUser.roleIDs[idx];
                    }
                }
                // Fallback to all userRoleIDs if no selectedRoleID
                const userRoleIDs = (this.currentUser && Array.isArray(this.currentUser.roleIDs)) ? this.currentUser.roleIDs : [];
                // EditMember access
                const editAccess = config && config.access && config.access.members && config.access.members.parts && config.access.members.parts.EditMember;
                if (editAccess) {
                    if (selectedRoleID !== null && editAccess.includes(selectedRoleID)) canEdit = true;
                    else if (selectedRoleID === null && userRoleIDs.some(id => editAccess.includes(id))) canEdit = true;
                }
                // RemoveMember access
                const removeAccess = config && config.access && config.access.members && config.access.members.parts && config.access.members.parts.RemoveMember;
                if (removeAccess) {
                    if (selectedRoleID !== null && removeAccess.includes(selectedRoleID)) canRemove = true;
                    else if (selectedRoleID === null && userRoleIDs.some(id => removeAccess.includes(id))) canRemove = true;
                }
                if (canEdit) {
                    const editBtn = document.createElement('button');
                    editBtn.className = 'btn-small members-EditMember';
                    editBtn.textContent = 'Edit';
                    editBtn.onclick = () => window.editMember(member.memberNumber);
                    actionsTd.appendChild(editBtn);
                }
                if (canRemove) {
                    const deleteBtn = document.createElement('button');
                    deleteBtn.className = 'btn-small danger members-RemoveMember';
                    deleteBtn.textContent = 'Delete';
                    deleteBtn.onclick = () => window.deleteMember(member.memberNumber);
                    actionsTd.appendChild(deleteBtn);
                }
                tr.appendChild(actionsTd);
                tbody.appendChild(tr);
            });
        }
    }
}
