 currentUserRole = '';
  volunteerSearchTimeout = null;
 isVolunteersLoaded = false;
 isLeadersLoaded = false;
  currentExportSection = '';
isProgramsLoaded = false;
activeAcademicYear = "";
let currentRegStatus = 'closed';
document.addEventListener("DOMContentLoaded", () => {
    fetchAdminProfile();
    displayeventcard();
    pendingActions();
    loadEventsOverview()
    loadStudentStats()
    //AddEvent
const addEventButton = document.getElementById('addEventBtn');

if (addEventButton) {
    addEventButton.addEventListener('click', async () => {
      
        try {
            const response = await fetch('../config/get_user.php');
            const sessionData = await response.json();

            
            if (sessionData.success && (sessionData.role).toLowerCase() === 'programme officer' ||(sessionData.role).toLowerCase() === "nss team" || (sessionData.role).toLowerCase() === 'leader') {
                console.log("Access Granted. Proceeding to add event...");
                window.location.href = '../Event/registerevent.html';
              
            } else {
                alert("Unauthorized: Only Admins and Leaders can add events.");
                window.location.href = '../Authentication/index.html';
            }
        } catch (error) {
            console.error("Session verification failed:", error);
        }
    });
}
});

//toggel sidebar in mobile view
function toggleSidebar(element){
    const sidebar = document.getElementById('sidebar');
   
        if(element.id === "open_sidebar"){
            sidebar.classList.remove("-translate-x-full");
            sidebar.classList.add("translate-x-0");
            

        }
        else if(element.id ==="close_sidebar"){
            sidebar.classList.remove("translate-x-0");
             sidebar.classList.add("-translate-x-full");
        }
}


//Changing pages in dashboard 28/06/2026

function switchpage(pageid){
        if (pageid === 'leaders' && currentUserRole === 'leader') {
            alert("Unauthorized access.");
            return;
        }
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        
        document.getElementById(pageid).classList.add('active');
        if (pageid === 'u_event' && !isUpcomingLoaded) {
           loadUpcomingEvents();
        }
        if (pageid === 'c_event' && !isCompletedLoaded) {
          loadCompletedEvents();
        }
        if (pageid === 'volunteers' && !isVolunteersLoaded) {
          loadVolunteers();
        }
        if (pageid === 'leaders' && currentUserRole !== 'leader' && !isLeadersLoaded) {
          loadLeaders();
        }
        if(pageid === 'pendings' && currentUserRole !== 'admin'){
          getPendingStd();
        }
         if(pageid === 'settings' && currentUserRole !== 'leader'){
          loadRegistrationStatus()
        }

        
}

function activate(ele){
    document.querySelectorAll('.nav-title').forEach(title => title.classList.remove('active_side'));
    ele.classList.add('active_side');
}

//Navbar Profile
async function fetchAdminProfile() {
  
    try {
       
        const response = await fetch('../config/get_user.php');
        const data = await response.json();
       
        if (data.success) {
          currentUserRole = data.role ? data.role.toLowerCase() : '';
        }

        const leadersNav = document.getElementById('nav_leaders');
        if (leadersNav) {
          leadersNav.style.display = (currentUserRole === 'leader') ? 'none' : 'flex';
        }
        const approvalNav = document.getElementById('nav_pendings');
        if (approvalNav) {
          approvalNav.style.display = (currentUserRole === 'leader') ? 'flex' : 'none';
        }
        const settingsNav = document.getElementById('nav_settings');
        if (settingsNav) {
          settingsNav.style.display = (currentUserRole !== 'leader') ? 'flex' : 'none';
        }
        if (data.success) {
           
            const admin = {
                name: data.name,
                role: data.role,
                username: data.ausername,
                email: data.email,
                mobile: data.mobile
            };

           
            localStorage.setItem('user', JSON.stringify(admin));
            
            const nameElement = document.getElementById('name_display');
            const roleElement = document.getElementById('role_display');
            const usernameElement = document.getElementById('username_display');

           
            if (nameElement) {
                
                nameElement.textContent = admin.name;
            } 

            if (roleElement) {
                
                roleElement.textContent = admin.role;
            }

            if(usernameElement){
                
                usernameElement.textContent = admin.username;
            }   
        } 
        else {
            localStorage.removeItem('user');
            window.location.href = '../authentication/index.html';
        }
    } catch (error) { 
        
        console.error("Failed to parse session profile data:", error);
    }
}




