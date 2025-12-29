
    import { Configuration } from "./configuration.mjs";
    import { Auth } from "../modules/auth.mjs";

// Static HTML templates for modal content (memory optimization)
const MODAL_TEMPLATES = {
    ADD_MEMBER: `
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
            <select required>
                <option value="">Select Role</option>
                <option value="member">Member</option>
                <option value="home-teacher">Home Teacher</option>
                <option value="relief-society">Relief Society</option>
                <option value="elders-quorum">Elders Quorum</option>
            </select>
        </div>
    `,
    NEW_ASSIGNMENT: `
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
    `,
    SCHEDULE_EVENT: `
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
    `
};

const FORM_TITLES = {
    referral: 'Member Referral Form',
    homeTeaching: 'Home Teaching Report',
    welfare: 'Welfare Assistance Request',
    missionary: 'Missionary Recommendation',
    activity: 'Activity Planning Form',
    service: 'Service Project Log'
};

export class Site {
    constructor() {
        this._siteConfig = null;
        this._toggleBtn = null;
        this._navBar = null;
        this._icon = null;
        // Cache modal DOM elements for performance
        this._modal = null;
        this._modalTitle = null;
        this._modalBody = null;
        // Debounce timer for resize handler
        this._resizeTimer = null;
    }

    // Debounce utility for resize events
    _debounce(func, wait) {
        return (...args) => {
            clearTimeout(this._resizeTimer);
            this._resizeTimer = setTimeout(() => func.apply(this, args), wait);
        };
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
        document.addEventListener('DOMContentLoaded', () => {
            this._toggleBtn = document.getElementById('userMenuToggle');
            this._navBar = document.querySelector('.navbar');
            this._icon = document.getElementById('userMenuToggleIcon');
            // Cache modal elements for performance
            this._modal = document.getElementById('modal');
            this._modalTitle = document.getElementById('modalTitle');
            this._modalBody = document.getElementById('modalBody');
            if (this._toggleBtn && this._navBar) {
                this._updateToggleVisibility();
                // Debounce resize handler to improve performance (150ms delay)
                window.addEventListener('resize', this._debounce(() => this._updateToggleVisibility(), 150));
                this._toggleBtn.addEventListener('click', () => this._toggleMenu());
            }
        });
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
            if (this._modal && event.target === this._modal) {
                this._modal.classList.remove('show');
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
        // Use cached elements if available, otherwise query DOM (fallback for safety)
        const modal = this._modal || document.getElementById('modal');
        const modalTitle = this._modalTitle || document.getElementById('modalTitle');
        const modalBody = this._modalBody || document.getElementById('modalBody');
        if (modalTitle) modalTitle.textContent = title;
        if (modalBody) modalBody.innerHTML = content;
        if (modal) modal.classList.add('show');
    }
    closeModal() {
        // Use cached element if available, otherwise query DOM (fallback for safety)
        const modal = this._modal || document.getElementById('modal');
        if (modal) modal.classList.remove('show');
    }
    editMember(id) { alert(`Edit member ${id}`); }
    deleteMember(id) { if (confirm('Are you sure you want to delete this member?')) { alert(`Member ${id} deleted`); } }
    editAssignment(id) { alert(`Edit assignment ${id}`); }
    markComplete(id) { alert(`Assignment ${id} marked complete`); }
    viewAssignment(id) { alert(`View assignment ${id}`); }
    openAddMember() { 
        this.openModal('Add Member', MODAL_TEMPLATES.ADD_MEMBER); 
    }
    openNewAssignment() { 
        this.openModal('New Assignment', MODAL_TEMPLATES.NEW_ASSIGNMENT); 
    }
    openScheduleEvent() { 
        this.openModal('Schedule Event', MODAL_TEMPLATES.SCHEDULE_EVENT); 
    }
    openForm(formType) {
        const title = FORM_TITLES[formType] || 'Form';
        this.openModal(title, `
            <div class="form-group">
                <label>Form Type: ${title}</label>
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
