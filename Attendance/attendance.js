const urlParams = new URLSearchParams(window.location.search);
const eventId = urlParams.get('event_id');

let allVolunteers = [];

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
      

      document.getElementById('event_name_header').textContent = event.name;
      document.getElementById('event_date_header').textContent = event.date;
      document.getElementById('event_time_header').textContent = event.time || '--';

      
      const evtStatus = (event.status || '').toLowerCase();
      const attStatus = (event.attendance_status || '').toLowerCase();
      isAttendanceCompleted = evtStatus === 'completed' || attStatus === 'completed';
       

      
      allVolunteers.forEach(v => {
        v.is_present = (v.isabsent === 'no') ? 1 : 0;
      });

      renderTable(allVolunteers);
      updateState();
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
    updatePCount();
    return;
  }

  const isDisabled = isAttendanceCompleted ? 'disabled' : '';
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
            value="${v.std_id}" 
            class="attendance-checkbox w-5 h-5 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer disabled:cursor-not-allowed"
            ${isChecked} ${isDisabled}
            onchange="toggleAttendance('${v.std_id}', this.checked)"
          />
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html;
 updatePCount();
}

//toggle attendance

function toggleAttendance(studentId, isChecked){
  const volunteer = allVolunteers.find(v => v.std_id == studentId);
  if(volunteer){
    volunteer.is_present = isChecked ? 1 : 0;

    if(isChecked){
      const today = new Date();
      const year =  today.getFullYear();
      const month = String(today.getMonth()+ 1).padStart(2,'0');
      const day = String(today.getDate()).padStart(2, '0');
      const hours = String(today.getHours()).padStart(2, '0');
      const min = String(today.getMinutes()).padStart(2, '0');
      const sec = String(today.getSeconds()).padStart(2, '0');

      volunteer.reporting_mark = `${year}-${month}-${day} ${hours}:${min}:${sec}`
    }
    else{
      volunteer.reporting_mark = null;
    }
  }
  updatePCount();
}

function updatePCount(){
  const totalPresent = allVolunteers.filter(v => v.is_present == 1).length;
  document.getElementById('present_count').textContent = totalPresent;
}

async function saveAttendanceStatus(){
  const attData = allVolunteers.map(v => ({
    student_id :v.std_id,
    is_present : v.is_present,
    reporting_mark : v.reporting_mark


  }));

  try{
    const response = await fetch('../api/event_api.php',{
      method : 'POST',
      headers : { 'Content-type' : 'application/json'},
      body : JSON.stringify({
        action : 'save_attendance_progress',
        id : eventId,
        attendance : attData
      })
    });

    const result = await response.json();

    if(result.success){
      alert("reporting progress saved");
    }
    else{
      alert("Failed to save attendce" + result.error);
    }
  }catch(error){
    console.error("Error saving  progress", error);

  }
}

async function saveFinalAttendance(){
  if(!confirm("Are you sure, you want to submit? After submittion no changes allowed!")){
    return;
  }

  const attendanceData = allVolunteers.map(v =>({
    student_id : v.std_id,
    is_present : v.is_present,
    reporting_mark : v.reporting_mark
  }));

  try{
    const response = await fetch('../api/event_api.php', {
      method : 'POST',
      headers : {'Content-type' : 'application/json'},
      body  :JSON.stringify({
        action : 'submit_attendance',
        id : eventId,
        attendance : attendanceData
      })
    });

    const result = await response.json();
    if(result.success){
      alert("Attendance Submitted Successfully");
      isAttendanceCompleted = true;
      
    }
    else{
      alert("Error occured "+ result.error);
    }
  }catch(error){  
    console.error("Error submitting attendance", error);

  }
}

//shows diabled when completed
function updateState(){
  const checkboxes = document.querySelectorAll('.attendance-checkbox');
  const saveBtn = document.getElementById('mark_reporting_btn');
  const submitBtn = document.getElementById('final_submit_btn');
  const status = document.getElementById('attendance_status');

  if(isAttendanceCompleted){
    checkboxes.forEach(cb => cb.disabled = true);
    saveBtn.classList.add('hidden');
    submitBtn.classList.add('hidden');

    status.textContent = "Completed";
    status.className = "px-3 py-1 rounded-full text-xs font-bold bg-slate-200 text-slate-700 border border-slate-300 uppercase"
  }
}

//search
function filterVol(){
  const search = document.getElementById('volunteer_search').value.toLowerCase().trim();

  const filtered = allVolunteers.filter(v =>{
    const fullname = `${v.first_name} ${v.surname}`.toLowerCase();
    const classpro = `${v.class}${v.program}`.toLowerCase();
    const rollno = `${v.division}${v.roll_no}`.toLowerCase();
    const mobile = `${v.mobile}`;

    return fullname.includes(search) || classpro.includes(search) ||
           rollno.includes(search) || mobile.includes(search);
  });
  renderTable(filtered);
}

//Exportint to excel
window.exportToExcel = function() {
  if (!allVolunteers || allVolunteers.length === 0) {
    alert("No volunteer data available to export.");
    return;
  }

  document.getElementById('export_modal').classList.remove('hidden');
  document.getElementById('export_modal').classList.add('flex');
};


window.closeExportModal = function() {
  document.getElementById('export_modal').classList.add('hidden');
  document.getElementById('export_modal').classList.remove('flex');
};


window.toggleAllExportCols = function(btn) {
  const checkboxes = document.querySelectorAll('.export-col-cb');
  const isDeselect = btn.textContent === 'Deselect All';

  checkboxes.forEach(cb => cb.checked = !isDeselect);
  btn.textContent = isDeselect ? 'Select All' : 'Deselect All';
};


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