//Volunteers list
async function loadVolunteers(searchTerm = '') {
  const container = document.getElementById("volunteers"); 

  try {
    const response = await fetch(`../api/get_vol-leader-list.php?role=Volunteer&search=${encodeURIComponent(searchTerm)}`);
    const result = await response.json();

    if (result.success) {
      isVolunteersLoaded = true;
      const volunteers = result.data.volunteer || [];

      const promoteBtnHTML = (currentUserRole !== 'leader') 
        ? `<button type="button" onclick="promoteSelectedLeaders()" class="bg-blue-950 hover:bg-blue-900 text-white font-semibold text-sm px-4 py-2 rounded-xl shadow transition">
            Promote Selected as Leader
          </button>` 
        : '';

      let cardsHTML = `
        <div class="border-b-2 border-slate-200 pb-3 mb-4 space-y-3">
          <div class="flex justify-between items-center">
            <h2 class="font-header text-2xl font-bold text-slate-800">
              Volunteers List :- <span class="text-red-600">${volunteers.length}</span>
            </h2>
            <div class="flex gap-2">
              <button type="button" onclick="openVolExp()" class="bg-blue-900 hover:bg-blue-950 text-white font-semibold text-sm px-4 py-2 rounded-xl shadow transition cursor-pointer">
                Export List
              </button>
              ${promoteBtnHTML}
            </div>
          </div>

          <!-- Search Input -->
          <div>
            <input 
              type="text" 
              id="searchVolunteerInput"
              placeholder="Search by name, roll no, mobile..." 
              value="${searchTerm}"
              oninput="onVolunteerSearch(this.value)"
              class="w-72 border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
            />
          </div>
        </div>
      `;

      if (volunteers.length === 0) {
        cardsHTML += `<p class="text-slate-500 text-center py-6">No matching volunteers found.</p>`;
        container.innerHTML = cardsHTML;
        retainFocus();
        return;
      }

      cardsHTML += `<div class="space-y-3 overflow-y-auto p-1">`;

      volunteers.forEach(item => {
        cardsHTML += `
          <div class="volunteer-card border border-slate-200 rounded-2xl p-4 bg-white shadow-sm space-y-3">
            <div class="flex items-center gap-6 border-b border-slate-100 pb-2">
              <label class="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  value="${item.id}" 
                  class="volunteer-checkbox w-4 h-4 text-blue-950 rounded border-slate-300 focus:ring-blue-500 cursor-pointer" 
                />
                <span class="text-sm font-semibold text-slate-700">Name: <span class="font-bold text-blue-950">${item.first_name} ${item.surname}</span></span>
              </label>
              <p class="text-sm font-semibold text-slate-700">Mobile: <span class="font-bold text-blue-950">${item.mobile || ''}</span></p>
              <p class="text-sm font-semibold text-slate-700">NSS Year: <span class="font-bold text-blue-950">${item.nss_year|| ''}</span></p>
            </div>

            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm font-semibold text-slate-700">
              <p>Class & Program:: <span class="font-bold text-blue-950">${item.class || ''}${item.program || ''}</span></p>
              <p>Roll no.: <span class="font-bold text-blue-950">${item.division || ''}${item.roll_no || ''}</span></p>
              <p>Total hrs: <span class="font-bold text-blue-950">${item.total_hrs || 0}</span></p>
            </div>
          </div>`;
      });

      cardsHTML += `</div>`;
      container.innerHTML = cardsHTML;
      retainFocus();

    } else {
      console.error("Error loading volunteers:", result.error);
    }
  } catch (error) {
    console.error("Network error fetching volunteers:", error);
  }
}
function onVolunteerSearch(value) {
  clearTimeout(volunteerSearchTimeout);
  volunteerSearchTimeout = setTimeout(() => {
    loadVolunteers(value);
  }, 300);
}

function retainFocus() {
  const input = document.getElementById("searchVolunteerInput");
  if (input) {
    input.focus();
    input.setSelectionRange(input.value.length, input.value.length);
  }
}
//Export Student List
async function openVolExp(){
  currentExportSection = 'volunteers';
  
  document.getElementById("exportModalTitle").innerText = "Export Volunteers List";
  document.getElementById("volunteerFilterFields").classList.remove("hidden"); // Show class & division
  document.getElementById("volunteerFilterFields").classList.add("flex");
  showExportModal();
  // window.location.href = '../api/export_list.php?action=export_std_list';
}
// To dyanmic years 


