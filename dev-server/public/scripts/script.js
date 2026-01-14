console.log("[DEBUG] VERY TOP OF SCRIPT.JS - Script execution started");
// Global error handler for debugging
window.addEventListener("error", function (event) {
  console.error(
    "[GLOBAL ERROR]",
    event.message,
    event.filename,
    event.lineno,
    event.colno,
    event.error,
  );
});
console.log("[DEBUG] scripts/script.js loaded and running.");
// --- Dashboard Quick Actions: Reset Password ---
document.addEventListener("DOMContentLoaded", () => {
  const resetPasswordBtn = document.getElementById("resetPasswordBtn");
  if (resetPasswordBtn) {
    resetPasswordBtn.onclick = () => {
      alert("Reset Password mock functionality triggered.");
    };
  }
});
import "./organization.ui.js";
import "./configuration.ui.js";
import "./callings.ui.js";
import "./roles.ui.js";
import "./users.ui.js";
import "./testing.ui.js";
import "./workflows.ui.js";
import "./eventscheduletemplate.ui.js";
// --- Configuration Tab Logic ---
window.openEditConfiguration = function () {
  // Example: Show a modal with editable configuration fields
  window.openModal(
    "Edit Configuration",
    `
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
// ...existing code...
            </select>
        </div>
    `,
  );
  // Optionally, pre-fill values from actual configuration
};

// Example: Render configuration table (placeholder, should be replaced with real config data)

import { renderConfigurationTable } from "./configuration.ui.js";

// Render configuration table when Configuration section is shown
const originalShowSection = window.showSection;
// ...existing code...
// ...existing code...
window.showSection = function (sectionId) {
  originalShowSection(sectionId);
  // Wait for window.Storage to be ready before rendering any section
  const waitForStorage = async (cb) => {
    if (
      window.Storage &&
      typeof window.Storage.Get === "function" &&
      typeof window.Storage.Set === "function"
    ) {
      cb();
    } else {
      setTimeout(() => waitForStorage(cb), 50);
    }
  };
  if (sectionId === "configuration") {
    waitForStorage(() =>
      renderConfigurationTable({ _storageObj: window.Storage }),
    );
  }
  if (sectionId === "callings") {
    waitForStorage(() =>
      renderCallingsFromClass({ _storageObj: window.Storage }),
    );
  }
  if (sectionId === "roles") {
    waitForStorage(() => renderRolesFromClass({ _storageObj: window.Storage }));
  }
  if (sectionId === "users") {
    waitForStorage(() => renderUsersFromClass({ _storageObj: window.Storage }));
  }
  if (sectionId === "eventscheduletemplate") {
    import("./eventscheduletemplate.ui.js").then((mod) => {
      if (mod && typeof mod.renderEventScheduleTemplateTable === "function") {
        mod.renderEventScheduleTemplateTable();
      }
    });
  }
};

import { Storage } from "../modules/storage.mjs";
import { Auth } from "../modules/auth.mjs";
console.log("[DEBUG] Auth module imported:", typeof Auth);
// Diagnostic: Print Auth and Factory right after import
console.log("[DEBUG][IMPORT] typeof Auth:", typeof Auth);
console.log("[DEBUG][IMPORT] Auth:", Auth);
console.log("[DEBUG][IMPORT] typeof Auth.Factory:", typeof Auth.Factory);
console.log("[DEBUG][IMPORT] Auth.Factory:", Auth.Factory);
import { PublicKeyCrypto } from "../modules/crypto.mjs";
import { Site } from "../modules/site.mjs";
// Global unhandledrejection handler
window.addEventListener("unhandledrejection", function (event) {
  console.error("[GLOBAL UNHANDLED PROMISE REJECTION]", event.reason);
});

