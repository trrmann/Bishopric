
    import { Configuration } from "./configuration.mjs";
    import { Auth } from "../modules/auth.mjs";

export class Site {
    constructor() {
        this._siteConfig = null;
        this._toggleBtn = null;
        this._navBar = null;
        this._icon = null;
    }
        _createModalDiv() {
            if (document.getElementById('modal')) return;
            const modal = document.createElement('div');
            modal.id = 'modal';
            modal.className = 'modal';
            const modalContent = document.createElement('div');
            modalContent.className = 'modal-content';
            const closeSpan = document.createElement('span');
            closeSpan.className = 'close';
            closeSpan.innerHTML = '&times;';
            closeSpan.onclick = () => { window.closeModal(); };
            const modalTitle = document.createElement('h3');
            modalTitle.id = 'modalTitle';
            modalTitle.textContent = 'Modal Title';
            const modalForm = document.createElement('form');
            modalForm.id = 'modalForm';
            const modalBody = document.createElement('div');
            modalBody.id = 'modalBody';
            const modalActions = document.createElement('div');
            modalActions.className = 'modal-actions';
            const saveBtn = document.createElement('button');
            saveBtn.type = 'submit';
            saveBtn.className = 'btn-primary';
            saveBtn.textContent = 'Save';
            const cancelBtn = document.createElement('button');
            cancelBtn.type = 'button';
            cancelBtn.className = 'btn-secondary';
            cancelBtn.textContent = 'Cancel';
            cancelBtn.onclick = () => { window.closeModal(); };
            modalActions.appendChild(saveBtn);
            modalActions.appendChild(cancelBtn);
            modalForm.appendChild(modalBody);
            modalForm.appendChild(modalActions);
            modalContent.appendChild(closeSpan);
            modalContent.appendChild(modalTitle);
            modalContent.appendChild(modalForm);
            modal.appendChild(modalContent);
            document.body.appendChild(modal);
        }

    static async Factory(storageObject) {
        const site = new Site();
        // Use Configuration.Fetch to leverage hierarchical caching
        const configInstance = await Configuration.Factory(storageObject);
        await configInstance.Fetch();
        site._siteConfig = configInstance.configuration;
        site._setupEventListeners();
        return site;
    }

