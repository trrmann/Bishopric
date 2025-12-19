// Sorting state
let membersSortColumn = 'name';
let membersSortAsc = true;

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

import { Auth } from "../modules/auth.mjs";
import { Members } from "../modules/members.mjs";
let membersInstance = null;
// Pagination state
let membersCurrentPage = 1;
let membersPerPage = 10;
// Dynamically render members table
async function renderMembersTable() {
    // Determine if any actions are present for the current page
    // Always render Actions column


    if (!membersInstance) {
        membersInstance = await Members.Factory();
    }
    const members = await membersInstance.GetMembers();
    // console.log('Members loaded for table:', members);
    let filteredMembers = members;
    // Sorting logic
    if (membersSortColumn) {
        filteredMembers = [...filteredMembers].sort((a, b) => {
            let aVal, bVal;
            switch (membersSortColumn) {
                case 'name':
                    aVal = (a.paternalLastName || '').toLowerCase() + (a.firstName || '').toLowerCase();
                    bVal = (b.paternalLastName || '').toLowerCase() + (b.firstName || '').toLowerCase();
                    break;
                case 'email':
                    aVal = (a.email || '').toLowerCase();
                    bVal = (b.email || '').toLowerCase();
                    break;
                case 'phone':
                    aVal = (a.phone || '');
                    bVal = (b.phone || '');
                    break;
                case 'calling': {
                    // Custom sort: Counselors in numeric order, assistants after primary, then alpha
                    function callingSortKey(calling) {
                        if (!calling) return 'zzz';
                        let key = calling.toLowerCase();
                        // Numeric order for counselors
                        if (/first counselor/.test(key)) return '1-counselor';
                        if (/second counselor/.test(key)) return '2-counselor';
                        if (/third counselor/.test(key)) return '3-counselor';
                        // Place assistants after primary for clerk/secretary
                        if (/^clerk$/.test(key)) return '4-clerk';
                        if (/assistant clerk/.test(key)) return '5-clerk-assistant';
                        if (/^secretary$/.test(key)) return '4-secretary';
                        if (/assistant secretary/.test(key)) return '5-secretary-assistant';
                        // Place other assistants after primary
                        if (/assistant/.test(key)) return 'z-' + key;
                        return 'm-' + key;
                    }
                    const aCallings = Array.isArray(a.callingNames) ? a.callingNames.filter(Boolean) : [];
                    const bCallings = Array.isArray(b.callingNames) ? b.callingNames.filter(Boolean) : [];
                    const aNoCalling = aCallings.length === 0;
                    const bNoCalling = bCallings.length === 0;
                    if (aNoCalling && !bNoCalling) return membersSortAsc ? 1 : -1;
                    if (!aNoCalling && bNoCalling) return membersSortAsc ? -1 : 1;
                    if (aNoCalling && bNoCalling) return 0;
                    // Sort callings for each member by custom key, then use the first
                    const aSorted = [...aCallings].sort((x, y) => callingSortKey(x).localeCompare(callingSortKey(y)));
                    const bSorted = [...bCallings].sort((x, y) => callingSortKey(x).localeCompare(callingSortKey(y)));
                    aVal = aSorted[0] ? callingSortKey(aSorted[0]) : '';
                    bVal = bSorted[0] ? callingSortKey(bSorted[0]) : '';
                    break;
                }
                default:
                    aVal = '';
                    bVal = '';
            }
            if (aVal < bVal) return membersSortAsc ? -1 : 1;
            if (aVal > bVal) return membersSortAsc ? 1 : -1;
            return 0;
        });
    }
    let showUnitColumn = false;
    if (authInstance && authInstance.currentUser && authInstance.currentUser.activeRole) {
        const user = authInstance.currentUser;
        let userMember = null;
        if (user.memberNumber) {
            userMember = members.find(m => m.memberNumber === user.memberNumber);
        }
        // Determine role level (mission, stake, ward)
        // For this example, assume user.activeRoleLevel is set, otherwise fallback to role name check
        let roleLevel = user.activeRoleLevel;
        if (!roleLevel && user.activeRole) {
            const roleName = user.activeRole.toLowerCase();
            if (roleName.includes('mission')) roleLevel = 'mission';
            else if (roleName.includes('stake')) roleLevel = 'stake';
            else roleLevel = 'ward';
        }
        if (roleLevel === 'mission' && userMember && userMember.stakeUnitNumber) {
            // Mission-level: show all members in user's stake
            filteredMembers = members.filter(m => m.stakeUnitNumber === userMember.stakeUnitNumber);
            showUnitColumn = true;
        } else if ((roleLevel === 'stake' || roleLevel === 'ward') && userMember && userMember.unitNumber) {
            // Stake/ward-level: show only members in user's ward
            filteredMembers = members.filter(m => m.unitNumber === userMember.unitNumber);
        }
    }
    // Show/hide Unit column header
    const unitHeader = document.getElementById('unitHeader');
    if (unitHeader) unitHeader.style.display = showUnitColumn ? '' : 'none';
    // Update sort icons
    const sortColumns = ['name', 'email', 'phone', 'calling'];
    sortColumns.forEach(col => {
        const icon = document.getElementById(col + 'SortIcon');
        if (icon) {
            if (membersSortColumn === col) {
                icon.textContent = membersSortAsc ? '▲' : '▼';
            } else {
                icon.textContent = '';
            }
        }
    });
    // Sorting event listeners
    document.addEventListener('DOMContentLoaded', function() {
        const sortMap = {
            nameHeader: 'name',
            emailHeader: 'email',
            phoneHeader: 'phone',
            callingHeader: 'calling'
        };
        Object.keys(sortMap).forEach(headerId => {
            const el = document.getElementById(headerId);
            if (el) {
                el.addEventListener('click', function() {
                    if (membersSortColumn === sortMap[headerId]) {
                        membersSortAsc = !membersSortAsc;
                    } else {
                        membersSortColumn = sortMap[headerId];
                        membersSortAsc = true;
                    }
                    renderMembersTable();
                });
            }
        });
    });
    const tbody = document.getElementById('membersBody');
    tbody.innerHTML = '';
    // Update dashboard total members stat
    const dashboardTotalMembers = document.getElementById('dashboardTotalMembers');
    if (dashboardTotalMembers) {
        dashboardTotalMembers.textContent = filteredMembers.length;
    }

    // Pagination logic
    // Get page size from selector if present
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
// Change page size and reset to first page
window.changeMembersPageSize = function() {
    membersCurrentPage = 1;
    renderMembersTable();
}


    // Render pagination controls
    renderMembersPagination(membersCurrentPage, totalPages);

    pageMembers.forEach(member => {
        const tr = document.createElement('tr');
        // Name
        const nameTd = document.createElement('td');
        nameTd.textContent = member.fullname || '';
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
            unitTd.textContent = member.unitName || member.unitNumber || '';
            tr.appendChild(unitTd);
        } else {
            // If not showing unit, add a hidden cell for alignment
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
        // Actions
        const actionsTd = document.createElement('td');
        const editBtn = document.createElement('button');
        editBtn.className = 'btn-small members-EditMember';
        editBtn.textContent = 'Edit';
        editBtn.onclick = () => editMember(member.memberNumber);
        actionsTd.appendChild(editBtn);
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn-small danger members-RemoveMember';
        deleteBtn.textContent = 'Delete';
        deleteBtn.onclick = () => deleteMember(member.memberNumber);
        actionsTd.appendChild(deleteBtn);
        tr.appendChild(actionsTd);
        tbody.appendChild(tr);
    });
}

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

    Auth.Factory().then(auth => {
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
function editMember(id) {
    alert(`Edit member ${id}`);
}

function deleteMember(id) {
    if (confirm('Are you sure you want to delete this member?')) {
        alert(`Member ${id} deleted`);
    }
}

function editAssignment(id) {
    alert(`Edit assignment ${id}`);
}

function markComplete(id) {
    alert(`Assignment ${id} marked complete`);
}

function viewAssignment(id) {
    alert(`View assignment ${id}`);
}

function openAddMember() {
    openModal('Add Member', `
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
}

function openNewAssignment() {
    openModal('New Assignment', `
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
}

function openScheduleEvent() {
    openModal('Schedule Event', `
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
}

function openForm(formType) {
    const formTitles = {
        referral: 'Member Referral Form',
        homeTeaching: 'Home Teaching Report',
        welfare: 'Welfare Assistance Request',
        missionary: 'Missionary Recommendation',
        activity: 'Activity Planning Form',
        service: 'Service Project Log'
    };
    
    openModal(formTitles[formType] || 'Form', `
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

function generateReport(reportType) {
    alert(`Generating ${reportType} report...`);
}

function exportReport(reportType) {
    alert(`Exporting ${reportType} report...`);
}

function editEvent(eventId) {
    alert(`Edit event ${eventId}`);
}

function previousMonth() {
    alert('Previous month');
}

function nextMonth() {
    alert('Next month');
}

function openModal(title, content) {
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    modalTitle.textContent = title;
    modalBody.innerHTML = content;
    modal.classList.add('show');
}

function closeModal() {
    const modal = document.getElementById('modal');
    modal.classList.remove('show');
}

// Close modal when clicking outside of it
window.onclick = function(event) {
    const modal = document.getElementById('modal');
    if (event.target === modal) {
        modal.classList.remove('show');
    }
}