// Unified initialization: Storage, Auth, and Site
if (typeof window !== "undefined") {
  (async () => {
    console.log("[DEBUG] >>> TOP OF MAIN ASYNC IIFE in script.js");
    console.log("[DEBUG] Unified App Initialization Started");
    try {
      window.Storage = await Storage.Factory();
      console.debug("[DEBUG] window.Storage set:", window.Storage);
      // Debug: Confirm code path after Storage.Factory
      console.log("[DEBUG] After Storage.Factory, before Auth.Factory");
    } catch (storageErr) {
      console.error("[DEBUG] ERROR during Storage.Factory:", storageErr);
      throw storageErr;
    }
    // Print Auth and Auth.Factory for diagnostics
    console.log("[DEBUG] typeof Auth:", typeof Auth);
    console.log("[DEBUG] Auth:", Auth);
    console.log("[DEBUG] typeof Auth.Factory:", typeof Auth.Factory);
    console.log("[DEBUG] Auth.Factory:", Auth.Factory);
    // Initialize Auth FIRST
    let authInstance = null;
    try {
      console.log("[DEBUG] >>> BEFORE await Auth.Factory(window.Storage)");
      try {
        await Auth.Factory(window.Storage)
          .then((auth) => {
            console.log("[DEBUG] >>> RESOLVED Auth.Factory(window.Storage)");
            authInstance = auth;
            window.authInstance = auth;
            // Force the login modal to always display for testing
            if (
              authInstance &&
              typeof authInstance.ShowLoginForm === "function"
            ) {
              console.log("[DEBUG] Forcing login modal display for testing.");
              authInstance.ShowLoginForm();
              // Extra debug: check if modal is in DOM and visible
              const modal = document.getElementById(authInstance.destinationID);
              if (!modal) {
                console.error(
                  "[DEBUG] Login modal NOT FOUND in DOM after ShowLoginForm!",
                );
              } else {
                console.log(
                  "[DEBUG] Login modal found in DOM after ShowLoginForm:",
                  modal,
                  "Computed display:",
                  getComputedStyle(modal).display,
                );
              }
            }
          })
          .catch((e) => {
            console.error(
              "[DEBUG] >>> REJECTED Auth.Factory(window.Storage):",
              e,
            );
          });
        console.log("[DEBUG] >>> AFTER await Auth.Factory(window.Storage)");
      } catch (innerErr) {
        console.error(
          "[DEBUG] >>> IMMEDIATE ERROR in Auth.Factory(window.Storage):",
          innerErr,
        );
      }
    } catch (err) {
      console.error("[DEBUG] Caught error in Auth IIFE:", err);
    }
    // --- Google Drive Sign-In: One-Time Prompt and Reuse ---
    window.GoogleDriveSignInPromise = null;
    if (
      window.Storage.GoogleDrive &&
      typeof window.Storage.GoogleDrive.isSignedIn === "function" &&
      typeof window.Storage.GoogleDrive.signIn === "function"
    ) {
      if (!window.Storage.GoogleDrive.isSignedIn()) {
        window.GoogleDriveSignInPromise = window.Storage.GoogleDrive.signIn();
      } else {
        window.GoogleDriveSignInPromise = Promise.resolve();
      }
    }
    // Usage: await window.GoogleDriveSignInPromise before any cloud operation
    if (
      !window.Storage.hasOwnProperty("Set") ||
      typeof window.Storage.Set !== "function" ||
      window.Storage.Set.constructor.name !== "AsyncFunction"
    ) {
      Object.defineProperty(window.Storage, "Set", {
        value: async function (key, value, ttlMs, isObject) {
          if (typeof this._setSync === "function")
            return this._setSync(key, value, ttlMs, isObject);
        },
        writable: false,
        enumerable: false,
        configurable: true,
      });
      console.debug("[RUNTIME PATCH] window.Storage.Set patched as async");
    }
    // Guarantee configuration._storageObj uses the patched window.Storage
    if (
      typeof window.configuration === "object" &&
      window.configuration !== null
    ) {
      window.configuration._storageObj = window.Storage;
      console.debug(
        "[RUNTIME PATCH] configuration._storageObj set to window.Storage",
      );
    }
    // --- Site Initialization (after Auth) ---
    window.membersCurrentPage = 1;
    window.membersPerPage = 10;
    window.siteInstance = await Site.Factory(window.Storage);
    if (typeof window.renderMembersFromClass === "function") {
      await window.renderMembersFromClass(window.Storage);
    } else if (
      window.siteInstance &&
      typeof window.siteInstance.renderMembersTable === "function"
    ) {
      window.siteInstance.renderMembersTable();
    }
  })();
}
// After window.Storage is set, guarantee async Get/Set as own properties
if (window.Storage) {
  // Patch Get if missing or not async
  if (
    !window.Storage.hasOwnProperty("Get") ||
    typeof window.Storage.Get !== "function" ||
    window.Storage.Get.constructor.name !== "AsyncFunction"
  ) {
    Object.defineProperty(window.Storage, "Get", {
      value: async function (key) {
        if (typeof this._getSync === "function") return this._getSync(key);
        return undefined;
      },
      writable: false,
      enumerable: false,
      configurable: true,
    });
    console.debug("[RUNTIME PATCH] window.Storage.Get patched as async");
  }
  // Patch Set if missing or not async
  if (
    !window.Storage.hasOwnProperty("Set") ||
    typeof window.Storage.Set !== "function" ||
    window.Storage.Set.constructor.name !== "AsyncFunction"
  ) {
    Object.defineProperty(window.Storage, "Set", {
      value: async function (key, value, ttlMs, isObject) {
        if (typeof this._setSync === "function")
          return this._setSync(key, value, ttlMs, isObject);
      },
      writable: false,
      enumerable: false,
      configurable: true,
    });
    console.debug("[RUNTIME PATCH] window.Storage.Set patched as async");
  }
}