async function showExportModal() {
  const modal = document.getElementById("exportModal");
  const yearDropdown = document.getElementById("modalAcademicYear");

  // Fetch registered years from db
  if (yearDropdown.children.length === 0) {
    try {
      const res = await fetch("../api/export_list.php?action=get_academic_years");
      const json = await res.json();

      if (json.success && json.years) {
        yearDropdown.innerHTML = json.years.map(yr => `
          <option value="${yr}" ${yr === json.current_year ? 'selected' : ''}>
            ${yr} ${yr === json.current_year ? '(Current)' : ''}
          </option>
        `).join('');
      }
    } catch (err) {
      console.error("Failed to fetch academic years:", err);
    }
  }
  await loadDynamicPrograms();
  modal.classList.remove("hidden");
}

function closeExportModal() {
  document.getElementById("exportModal").classList.add("hidden");
  document.getElementById("exportModal").classList.remove("flex");
}
// to show programs dynamically
async function loadDynamicPrograms() {
  const programSelect = document.getElementById("modalProgram");
  if (!programSelect || isProgramsLoaded) return;

  try {
    const res = await fetch("../api/export_list.php?action=get_programs");
    const json = await res.json();

    if (json.success && Array.isArray(json.programs)) {
      let optionsHTML = '<option value="">All Programs</option>';
      json.programs.forEach(prog => {
        optionsHTML += `<option value="${prog}">${prog}</option>`;
      });
      programSelect.innerHTML = optionsHTML;
      isProgramsLoaded = true;
    }
  } catch (err) {
    console.error("Failed to load programs:", err);
  }
}
//exporting event and volunteer list
function executeExport() {
  const selectedYear = document.getElementById("modalAcademicYear").value;

  if (currentExportSection === 'volunteers') {
    const selectedClass = document.getElementById("modalClass").value;
    const selectedProgram   = document.getElementById("modalProgram").value;

    const params = new URLSearchParams({
      action: 'export_std_list',
      academic_year: selectedYear,
      class: selectedClass,
      program: selectedProgram
    });

    window.location.href = `../api/export_list.php?${params.toString()}`;

  } else if (currentExportSection === 'events') {
    const params = new URLSearchParams({
      action: 'export_c_event_list',
      academic_year: selectedYear
    });

    window.location.href = `../api/export_list.php?${params.toString()}`;
  }

  closeExportModal();
}



//datevalidate
const today = new Date();

const yyyy = today.getFullYear();
const mm = String(today.getMonth() + 1).padStart(2, '0');
const dd = String(today.getDate()).padStart(2, '0');
const fdate = `${yyyy}-${mm}-${dd}`;
document.getElementById('edit_date').min = fdate;
 


//profile

function openProfile(){
  
  const modal = document.getElementById('profile_modal');
  const prof = document.getElementById('profile_fields');
   
  const user = JSON.parse(localStorage.getItem('data'));

  const role = (user.role || '').toLowerCase().trim();

  AcademicButtonForRole(role);
  if(prof){
   prof.innerHTML = `
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div>
                    <span class="text-xs text-slate-400 font-semibold uppercase block">Username</span>
                    <span class="text-slate-800 font-medium">${user.username}</span>
                </div>
                <div>
                    <span class="text-xs text-slate-400 font-semibold uppercase block">Name</span>
                    <span class="text-slate-800 font-medium">${user.name}</span>
                </div>
                <div>
                    <span class="text-xs text-slate-400 font-semibold uppercase block">Mobile</span>
                    <span class="text-slate-800 font-medium">${user.mobile}</span>
                </div>
                <div>
                    <span class="text-xs text-slate-400 font-semibold uppercase block">Email</span>
                    <span class="text-slate-800 font-medium">${user.email}</span>
                </div>
                <div>
                    <span class="text-xs text-slate-400 font-semibold uppercase block">Role</span>
                    <span class="text-slate-800 font-medium">${user.role}</span>
                </div>
            </div>
        `;
  }
  if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }
}

