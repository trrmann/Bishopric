import './organization.ui.js';
import './configuration.ui.js';
import './callings.ui.js';
import './roles.ui.js';
import './users.ui.js';
import './testing.ui.js';
import './workflows.ui.js';
import './eventscheduletemplate.ui.js';
// --- Configuration Tab Logic ---
window.openEditConfiguration = function() {
    // Example: Show a modal with editable configuration fields
    window.openModal('Edit Configuration', `
        <div class="form-group">
            <label>Site Title</label>
            <input type="text" id="configSiteTitle" value="Unit Management Tools" required>
        </div>
        <div class="form-group">
            <label>Admin Email</label>
            <input type="email" id="configAdminEmail" value="admin@example.com" required>
        </div>
        <div class="form-group">
            <label>Enable Debug Mode</label>
            <input type="checkbox" id="configDebugMode">
        </div>
        <div class="form-group">
            <label>Theme</label>
            <select id="configTheme">
                <option value="light">Light</option>
                <option value="dark">Dark</option>
            </select>
        </div>
    `);
    // Optionally, pre-fill values from actual configuration
};

// Example: Render configuration table (placeholder, should be replaced with real config data)

import { renderConfigurationTable } from './configuration.ui.js';

// Render configuration table when Configuration section is shown
const originalShowSection = window.showSection;
// ...existing code...
window.showSection = function(sectionId) {
    originalShowSection(sectionId);
    if (sectionId === 'configuration') {
        renderConfigurationTable(window.Storage);
    }
    if (sectionId === 'callings') {
        renderCallingsFromClass(window.Storage);
    }
    if (sectionId === 'eventscheduletemplate') {
        import('./eventscheduletemplate.ui.js').then(mod => {
            if (mod && typeof mod.renderEventScheduleTemplateTable === 'function') {
                mod.renderEventScheduleTemplateTable();
            }
        });
    }
};

import { Storage } from "../modules/storage.mjs";
import { Auth } from "../modules/auth.mjs";
import { PublicKeyCrypto } from "../modules/crypto.mjs";
import { Site } from "../modules/site.mjs";

// --- Public/Private Key Encryption Usage Example ---
(async () => {
    // 1. Generate a key pair
    const keyPair = await PublicKeyCrypto.generateKeyPair();
    // 2. Export public and private keys as base64 strings (for storage or sharing)
    const publicKeyBase64 = await PublicKeyCrypto.exportKey(keyPair.publicKey, "public");
    const privateKeyBase64 = await PublicKeyCrypto.exportKey(keyPair.privateKey, "private");

    // 3. Encrypt a message with the public key
    const message = "Hello, this is a secret!";
    const encrypted = await PublicKeyCrypto.encrypt(keyPair.publicKey, message);

    // 4. Decrypt the message with the private key
    const decrypted = await PublicKeyCrypto.decrypt(keyPair.privateKey, encrypted);

    // 5. Import keys from base64 (if needed)
    const importedPublicKey = await PublicKeyCrypto.importKey(publicKeyBase64, "public");
    const importedPrivateKey = await PublicKeyCrypto.importKey(privateKeyBase64, "private");
    const decrypted2 = await PublicKeyCrypto.decrypt(importedPrivateKey, encrypted);
})();
// --- End Encryption Example ---

// Initialize Site and Auth logic
(async () => {
    window.membersCurrentPage = 1;
    window.membersPerPage = 10;
    // Instantiate Site (handles all UI logic)
    const store = await Storage.Factory();
    window.Storage = store; // Make store globally available for configuration rendering
    window.siteInstance = await Site.Factory(store);
    // Render members table on page load
    window.siteInstance.renderMembersTable();
    let authInstance = null;
    Auth.Factory(store).then(auth => {
        authInstance = auth;
        window.authInstance = auth;
        // Ensure role selector is correct on resize
        window.addEventListener('resize', () => {
            if (authInstance && typeof authInstance.LoadRoleSelector === 'function') {
                authInstance.LoadRoleSelector();
            }
        });
    });
})();

// Pagination rendering is now handled by Site class and Auth class as needed

// DEBUG: Render configuration table on page load to verify function is called
import { renderCallingsFromClass } from './callings.ui.js';
window.addEventListener('DOMContentLoaded', () => {
    if (window.Storage) {
        renderConfigurationTable(window.Storage);
        if (typeof window.renderOrganizationTable === 'function') {
            window.renderOrganizationTable(window.Storage);
        }
        if (typeof renderCallingsFromClass === 'function') {
            renderCallingsFromClass(window.Storage);
        }
    }
});


// (Removed duplicate window.showSection definition. The version with configuration logic and debug logs is now the only one in use.)

// Quick action handler
function quickAction(action) {
    alert(`Action: ${action}`);
    // Add quick action logic here
}

// Member search filter
function filterMembers() {
    const searchInput = document.getElementById('memberSearch');
    const searchTerm = searchInput.value.toLowerCase();
    const tableRows = document.querySelectorAll('#membersBody tr');
    
    tableRows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

// Assignment filter
function filterAssignments() {
    const filterValue = document.getElementById('filterAssignments').value;
    // Add assignment filtering logic here
}

// Schedule filter
function filterSchedule() {
    const filterValue = document.getElementById('scheduleFilter').value;
    // Add schedule filtering logic here
}

// Edit functions

window.editMember = function(id) {
    alert(`Edit member ${id}`);
};

window.deleteMember = function(id) {
    if (confirm('Are you sure you want to delete this member?')) {
        alert(`Member ${id} deleted`);
    }
};

window.editAssignment = function(id) {
    alert(`Edit assignment ${id}`);
};

window.markComplete = function(id) {
    alert(`Assignment ${id} marked complete`);
};

window.viewAssignment = function(id) {
    alert(`View assignment ${id}`);
};

window.openAddMember = function() {
    window.openModal('Add Member', `
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
    `);
};

window.openNewAssignment = function() {
    window.openModal('New Assignment', `
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
    `);
};

window.openScheduleEvent = function() {
    window.openModal('Schedule Event', `
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
    `);
};

window.openForm = function(formType) {
    const formTitles = {
        referral: 'Member Referral Form',
        homeTeaching: 'Home Teaching Report',
        welfare: 'Welfare Assistance Request',
        missionary: 'Missionary Recommendation',
        activity: 'Activity Planning Form',
        service: 'Service Project Log'
    };
    window.openModal(formTitles[formType] || 'Form', `
        <div class="form-group">
            <label>Form Type: ${formTitles[formType]}</label>
            <textarea placeholder="Enter form details..." rows="6"></textarea>
        </div>
        <div class="form-group">
            <label>Additional Notes</label>
            <textarea placeholder="Additional notes..." rows="3"></textarea>
        </div>
    `);
};

window.generateReport = function(reportType) {
    alert(`Generating ${reportType} report...`);
};

window.exportReport = function(reportType) {
    alert(`Exporting ${reportType} report...`);
};

window.editEvent = function(eventId) {
    alert(`Edit event ${eventId}`);
};

window.previousMonth = function() {
    alert('Previous month');
};

window.nextMonth = function() {
    alert('Next month');
};

window.openModal = function(title, content) {
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    modalTitle.textContent = title;
    modalBody.innerHTML = content;
    modal.classList.add('show');
};

window.closeModal = function() {
    const modal = document.getElementById('modal');
    modal.classList.remove('show');
};

// Close modal when clicking outside of it
window.onclick = function(event) {
    const modal = document.getElementById('modal');
    if (event.target === modal) {
        modal.classList.remove('show');
    }
};