// --- Public/Private Key Encryption Usage Example ---
(async () => {
  // 1. Generate a key pair
  const keyPair = await PublicKeyCrypto.generateKeyPair();
  // 2. Export public and private keys as base64 strings (for storage or sharing)
  const publicKeyBase64 = await PublicKeyCrypto.exportKey(
    keyPair.publicKey,
    "public",
  );
  console.log(publicKeyBase64);
  const privateKeyBase64 = await PublicKeyCrypto.exportKey(
    keyPair.privateKey,
    "private",
  );
  console.log(privateKeyBase64);
  // Guarantee configuration._storageObj uses the patched window.Storage and log its state
  if (
    typeof window.configuration === "object" &&
    window.configuration !== null
  ) {
    window.configuration._storageObj = window.Storage;
    console.debug(
      "[RUNTIME PATCH] configuration._storageObj set to window.Storage:",
      window.configuration._storageObj,
    );
    console.debug(
      "[RUNTIME PATCH] configuration._storageObj own Get:",
      window.configuration._storageObj.hasOwnProperty("Get"),
      typeof window.configuration._storageObj.Get,
      window.configuration._storageObj.Get?.constructor?.name,
    );
    console.debug(
      "[RUNTIME PATCH] configuration._storageObj own Set:",
      window.configuration._storageObj.hasOwnProperty("Set"),
      typeof window.configuration._storageObj.Set,
      window.configuration._storageObj.Set?.constructor?.name,
    );
  }

  // 3. Encrypt a message with the public key
  const message = "Hello, this is a secret!";
  const encrypted = await PublicKeyCrypto.encrypt(keyPair.publicKey, message);

  // 4. Decrypt the message with the private key
  const decrypted = await PublicKeyCrypto.decrypt(
    keyPair.privateKey,
    encrypted,
  );

  // 5. Import keys from base64 (if needed)
  const importedPublicKey = await PublicKeyCrypto.importKey(
    publicKeyBase64,
    "public",
  );
  const importedPrivateKey = await PublicKeyCrypto.importKey(
    privateKeyBase64,
    "private",
  );
  const decrypted2 = await PublicKeyCrypto.decrypt(
    importedPrivateKey,
    encrypted,
  );
})();
// --- End Encryption Example ---

// (Removed duplicate site initialization logic; now handled in unified IIFE above)

// Pagination rendering is now handled by Site class and Auth class as needed

// DEBUG: Render configuration table on page load to verify function is called
import { renderCallingsFromClass } from "./callings.ui.js";
import { renderRolesFromClass } from "./roles.ui.js";

window.addEventListener("DOMContentLoaded", () => {
  // Global check for window.Storage after DOMContentLoaded
  setTimeout(() => {
    console.debug("[DEBUG][DOMContentLoaded] window.Storage:", window.Storage);
    if (window.Storage) {
      console.debug(
        "[DEBUG][DOMContentLoaded] typeof window.Storage.Get:",
        typeof window.Storage.Get,
      );
      console.debug(
        "[DEBUG][DOMContentLoaded] typeof window.Storage.Set:",
        typeof window.Storage.Set,
      );
      console.debug(
        "[DEBUG][DOMContentLoaded] Own property names:",
        Object.getOwnPropertyNames(window.Storage),
      );
      // If Get/Set are missing, forcibly patch them to no-op async functions to prevent UI crash
      if (typeof window.Storage.Get !== "function") {
        window.Storage.Get = async () => undefined;
        console.warn(
          "[DEBUG][DOMContentLoaded] Patched missing window.Storage.Get with async no-op",
        );
      }
      if (typeof window.Storage.Set !== "function") {
        window.Storage.Set = async () => {};
        console.warn(
          "[DEBUG][DOMContentLoaded] Patched missing window.Storage.Set with async no-op",
        );
      }
    } else {
      console.error("[DEBUG][DOMContentLoaded] window.Storage is not set!");
    }
  }, 1000);
  const waitForStorage = async (cb) => {
    if (
      window.Storage &&
      typeof window.Storage.Get === "function" &&
      typeof window.Storage.Set === "function"
    ) {
      cb();
    } else {
      setTimeout(() => waitForStorage(cb), 50);
    }
  };
  waitForStorage(() => {
    renderConfigurationTable(window.Storage);
    if (typeof window.renderOrganizationTable === "function") {
      window.renderOrganizationTable({ _storageObj: window.Storage });
    }
    if (typeof renderCallingsFromClass === "function") {
      renderCallingsFromClass({ _storageObj: window.Storage });
    }
    if (typeof renderRolesFromClass === "function") {
      renderRolesFromClass({ _storageObj: window.Storage });
    }
    if (typeof renderUsersFromClass === "function") {
      renderUsersFromClass({ _storageObj: window.Storage });
    }
  });
});