    _setupEventListeners() {
        const setup = () => {
            this._toggleBtn = document.getElementById('userMenuToggle');
            this._navBar = document.querySelector('.navbar');
            this._icon = document.getElementById('userMenuToggleIcon');
            if (this._toggleBtn && this._navBar) {
                this._updateToggleVisibility();
                window.addEventListener('resize', () => this._updateToggleVisibility());
                this._toggleBtn.addEventListener('click', () => this._toggleMenu());
            }
        };
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', setup);
        } else {
            setup();
        }
        // Section navigation
        window.showSection = this.showSection.bind(this);
        // Pagination
        window.changeMembersPage = (page) => {
            window.membersCurrentPage = page;
            this.renderMembersTable();
        };
        // Filters
        window.filterMembers = this.filterMembers.bind(this);
        window.filterAssignments = this.filterAssignments.bind(this);
        window.filterSchedule = this.filterSchedule.bind(this);
        // Quick actions
        window.quickAction = this.quickAction.bind(this);
        // Modal and edit functions
        window.openModal = this.openModal.bind(this);
        window.closeModal = this.closeModal.bind(this);
        window.onclick = (event) => {
            const modal = document.getElementById('modal');
            if (event.target === modal) {
                modal.classList.remove('show');
            }
        };
        // Edit and CRUD
        window.editMember = this.editMember.bind(this);
        window.deleteMember = this.deleteMember.bind(this);
        window.editAssignment = this.editAssignment.bind(this);
        window.markComplete = this.markComplete.bind(this);
        window.viewAssignment = this.viewAssignment.bind(this);
        window.openAddMember = this.openAddMember.bind(this);
        window.openNewAssignment = this.openNewAssignment.bind(this);
        window.openScheduleEvent = this.openScheduleEvent.bind(this);
        window.openForm = this.openForm.bind(this);
        window.generateReport = this.generateReport.bind(this);
        window.exportReport = this.exportReport.bind(this);
        window.editEvent = this.editEvent.bind(this);
        window.previousMonth = this.previousMonth.bind(this);
        window.nextMonth = this.nextMonth.bind(this);
    }

    _toggleMenu() {
        this._navBar.classList.toggle('show');
        if (this._icon) {
            if (this._navBar.classList.contains('show')) {
                this._icon.classList.remove('fa-bars');
                this._icon.classList.add('fa-xmark');
            } else {
                this._icon.classList.remove('fa-xmark');
                this._icon.classList.add('fa-bars');
            }
        }
    }

    _updateToggleVisibility() {
        const isMobile = window.innerWidth <= 600;
        if (this._toggleBtn && this._navBar) {
            if (isMobile) {
                this._toggleBtn.style.display = 'block';
                this._navBar.classList.remove('show');
                if (this._icon) {
                    this._icon.classList.remove('fa-xmark', 'fa-times');
                    this._icon.classList.add('fa-bars');
                }
            } else {
                this._toggleBtn.style.display = 'none';
                this._navBar.classList.add('show');
                if (this._icon) {
                    this._icon.classList.remove('fa-xmark', 'fa-times');
                    this._icon.classList.add('fa-bars');
                }
            }
        }
    }

    showSection(sectionId) {
        const sections = document.querySelectorAll('.section');
        sections.forEach(section => section.classList.remove('active'));
        const selectedSection = document.getElementById(sectionId);
        if (selectedSection) {
            selectedSection.classList.add('active');
        }
        let navBtn = null;
        if (window.event && window.event.target) {
            navBtn = window.event.target.closest('.nav-btn');
        } else if (document.activeElement && document.activeElement.classList.contains('nav-btn')) {
            navBtn = document.activeElement;
        }
        if (navBtn) {
            const navButtons = document.querySelectorAll('.nav-btn');
            navButtons.forEach(btn => btn.classList.remove('active'));
            navBtn.classList.add('active');
        }
    }

    quickAction(action) {
        alert(`Action: ${action}`);
    }

    filterMembers() {
        const searchInput = document.getElementById('memberSearch');
        const searchTerm = searchInput.value.toLowerCase();
        const tableRows = document.querySelectorAll('#membersBody tr');
        tableRows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(searchTerm) ? '' : 'none';
        });
    }

    filterAssignments() {
        // Add assignment filtering logic here
    }

    filterSchedule() {
        // Add schedule filtering logic here
    }

    renderMembersTable() {
        if (window.authInstance && typeof window.authInstance.renderMembersTable === 'function') {
            window.authInstance.renderMembersTable();
        }
    }

    // --- Modal and CRUD methods ---
    openModal(title, content) {
        const modal = document.getElementById('modal');
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');
        modalTitle.textContent = title;
        modalBody.innerHTML = content;
        modal.classList.add('show');
    }
    closeModal() {
        const modal = document.getElementById('modal');
        modal.classList.remove('show');
    }
    editMember(id) { alert(`Edit member ${id}`); }
    deleteMember(id) { if (confirm('Are you sure you want to delete this member?')) { alert(`Member ${id} deleted`); } }
    editAssignment(id) { alert(`Edit assignment ${id}`); }
    markComplete(id) { alert(`Assignment ${id} marked complete`); }
    viewAssignment(id) { alert(`View assignment ${id}`); }
    /**
     * Dynamically generates the role selector options from all available roles (including additional roles).
     * @param {object} usersInstance - An instance of Users class.
     */
    async openAddMember(usersInstance) {
        // Gather all available roles (IDs and names) from usersInstance
        let roles = [];
        if (usersInstance && usersInstance.members && usersInstance.members.Roles && Array.isArray(usersInstance.members.Roles.roles)) {
            roles = usersInstance.members.Roles.roles.map(r => ({ id: r.id, name: r.name }));
        }
        // Add any additional roles not already present
        if (usersInstance && typeof usersInstance.AdditionalRoles === 'object') {
            const additionalRoleIDs = new Set();
            usersInstance.AdditionalRoles.forEach(({ additionalRoles }) => {
                additionalRoles.forEach(roleId => additionalRoleIDs.add(roleId));
            });
            // Only add if not already present
            additionalRoleIDs.forEach(roleId => {
                if (!roles.some(r => r.id === roleId)) {
                    // Try to get name from roles, fallback to ID
                    let name = roleId;
                    if (usersInstance.members && usersInstance.members.Roles && Array.isArray(usersInstance.members.Roles.roles)) {
                        const found = usersInstance.members.Roles.roles.find(r => r.id === roleId);
                        if (found && found.name) name = found.name;
                    }
                    roles.push({ id: roleId, name });
                }
            });
        }
        // Sort roles alphabetically by name
        roles.sort((a, b) => a.name.localeCompare(b.name));
        // Build options HTML
        const optionsHtml = [`<option value="">Select Role</option>`]
            .concat(roles.map(r => `<option value="${r.id}">${r.name}</option>`)).join('');
        this.openModal('Add Member', `
            <div class="form-group">
                <label>First Name</label>
                <input type="text" placeholder="Enter first name" required>
            </div>
            <div class="form-group">
                <label>Last Name</label>
                <input type="text" placeholder="Enter last name" required>
            </div>
            <div class="form-group">
                <label>Email</label>
                <input type="email" placeholder="Enter email" required>
            </div>
            <div class="form-group">
                <label>Phone</label>
                <input type="tel" placeholder="Enter phone number" required>
            </div>
            <div class="form-group">
                <label>Role</label>
                <select required>${optionsHtml}</select>
            </div>
        `);
    }
    openNewAssignment() { this.openModal('New Assignment', `
        <div class="form-group">
            <label>Assignment Title</label>
            <input type="text" placeholder="Enter assignment title" required>
        </div>
        <div class="form-group">
            <label>Description</label>
            <textarea placeholder="Enter assignment description" rows="4"></textarea>
        </div>
        <div class="form-group">
            <label>Assign To</label>
            <select required>
                <option value="">Select Member</option>
                <option value="james">James Johnson</option>
                <option value="sarah">Sarah Williams</option>
                <option value="michael">Michael Brown</option>
            </select>
        </div>
        <div class="form-group">
            <label>Due Date</label>
            <input type="date" required>
        </div>
    `); }
    openScheduleEvent() { this.openModal('Schedule Event', `
        <div class="form-group">
            <label>Event Name</label>
            <input type="text" placeholder="Enter event name" required>
        </div>
        <div class="form-group">
            <label>Event Date</label>
            <input type="date" required>
        </div>
        <div class="form-group">
            <label>Start Time</label>
            <input type="time" required>
        </div>
        <div class="form-group">
            <label>End Time</label>
            <input type="time" required>
        </div>
        <div class="form-group">
            <label>Location</label>
            <input type="text" placeholder="Enter location" required>
        </div>
    `); }
    openForm(formType) {
        const formTitles = {
            referral: 'Member Referral Form',
            homeTeaching: 'Home Teaching Report',
            welfare: 'Welfare Assistance Request',
            missionary: 'Missionary Recommendation',
            activity: 'Activity Planning Form',
            service: 'Service Project Log'
        };
        this.openModal(formTitles[formType] || 'Form', `
            <div class="form-group">
                <label>Form Type: ${formTitles[formType]}</label>
                <textarea placeholder="Enter form details..." rows="6"></textarea>
            </div>
            <div class="form-group">
                <label>Additional Notes</label>
                <textarea placeholder="Additional notes..." rows="3"></textarea>
            </div>
        `);
    }
    generateReport(reportType) { alert(`Generating ${reportType} report...`); }
    exportReport(reportType) { alert(`Exporting ${reportType} report...`); }
    editEvent(eventId) { alert(`Edit event ${eventId}`); }
    previousMonth() { alert('Previous month'); }
    nextMonth() { alert('Next month'); }

    // _buildConfigFromConfiguration is now obsolete due to direct use of Configuration.Fetch in Factory
}



// Edit functions

window.editMember = function(id) {
    alert(`Edit member ${id}`);
};

window.deleteMember = function(id) {
    if (confirm('Are you sure you want to delete this member?')) {
        alert(`Member ${id} deleted`);
    }
}
