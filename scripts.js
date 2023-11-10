// Function to update local storage with the current list of applications
function updateLocalStorage() {
    const tableBody = document.getElementById('applications-table-body');
    const rowsData = Array.from(tableBody.rows).map(row => {
        return {
            companyName: row.cells[0].textContent,
            positionTitle: row.cells[1].textContent,
            applicationDate: row.cells[2].textContent,
            status: row.cells[3].querySelector('span').textContent,
            jobLink: row.cells[4].querySelector('a').href
        };
    });
    localStorage.setItem('applications', JSON.stringify(rowsData));
}

// Function to load applications from local storage
function loadApplications() {
    const applications = JSON.parse(localStorage.getItem('applications')) || [];
    applications.forEach(app => {
        addApplicationToTable(app.companyName, app.positionTitle, app.applicationDate, app.status, app.jobLink);
    });
    updateStatistics();
}

// Function to create or update the status cell
function setupStatusCell(cell, status) {
    cell.innerHTML = '';

    var statusDiv = document.createElement('div');
    statusDiv.className = 'status-container';

    var statusSpan = document.createElement('span');
    statusSpan.textContent = status;
    statusSpan.className = 'status-text';
    statusDiv.appendChild(statusSpan);

    var editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    editBtn.className = 'edit-btn';
    editBtn.onclick = function() {
        toggleEditStatus(statusDiv, statusSpan, editBtn);
    };
    statusDiv.appendChild(editBtn);

    cell.appendChild(statusDiv);
}

// Function to add an application to the table and update statistics
function addApplicationToTable(companyName, positionTitle, applicationDate, status, jobLink) {
    var tableBody = document.getElementById('applications-table-body');
    var newRow = tableBody.insertRow();

    newRow.insertCell(0).textContent = companyName;
    newRow.insertCell(1).textContent = positionTitle;
    newRow.insertCell(2).textContent = applicationDate;
    setupStatusCell(newRow.insertCell(3), status);

    var linkCell = newRow.insertCell(4);
    var link = document.createElement('a');
    link.setAttribute('href', jobLink);
    link.setAttribute('target', '_blank');
    link.textContent = 'View';
    linkCell.appendChild(link);

    var deleteBtnCell = newRow.insertCell(5);
    var deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.className = 'delete-btn';
    deleteBtn.onclick = function() {
        if (confirm('Are you sure you want to delete this application?')) {
            newRow.remove();
            updateLocalStorage();
            updateStatistics();
        }
    };
    deleteBtnCell.appendChild(deleteBtn);
    updateLocalStorage();
    updateStatistics();
}

// Function to toggle editing status
function toggleEditStatus(statusDiv, statusSpan, editBtn) {
    const isEditing = editBtn.getAttribute('data-editing') === 'true';

    if (isEditing) {
        const select = statusDiv.querySelector('select');
        statusSpan.textContent = select.value;
        statusSpan.style.display = '';
        statusDiv.removeChild(select);
        editBtn.textContent = 'Edit';
        editBtn.setAttribute('data-editing', 'false');
        updateLocalStorage();
        updateStatistics();
    } else {
        const currentStatus = statusSpan.textContent;
        const select = document.createElement('select');
        select.innerHTML = `
            <option value="Applied" ${currentStatus === 'Applied' ? 'selected' : ''}>Applied</option>
            <option value="Interviewing" ${currentStatus === 'Interviewing' ? 'selected' : ''}>Interviewing</option>
            <option value="Offered" ${currentStatus === 'Offered' ? 'selected' : ''}>Offered</option>
            <option value="Rejected" ${currentStatus === 'Rejected' ? 'selected' : ''}>Rejected</option>
        `;
        select.className = 'status-select';
        statusDiv.insertBefore(select, statusSpan);
        statusSpan.style.display = 'none';
        editBtn.textContent = 'Save';
        editBtn.setAttribute('data-editing', 'true');
    }
}

// Function to update statistics
function updateStatistics() {
    const tableBody = document.getElementById('applications-table-body');
    const totalApplications = tableBody.rows.length;
    let applicationsPending = 0;
    let interviewsScheduled = 0;
    let offersReceived = 0;

    Array.from(tableBody.rows).forEach(row => {
        const status = row.cells[3].querySelector('span').textContent;
        if (status === 'Applied') applicationsPending++;
        if (status === 'Interviewing') interviewsScheduled++;
        if (status === 'Offered') offersReceived++;
    });

    document.getElementById('total-applications').textContent = totalApplications;
    document.getElementById('applications-pending').textContent = applicationsPending;
    document.getElementById('interviews-scheduled').textContent = interviewsScheduled;
    document.getElementById('offers-received').textContent = offersReceived;
}

// Event listener for form submission
document.getElementById('new-job-form').addEventListener('submit', function(event) {
    event.preventDefault();
    var companyName = document.getElementById('company-name').value;
    var positionTitle = document.getElementById('position-title').value;
    var applicationDate = document.getElementById('application-date').value;
    var jobLink = document.getElementById('job-link').value;
    var status = document.getElementById('status').value;
    addApplicationToTable(companyName, positionTitle, applicationDate, status, jobLink);
    document.getElementById('new-job-form').reset();
});

document.addEventListener('DOMContentLoaded', loadApplications);

// Advanced filtering and sorting
document.getElementById('filter-status').addEventListener('change', filterAndSortApplications);
document.getElementById('sort-by').addEventListener('change', filterAndSortApplications);
document.getElementById('sort-asc').addEventListener('click', () => sortApplications(true));
document.getElementById('sort-desc').addEventListener('click', () => sortApplications(false));

function filterAndSortApplications() {
    const statusFilter = document.getElementById('filter-status').value;
    const sortBy = document.getElementById('sort-by').value;
    const rows = Array.from(document.getElementById('applications-table-body').rows);

    const filteredRows = statusFilter ? rows.filter(row => row.cells[3].querySelector('span').textContent === statusFilter) : rows;
    sortRows(filteredRows, sortBy);
    rebuildTable(filteredRows);
}

function sortRows(rows, sortBy) {
    rows.sort((a, b) => {
        if (sortBy === 'dateApplied') {
            return new Date(a.cells[2].textContent) - new Date(b.cells[2].textContent);
        } else if (sortBy === 'company') {
            return a.cells[0].textContent.localeCompare(b.cells[0].textContent);
        }
    });
}

function sortApplications(ascending) {
    const rows = Array.from(document.getElementById('applications-table-body').rows);
    sortRows(rows, document.getElementById('sort-by').value);
    if (!ascending) {
        rows.reverse();
    }
    rebuildTable(rows);
}

function rebuildTable(rows) {
    const tableBody = document.getElementById('applications-table-body');
    tableBody.innerHTML = '';
    rows.forEach(row => tableBody.appendChild(row));
}

// Function for searching the table
function searchTable() {
    var input = document.getElementById("search-input");
    var filter = input.value.toUpperCase();
    var table = document.getElementById("job-list");
    var tr = table.getElementsByTagName("tr");

    for (var i = 1; i < tr.length; i++) {
        var td = tr[i].getElementsByTagName("td");
        var found = false;
        for (var j = 0; j < td.length; j++) {
            if (td[j]) {
                var txtValue = td[j].textContent || td[j].innerText;
                if (txtValue.toUpperCase().indexOf(filter) > -1) {
                    found = true;
                    break;
                }
            }        
        }
        tr[i].style.display = found ? "" : "none";
    }
}