// (Removed duplicate window.showSection definition. The version with configuration logic and debug logs is now the only one in use.)

// Quick action handler
function quickAction(action) {
  alert(`Action: ${action}`);
  // Add quick action logic here
}

// Member search filter
function filterMembers() {
  const searchInput = document.getElementById("memberSearch");
  const searchTerm = searchInput.value.toLowerCase();
  const tableRows = document.querySelectorAll("#membersBody tr");

  tableRows.forEach((row) => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(searchTerm) ? "" : "none";
  });
}

// Assignment filter
function filterAssignments() {
  const filterValue = document.getElementById("filterAssignments").value;
  // Add assignment filtering logic here
}

// Schedule filter
function filterSchedule() {
  const filterValue = document.getElementById("scheduleFilter").value;
  // Add schedule filtering logic here
}

// Edit functions

window.editMember = function (id) {
  alert(`Edit member ${id}`);
};

window.deleteMember = function (id) {
  if (confirm("Are you sure you want to delete this member?")) {
    alert(`Member ${id} deleted`);
  }
};

window.editAssignment = function (id) {
  alert(`Edit assignment ${id}`);
};

window.markComplete = function (id) {
  alert(`Assignment ${id} marked complete`);
};

window.viewAssignment = function (id) {
  alert(`View assignment ${id}`);
  const tryRenderUsers = () => {
    if (window.Storage && typeof renderUsersFromClass === "function") {
      // console.log('[DEBUG] Rendering users table from Users class...');
      renderUsersFromClass(window.Storage);
    } else {
      setTimeout(tryRenderUsers, 100);
    }
  };
};

window.openAddMember = function () {
  window.openModal(
    "Add Member",
    `
        <div class="form-group">
            <label>First Name</label>
            <input type="text" placeholder="Enter first name" required>
        </div>
        <div class="form-group">
        tryRenderUsers();
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
  );
};

window.openNewAssignment = function () {
  window.openModal(
    "New Assignment",
    `
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
  );
};

window.openScheduleEvent = function () {
  window.openModal(
    "Schedule Event",
    `
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
    `,
  );
};

window.openForm = function (formType) {
  const formTitles = {
    referral: "Member Referral Form",
    homeTeaching: "Home Teaching Report",
    welfare: "Welfare Assistance Request",
    missionary: "Missionary Recommendation",
    activity: "Activity Planning Form",
    service: "Service Project Log",
  };
  window.openModal(
    formTitles[formType] || "Form",
    `
        <div class="form-group">
            <label>Form Type: ${formTitles[formType]}</label>
            <textarea placeholder="Enter form details..." rows="6"></textarea>
        </div>
        <div class="form-group">
            <label>Additional Notes</label>
            <textarea placeholder="Additional notes..." rows="3"></textarea>
        </div>
    `,
  );
};

window.generateReport = function (reportType) {
  alert(`Generating ${reportType} report...`);
};

window.exportReport = function (reportType) {
  alert(`Exporting ${reportType} report...`);
};

window.editEvent = function (eventId) {
  alert(`Edit event ${eventId}`);
};

window.previousMonth = function () {
  alert("Previous month");
};

window.nextMonth = function () {
  alert("Next month");
};

window.openModal = function (title, content) {
  const modal = document.getElementById("modal");
  const modalTitle = document.getElementById("modalTitle");
  const modalBody = document.getElementById("modalBody");
  modalTitle.textContent = title;
  modalBody.innerHTML = content;
  modal.classList.add("show");
};

window.closeModal = function () {
  const modal = document.getElementById("modal");
  modal.classList.remove("show");
};

// Close modal when clicking outside of it
window.onclick = function (event) {
  const modal = document.getElementById("modal");
  if (event.target === modal) {
    modal.classList.remove("show");
  }
};
