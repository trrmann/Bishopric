
import { Storage } from "../modules/storage.mjs";
import { Auth } from "../modules/auth.mjs";
import { PublicKeyCrypto } from "../modules/crypto.mjs";

// --- Public/Private Key Encryption Usage Example ---
(async () => {
    // 1. Generate a key pair
    const keyPair = await PublicKeyCrypto.generateKeyPair();
    // 2. Export public and private keys as base64 strings (for storage or sharing)
    const publicKeyBase64 = await PublicKeyCrypto.exportKey(keyPair.publicKey, "public");
    const privateKeyBase64 = await PublicKeyCrypto.exportKey(keyPair.privateKey, "private");
    console.log("Public Key (base64):", publicKeyBase64);
    console.log("Private Key (base64):", privateKeyBase64);

    // 3. Encrypt a message with the public key
    const message = "Hello, this is a secret!";
    const encrypted = await PublicKeyCrypto.encrypt(keyPair.publicKey, message);
    console.log("Encrypted (base64):", encrypted);

    // 4. Decrypt the message with the private key
    const decrypted = await PublicKeyCrypto.decrypt(keyPair.privateKey, encrypted);
    console.log("Decrypted message:", decrypted);

    // 5. Import keys from base64 (if needed)
    const importedPublicKey = await PublicKeyCrypto.importKey(publicKeyBase64, "public");
    const importedPrivateKey = await PublicKeyCrypto.importKey(privateKeyBase64, "private");
    const decrypted2 = await PublicKeyCrypto.decrypt(importedPrivateKey, encrypted);
    console.log("Decrypted with imported key:", decrypted2);
})();
// --- End Encryption Example ---

// Hamburger toggle for user menu in mobile
document.addEventListener('DOMContentLoaded', function() {
    const toggleBtn = document.getElementById('userMenuToggle');
    const navBar = document.querySelector('.navbar');
    if (toggleBtn && navBar) {
        const icon = document.getElementById('userMenuToggleIcon');
        // Show toggle only in mobile
        function updateToggleVisibility() {
            if (window.innerWidth <= 600) {
                toggleBtn.style.display = 'block';
                navBar.classList.remove('show');
                if (icon) {
                    icon.classList.remove('fa-xmark', 'fa-times');
                    icon.classList.add('fa-bars');
                }
            } else {
                toggleBtn.style.display = 'none';
                navBar.classList.add('show');
                if (icon) {
                    icon.classList.remove('fa-xmark', 'fa-times');
                    icon.classList.add('fa-bars');
                }
            }
        }
        updateToggleVisibility();
        window.addEventListener('resize', updateToggleVisibility);
        toggleBtn.addEventListener('click', function() {
            navBar.classList.toggle('show');
            if (icon) {
                if (navBar.classList.contains('show')) {
                    icon.classList.remove('fa-bars');
                    icon.classList.add('fa-xmark');
                } else {
                    icon.classList.remove('fa-xmark');
                    icon.classList.add('fa-bars');
                }
            }
        });
    }
});

// Pagination state
window.membersCurrentPage = 1;
window.membersPerPage = 10;

// Expose renderMembersTable globally for legacy calls, but delegate to authInstance
window.renderMembersTable = async function() {
    if (window.authInstance && typeof window.authInstance.renderMembersTable === 'function') {
        await window.authInstance.renderMembersTable();
    }
};

// Render pagination controls for members view
function renderMembersPagination(currentPage, totalPages) {
    const paginationDiv = document.getElementById('membersPagination');
    if (!paginationDiv) return;
    if (totalPages <= 1) {
        paginationDiv.innerHTML = '';
        return;
    }
    let html = '';
    html += `<button ${currentPage === 1 ? 'disabled' : ''} onclick="changeMembersPage(${currentPage - 1})">&laquo; Prev</button>`;
    for (let i = 1; i <= totalPages; i++) {
        html += `<button ${i === currentPage ? 'class=\'active\'' : ''} onclick="changeMembersPage(${i})">${i}</button>`;
    }
    html += `<button ${currentPage === totalPages ? 'disabled' : ''} onclick="changeMembersPage(${currentPage + 1})">Next &raquo;</button>`;
    paginationDiv.innerHTML = html;
}

// Change page and re-render members table
window.changeMembersPage = function(page) {
    membersCurrentPage = page;
    renderMembersTable();
};
    // Render members table on page load
    renderMembersTable();
    let authInstance = null;

    const store = await Storage.Factory();
    Auth.Factory(store).then(auth => {
        authInstance = auth;
        // Ensure role selector is correct on resize
        window.addEventListener('resize', () => {
            if (authInstance && typeof authInstance.LoadRoleSelector === 'function') {
                authInstance.LoadRoleSelector();
            }
        });
    });


// Section navigation
function showSection(sectionId) {
    // Hide all sections
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => section.classList.remove('active'));

    // Show the selected section
    const selectedSection = document.getElementById(sectionId);
    if (selectedSection) {
        selectedSection.classList.add('active');
    }

    // Update active nav button
    // Use document.activeElement to find the button if event is not available
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

// Expose showSection to global scope for HTML inline event handler
window.showSection = showSection;

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