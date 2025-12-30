// Toolbar button handlers
function handleImport() {
    alert('Import configuration (not yet implemented)');
}
function handleExport() {
    alert('Export configuration (not yet implemented)');
}
function handleRekey() {
    alert('Encryption rekey (not yet implemented)');
}
function handleCloudMigrate() {
    alert('Cloud store migration (not yet implemented)');
}
function handleAdd() {
    alert('Add configuration entry (not yet implemented)');
}
function handleSearch(e) {
    const value = e.target.value.toLowerCase();
    const rows = document.querySelectorAll('#configurationBody tr');
    rows.forEach(row => {
        // Only filter value rows (not headings)
        const keyCell = row.querySelector('td');
        if (!keyCell || row.children.length < 3) return;
        const key = keyCell.textContent.toLowerCase();
        const val = row.children[1].textContent.toLowerCase();
        row.style.display = key.includes(value) || val.includes(value) ? '' : 'none';
    });
}

// Configuration tab UI logic (modularized for testing)


import { Configuration } from '../modules/configuration.mjs';

/**
 * Fetches, flattens, logs, and renders configuration data in hierarchical row form with edit/delete buttons.
 * @param {object} storageObj - The storage object to use (optional, defaults to window.Storage)
 */

// Helper: Build a tree from flattened keys
function buildConfigTree(flat) {
    const root = {};
    for (const [key, value] of Object.entries(flat)) {
        const parts = key.split('.');
        let node = root;
        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            if (i === parts.length - 1) {
                node[part] = value;
            } else {
                if (!node[part]) node[part] = {};
                node = node[part];
            }
        }
    }
    return root;
}

// Helper: Recursively render the tree as table rows
function renderConfigTreeRows(node, tbody, path = [], depth = 0) {
    for (const key in node) {
        if (typeof node[key] === 'object' && node[key] !== null && !Array.isArray(node[key])) {
            // Heading/subheading row
            const tr = document.createElement('tr');
            tr.innerHTML = `<td colspan="3" style="font-weight:bold;padding-left:${depth * 20}px;background:#f6f6f6;">${key}</td>`;
            tbody.appendChild(tr);
            renderConfigTreeRows(node[key], tbody, path.concat(key), depth + 1);
        } else {
            // Value row
            const fullKey = path.concat(key).join('.');
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="padding-left:${depth * 20 + 10}px;">${key}</td>
                <td>${node[key]}</td>
                <td>
                    <button class="config-edit-btn" data-key="${fullKey}">Edit</button>
                    <button class="config-delete-btn" data-key="${fullKey}">Delete</button>
                </td>
            `;
            tbody.appendChild(tr);
        }
    }
}

export async function renderConfigurationTable(storageObj) {
    // Attach toolbar event handlers (idempotent)
    const importBtn = document.getElementById('configImportBtn');
    if (importBtn) importBtn.onclick = handleImport;
    const exportBtn = document.getElementById('configExportBtn');
    if (exportBtn) exportBtn.onclick = handleExport;
    const rekeyBtn = document.getElementById('configRekeyBtn');
    if (rekeyBtn) rekeyBtn.onclick = handleRekey;
    const migrateBtn = document.getElementById('configCloudMigrateBtn');
    if (migrateBtn) migrateBtn.onclick = handleCloudMigrate;
    const addBtn = document.getElementById('configAddBtn');
    if (addBtn) addBtn.onclick = handleAdd;
    const searchBar = document.getElementById('configurationSearch');
    if (searchBar && !searchBar._wired) {
        searchBar.addEventListener('input', handleSearch);
        searchBar._wired = true;
    }
    const tbody = document.getElementById('configurationBody');
    const table = tbody ? tbody.closest('table') : null;
    if (!tbody) return;
    tbody.innerHTML = '';
    // Add table header if not present
    if (table && !table.querySelector('thead')) {
        const thead = document.createElement('thead');
        thead.innerHTML = '<tr><th>Key</th><th>Value</th><th>Actions</th></tr>';
        table.insertBefore(thead, tbody);
    }
    try {
        // Use provided storage or global
        const store = storageObj || window.Storage;
        if (!store || typeof store.Get !== 'function') {
            throw new Error('No valid storage object with Get method provided.');
        }
        const configInstance = new Configuration(store);
        await configInstance.Fetch();
        if (!configInstance.HasConfig()) {
            tbody.innerHTML = '<tr><td colspan="3">No configuration data found.</td></tr>';
            return;
        }
        // Flatten config for hierarchical display
        const flat = configInstance.FlattenObject(configInstance.Config);
        // Log to console in hierarchical form
        // console.log('Hierarchical Configuration Data:', flat);
        // Build and render tree
        const tree = buildConfigTree(flat);
        renderConfigTreeRows(tree, tbody);
        // Attach button handlers (for demo, just log)
        tbody.querySelectorAll('.config-edit-btn').forEach(btn => {
            btn.onclick = e => {
                const key = e.target.getAttribute('data-key');
                alert('Edit: ' + key);
            };
        });
        tbody.querySelectorAll('.config-delete-btn').forEach(btn => {
            btn.onclick = e => {
                const key = e.target.getAttribute('data-key');
                alert('Delete: ' + key);
            };
        });
    } catch (err) {
        console.error('Error loading configuration:', err);
        tbody.innerHTML = '<tr><td colspan="3">Error loading configuration</td></tr>';
    }
}


export function openEditConfiguration() {
    alert('Edit Configuration modal would open here.');
}

window.renderConfigurationTable = renderConfigurationTable;
window.openEditConfiguration = openEditConfiguration;
