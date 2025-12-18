import { Members } from "../modules/members.mjs";
import { Users } from "../modules/users.mjs";
import { Configuration } from "./configuration.mjs";
// modules/auth.mjs
// Authentication management module for Bishopric Dashboard
export class Auth {
    constructor(configuration) {
        this.target = configuration.login.target;
        this.destinationID = configuration.login.destinationID;
        this.formID = configuration.login.formID;
        this.emailInputID = configuration.login.emailInputID;
        this.emailListID=configuration.login.emailListID;
        this.passwordInputID=configuration.login.passwordInputID;
        this.mainContainerID = configuration.main.container;
        this.roleSelectorID = configuration.main.roleSelector;
        this.selectedRolesID = configuration.main.selectedRoles;
        this.logoutID = configuration.main.logout;
        this.allUsers = [];
        this.currentUser = null;
    }
    static async Factory() {
        //const callings = await Callings.Factory();
        //console.log(callings);
        //console.log(callings.GetCallings());
        //const roles = await Roles.Factory();
        //console.log(roles);
        //console.log(roles.GetRoles());
        //const members = await Members.Factory();
        //console.log(members);
        //console.log(await members.GetMembers());
        const users = await Users.Factory();
        console.log(users);
        console.log(await users.GetUsers());
        console.log('data ready');

        const configuration = await Configuration.Factory();
        //console.log(configuration);
        const auth = new Auth(configuration.configuration);
        // Call this before any login modal logic        
        auth.CreateLoginModalWithSpecs();
        // Module-level initialization (runs after DOM is parsed because modules are deferred)
        (async function() {
            try {
                // Always reload users for login page
                const usersObj = await Users.Factory();
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
                            auth.ShowLoginForm();
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

        loginTitle.textContent = 'Bishopric Dashboard';
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
        //console.log('Populating email list with users:', this.allUsers);
        this.allUsers.forEach(user => {
            if (user.memberactive || user.active) {
                //console.log('Adding user to email list:', user);
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
    ShowDashboard() {
        const loginModal = document.getElementById(this.destinationID);
        const mainContainer = document.getElementById(this.mainContainerID);
        const logoutButton = document.getElementById(this.logoutID);
        const roleSelector = document.getElementById(this.roleSelectorID);
    
        if (loginModal) loginModal.classList.remove('active');
        if (mainContainer) mainContainer.style.display = 'block';
        if (logoutButton) logoutButton.addEventListener('click', () => { this.Logout(); });
        if (roleSelector) roleSelector.addEventListener('change', () => { this.UpdateRole(); });
    
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
        const confirmed = confirm('Are you sure you want to log out?');
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
                roleSelector.value = filteredRoleNames[0];
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
}
