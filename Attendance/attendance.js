const urlParams = new URLSearchParams(window.location.search);
const eventId = urlParams.get('event_id');

let allVolunteers = [];
let defaultApproxHrs = 0;
let isAttendanceCompleted = false;

document.addEventListener("DOMContentLoaded", () => {
  if (!eventId) {
    alert("Missing Event ID in URL.");
    return;
  }
  loadAttendanceData();
});

async function loadAttendanceData() {
  try {
    const response = await fetch(`../api/event_api.php?action=get_attendance_list&id=${eventId}`);
    const result = await response.json();

    if (result.success) {
      const event = result.event;
      allVolunteers = result.volunteers || [];
      defaultApproxHrs = event.approx_hrs;

      document.getElementById('event_name_header').textContent = event.name;
      document.getElementById('event_date_header').textContent = event.date;
      document.getElementById('event_time_header').textContent = event.time || '--';

      
      isAttendanceCompleted = event.status === 'Completed' || 
        allVolunteers.some(v => v.attendance_status === 'Completed');

      
      allVolunteers.forEach(v => {
        v.is_present = (v.isabsent === 'no') ? 1 : 0;
      });

      renderTable(allVolunteers);
      //updateUIState();
    } else {
      alert("Error loading attendance: " + result.error);
    }
  } catch (error) {
    console.error("Network error fetching attendance:", error);
  }
}


function renderTable(volunteers) {
  const tbody = document.getElementById('volunteer_list_body');
  document.getElementById('total_volunteers').textContent = allVolunteers.length;

  if (volunteers.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="p-6 text-center text-slate-400 italic">No volunteers found.</td>
      </tr>`;
    // updatePresentCount();
    return;
  }

  let html = '';
  volunteers.forEach((v, index) => {
    const isChecked = v.is_present === 1 ? 'checked' : '';
    html += `
      <tr class="hover:bg-slate-50 transition">
        <td class="p-4 font-semibold">${index + 1}</td>
        <td class="p-4 font-bold text-slate-900">${v.first_name} ${v.surname || ''}</td>
         <td class="p-4">${v.gender || ''}</td>
        <td class="p-4">${v.class || ''} - ${v.program || ''}</td>
        <td class="p-4">${v.division || ''}${v.roll_no || ''}</td>
        <td class="p-4">${v.mobile || ''}</td>
        <td class="p-4 text-center">
          <input 
            type="checkbox" 
            value="${v.student_id}" 
            class="attendance-checkbox w-5 h-5 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer disabled:cursor-not-allowed"
            ${isChecked}
            onchange="toggleAttendance('${v.student_id}', this.checked)"
          />
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html;
 // updatePresentCount();
}



//Exportint to excel
window.exportToExcel = function() {
  if (!allVolunteers || allVolunteers.length === 0) {
    alert("No volunteer data available to export.");
    return;
  }

  if (typeof XLSX === 'undefined') {
    alert("Excel Export library (SheetJS) is not loaded.");
    return;
  }

  // Show the modal
  document.getElementById('export_modal').classList.remove('hidden');
};

// 2. Close Modal
window.closeExportModal = function() {
  document.getElementById('export_modal').classList.add('hidden');
};

// 3. Toggle Select / Deselect All Checkboxes
window.toggleAllExportCols = function(btn) {
  const checkboxes = document.querySelectorAll('.export-col-cb');
  const isDeselect = btn.textContent === 'Deselect All';

  checkboxes.forEach(cb => cb.checked = !isDeselect);
  btn.textContent = isDeselect ? 'Select All' : 'Deselect All';
};

// 4. Generate Excel with ONLY checked columns
window.confirmExcelExport = function() {
  const selectedCols = Array.from(document.querySelectorAll('.export-col-cb:checked')).map(cb => cb.value);

  if (selectedCols.length === 0) {
    alert("Please select at least one column to export.");
    return;
  }

  
  const excelRows = allVolunteers.map((v, index) => {
    const row = {};

    if (selectedCols.includes('sr_no'))      row["SR No."] = index + 1;
    if (selectedCols.includes('name'))       row["Volunteer Name"] = `${v.first_name || ''} ${v.surname || ''}`.trim();
    if (selectedCols.includes('gender'))     row["Gender"] = v.gender || '';
    if (selectedCols.includes('class_prog')) row["Class & Program"] = `${v.class || ''} - ${v.program || ''}`;
    if (selectedCols.includes('roll_no'))    row["Division & Roll No."] = `${v.division || ''}${v.roll_no || ''}`;
    if (selectedCols.includes('mobile'))     row["Mobile"] = v.mobile || '';
    if (selectedCols.includes('email'))     row["Email"] = v.email || '';
   

    return row;
  });

  // Export Sheet
  const worksheet = XLSX.utils.json_to_sheet(excelRows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");

  const eventName = document.getElementById('event_name_header').textContent || 'Event';
  const eventDate = document.getElementById('event_date_header').textContent || '';
  const sanitizedFileName = `${eventName}_${eventDate}_Attendance`.replace(/[^a-z0-9]/gi, '_');

  XLSX.writeFile(workbook, `${sanitizedFileName}.xlsx`);
  closeExportModal();
};