function closeProfileModal() {
    const modal = document.getElementById('profile_modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
}

// LEADER SECTIONS FUNCTIONS
async function promoteSelectedLeaders(){

  if (currentUserRole === 'leader') {
        alert("Leaders are not permitted to promote volunteers.");
        return;
    }
  const selectedchb = document.querySelectorAll('.volunteer-checkbox:checked');

  if(selectedchb.length === 0){
    alert("Volunteers not selected");
    return;
  }
  const selectedID = Array.from(selectedchb).map(cb => cb.value );
  if(!confirm(`Are you Sure you want to promote ${selectedID.length} volunteers to leader`)){
    return;
  }
  try{
    const response = await fetch('../api/promote-depromote_leader.php',{
      method : 'POST',
      headers:{'Content-type':'application/json'},
        body :JSON.stringify({student_id: selectedID,
          role: 'leader'
        })
    });

    const result = await response.json();

    if(result.success){
      alert(result.msg);
      isVolunteersLoaded = false;
      loadVolunteers();
    }
    else{
      alert("Error:" + result.error);
    }

  }catch(error){
    console.error("Error " , error);
    alert("Network error");
  }


}

async function loadLeaders() {
  const container = document.getElementById("leaders"); 

  try {
    const response = await fetch("../api/get_vol-leader-list.php?role=Leader");
    const result = await response.json();

    if (result.success) {
      isLeadersLoaded = true;
      const leaders = result.data.leader || [];

      if (leaders.length === 0) {
        container.innerHTML = `
          <div class="border-b-2 border-slate-200 pb-3 mb-4">
            <h2 class="font-header text-2xl font-bold text-slate-800">
              Leaders List
            </h2>
          </div>
        `;
        return;
      }

      let cardsHTML = `
        <div class="border-b-2 border-slate-200 pb-3 mb-4 flex justify-between items-center">
          <h2 class="font-header text-2xl font-bold text-slate-800">
            leaders List :- <span class="text-red-600">${leaders.length}</span>
          </h2>
          <button type="button" onclick="demoteSelectedLeader()" cursor-pointer class="bg-blue-950 hover:bg-blue-900 text-white font-semibold text-sm px-4 py-2 rounded-xl shadow transition">
           change to volunteer
          </button>
        </div>
        <div class="space-y-3 overflow-y-auto p-1">
      `;

      leaders.forEach(item => {
        cardsHTML += `
          <div class="leader-card border border-slate-200 rounded-2xl p-4 bg-white shadow-sm space-y-3">
            
            
            <div class="flex items-center gap-6 border-b border-slate-100 pb-2">
              <label class="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  value="${item.id}" 
                  class="leader-checkbox w-4 h-4 text-blue-950 rounded border-slate-300 focus:ring-blue-500 cursor-pointer" 
                />
                <span class="text-sm font-semibold text-slate-700">Name: <span class="font-bold text-blue-950">${item.first_name} ${item.surname}</span></span>
              </label>
              <p class="text-sm font-semibold text-slate-700">Mobile: <span class="font-bold text-blue-950">${item.mobile || ''}</span></p>
            </div>

            
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm font-semibold text-slate-700">
              <p>Class: <span class="font-bold text-blue-950">${item.class || ''}</span></p>
              <p>Program: <span class="font-bold text-blue-950">${item.program || ''}</span></p>
              <p>Roll no.: <span class="font-bold text-blue-950">${item.division}${item.roll_no || ''}</span></p>
              <p>Total hrs: <span class="font-bold text-blue-950">${item.total_hrs || 0}</span></p>
            </div>

          </div>`;
      });

      cardsHTML += `</div>`;
      container.innerHTML = cardsHTML;

    } else {
      console.error("Error loading leaders:", result.error);
    }
  } catch (error) {
    console.error("Network error fetching leaders:", error);
  }
}

async function demoteSelectedLeader(){
  const selected = document.querySelectorAll('.leader-checkbox:checked');

  if(selected.length === 0){
    alert("Leaders not selected");
    return;
  }

  const selectedID = Array.from(selected).map(cb => cb.value);

  if(!confirm(`Are you sure you want to depromote ${selectedID.length} leader?`)){
    return;
  }

  try{
    const response = await fetch('../api/promote-depromote_leader.php',{ 
      method : 'POST',
      headers :{'Content-type' : 'application/json'},
      body:JSON.stringify({
        student_id :selectedID,
        role : 'volunteer'
      })
        
  });
  

    const result = await response.json();

    if(result.success){
      alert(result.msg);
      isLeadersLoaded = false;
      loadLeaders();
    }
    else{
      alert("Error:" + result.error);
    }

  }catch(error){
    console.error("Error " , error);
    alert("Network error");
}

}
  
//approval system
async function getPendingStd(){
  if(currentUserRole !== 'leader') {
      console.warn('Unauthorized: Only leaders can view pending approvals.');
      return;
  }

  const Container = document.getElementById('pendings');
  try{
    const response = await fetch('../authentication/approval.php',{
      method :'GET',
      headers : {'Accept' : 'application/json'}
    });

    if(!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
   if (!result.success) {
      console.error('Failed to fetch data:', result.error);
      Container.innerHTML = `
        <div class="border-b-2 border-slate-200 pb-3 mb-4">
          <h2 class="font-header text-2xl font-bold text-slate-800">Pending Approvals</h2>
        </div>
        <p class="text-sm text-red-600 font-medium">${result.error || 'Failed to load requests.'}</p>
      `;
      return;
    }

    const students = result.data || [];

    if (students.length === 0) {
      Container.innerHTML = `
        <div class="border-b-2 border-slate-200 pb-3 mb-4">
          <h2 class="font-header text-2xl font-bold text-slate-800">Pending Approvals</h2>
        </div>
        <div class="bg-white rounded-2xl border border-slate-200 p-8 text-center text-sm text-slate-500 italic shadow-sm">
          No pending registrations found.
        </div>
      `;
      return;
    }

    let rowsHTML = '';
    students.forEach(student => {
      const fullName = `${student.first_name} ${student.surname}`;
      rowsHTML += `
        <tr id="row-${student.std_id}" class="hover:bg-slate-50 transition-colors border-b border-slate-100">
          <td class="px-6 py-4 text-sm font-semibold text-slate-800 whitespace-nowrap">${fullName}</td>
          <td class="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">${student.email}</td>
          <td class="px-6 py-4 text-sm font-medium text-blue-950 whitespace-nowrap">${student.mobile}</td>
          <td class="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">${student.class} - ${student.program}</td>
          <td class="px-6 py-4 text-sm font-medium text-slate-700 whitespace-nowrap">${student.division}${student.roll_no}</td>
          <td class="px-6 py-4 text-sm whitespace-nowrap text-center space-x-2">
            <button 
              type="button"
              class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer" 
              onclick="handleApproval(${student.std_id}, 'approve')">
              Approve
            </button>
            <button 
              type="button"
              class="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer" 
              onclick="handleApproval(${student.std_id}, 'reject')">
              Reject
            </button>
          </td>
        </tr>
      `;
    });

    Container.innerHTML = `
      <div class="border-b-2 border-slate-200 pb-3 mb-4 flex justify-between items-center">
        <h2 class="font-header text-2xl font-bold text-slate-800">
          Pending Approvals :- <span class="text-red-600">${students.length}</span>
        </h2>
      </div>
      <div class="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm bg-white">
        <table class="min-w-full divide-y divide-slate-200 text-left">
          <thead class="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <tr>
              <th class="px-6 py-3.5">Name</th>
              <th class="px-6 py-3.5">Email</th>
              <th class="px-6 py-3.5">Mobile</th>
              <th class="px-6 py-3.5">Class & Program</th>
              <th class="px-6 py-3.5">Div / Roll</th>
              <th class="px-6 py-3.5 text-center">Actions</th>
            </tr>
          </thead>
          <tbody id="pending_rows_body" class="divide-y divide-slate-100">
            ${rowsHTML}
          </tbody>
        </table>
      </div>
    `;

  }catch(error){
    console.error('Fetch error:', error);
        Container.innerHTML = `<tr><td colspan="7" class="text-danger text-center">Error loading requests. Please refresh.</td></tr>`;
  }
}

async function handleApproval(studentId, action) {
  if (action === 'reject') {
    const confirmed = confirm('Are you sure you want to reject this registration? The application will be permanently removed.');
    if (!confirmed) return;
  }

  const row = document.getElementById(`row-${studentId}`);
  const buttons = row ? row.querySelectorAll('button') : [];

  
  buttons.forEach(btn => {
    btn.disabled = true;
    btn.classList.add('opacity-50', 'cursor-not-allowed');
  });

  const formData = new FormData();
  formData.append('std_id', studentId);
  formData.append('action', action);

  try{
    const response = await fetch('../authentication/approval.php', {
      method: 'POST',
      body: formData
    });

    if(!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if(result.success) {
      alert(result.message);

      
      if(row) {
        row.remove();
      }

      
      const container = document.getElementById('pendings');
      if(container && container.children.length === 0) {
        container.innerHTML = `<tr><td colspan="7" class="px-4 py-4 text-center text-sm text-gray-500 italic">No pending registrations found.</td></tr>`;
      }
    } 
    else{
      alert('Operation failed: ' + (result.error || 'Unknown error occurred.'));
      
      buttons.forEach(btn => {
        btn.disabled = false;
        btn.classList.remove('opacity-50', 'cursor-not-allowed');
      });
    }

  } 
  catch(error){
    console.error('Request failed:', error);
    alert('An error occurred while processing the request. Please try again.');
    
   
    buttons.forEach(btn =>{
      btn.disabled = false;
      btn.classList.remove('opacity-50', 'cursor-not-allowed');
    });
  }
}

async function pendingActions(){
  const container = document.getElementById('pending_actions');
  const pendingReport = document.getElementById('pending_report');
  const pendingHrs = document.getElementById('pending_hrs');
  const reportcount = document.getElementById('pending_report_count');
  const hrsremains = document.getElementById('pending_hrs_count')
  try{const response = await fetch("../api/event_api.php?action=getPendingCounts");
  if(!response.ok){
    throw new Error(`HTTP error! status: ${response.status}`);
  }

    const result = await response.json();

    if(result.success){
      const reports = Number(result.pending_reports || 0);
      const hrs = Number(result.pending_hrs || 0);

      if (reports > 0 && hrs > 0) {
         reportcount.textContent = reports;
        hrsremains.textContent = hrs;
        container.classList.remove('hidden');
        pendingReport.classList.remove('hidden');
        pendingReport.classList.add('flex');
        pendingHrs.classList.remove('hidden');
        pendingHrs.classList.add('flex');
      } else if(reports > 0 && hrs == 0){
        reportcount.textContent = reports;
        container.classList.remove('hidden');
        pendingReport.classList.remove('hidden');
        pendingReport.classList.add('flex');
      } else if(reports == 0 && hrs > 0){
        hrsremains.textContent = hrs;
        container.classList.remove('hidden');
        pendingHrs.classList.remove('hidden');
        pendingHrs.classList.add('flex');
      }
    } else {
      console.error("Error occurred while pending actions counting:", result.error);
    }
  } catch (error) {
    console.error('Request failed:', error);
  }
}


//Registrations
async function loadRegistrationStatus() {
  const btn = document.getElementById("toggleRegBtn");
  if (!btn) return;

  try {
    const res = await fetch("../api/settings.php?action=get_registration_status");
    const data = await res.json();
    if (data.success) {
      currentRegStatus = data.status;
      updateToggleButtonUI();
    }
  } catch (e) {
    console.error(e);
  }
}

function updateToggleButtonUI() {
  const btn = document.getElementById("toggleRegBtn");
  if (!btn) return;

  if (currentRegStatus === 'open') {
    btn.textContent = "Close Registration";
    btn.className = "px-4 py-2 rounded-xl text-sm font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow";
  } else {
    btn.textContent = "Open Registration";
    btn.className = "px-4 py-2 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow";
  }
}

async function toggleRegistration() {
  const nextStatus = (currentRegStatus === 'open') ? 'closed' : 'open';
  if (!confirm(`Are you sure you want to set registration to ${nextStatus.toUpperCase()}?`)) return;

  try {
    const res = await fetch("../api/settings.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "toggle_registration",
        status: nextStatus
      })
    });
    const data = await res.json();
    if (data.success) {
      currentRegStatus = data.status;
      updateToggleButtonUI();
      alert(`Registration is now ${data.status.toUpperCase()}.`);
    } else {
      alert("Failed: " + data.error);
    }
  } catch (err) {
    console.error(err);
  }
}

function openAdminRegistration(){
  window.location.href = "../authentication/adminregister.html";
}