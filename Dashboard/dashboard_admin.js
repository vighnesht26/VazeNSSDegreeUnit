let currentUserRole = '';

let isVolunteersLoaded = false;
let isLeadersLoaded = false;
document.addEventListener("DOMContentLoaded", () => {
    fetchAdminProfile();
    displayeventcard();

    //AddEvent
const addEventButton = document.getElementById('addEventBtn');

if (addEventButton) {
    addEventButton.addEventListener('click', async () => {
      
        try {
            const response = await fetch('../config/get_user.php');
            const sessionData = await response.json();

            
            if (sessionData.success && (sessionData.role === 'programme officer' ||sessionData.role === "nss team" || sessionData.role === 'leader')) {
                console.log("Access Granted. Proceeding to add event...");
                window.location.href = '../Event/registerevent.html';
              
            } else {
                alert("Unauthorized: Only Admins and Leaders can add events.");
                window.location.href = '../Authentication/login.html';
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
                console.log("name RUNNED");
                nameElement.textContent = admin.name;
            } 

            if (roleElement) {
                console.log("role RUNNED");
                roleElement.textContent = admin.role;
            }

            if(usernameElement){
                console.log("username RUNNED");
                usernameElement.textContent = admin.username;
            }   
        } 
        else {
            localStorage.removeItem('user');
            window.location.href = '../Authentication/login.html';
        }
    } catch (error) { 
        
        console.error("Failed to parse session profile data:", error);
    }
}




//Volunteers list
async function loadVolunteers() {
  const container = document.getElementById("volunteers"); 

  try {
    const response = await fetch("../api/get_vol-leader-list.php?role=Volunteer");
    const result = await response.json();

    if (result.success) {
      let isVolunteersLoaded = true;
      const volunteers = result.data.volunteer || [];

      if (volunteers.length === 0) {
        container.innerHTML = `
          <div class="border-b-2 border-slate-200 pb-3 mb-4">
            <h2 class="font-header text-2xl font-bold text-slate-800">
              Volunteers List
            </h2>
          </div>
        `;
        return;
      }

      const promoteBtnHTML = (currentUserRole !== 'leader') 
        ? `<button type="button" onclick="promoteSelectedLeaders()" class="bg-blue-950 hover:bg-blue-900 text-white font-semibold text-sm px-4 py-2 rounded-xl shadow transition">
          Promote Selected as Leader
          </button>` 
          : '';

      let cardsHTML = `
        <div class="border-b-2 border-slate-200 pb-3 mb-4 flex justify-between items-center">
          <h2 class="font-header text-2xl font-bold text-slate-800">
            Volunteers List :- <span class="text-red-600">${volunteers.length}</span>
          </h2>
          <button type="button" onclick="exportStudentList()" cursor-pointer class="bg-blue-900 hover:bg-blue-950 text-white font-semibold text-sm px-4 py-2 rounded-xl shadow transition">
            Export List
          </button>
          ${promoteBtnHTML}
        </div>
        <div class="space-y-3 overflow-y-auto p-1">
      `;

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
      console.error("Error loading volunteers:", result.error);
    }
  } catch (error) {
    console.error("Network error fetching volunteers:", error);
  }
}

async function logout(){
    try {
    const response = await fetch('../authentication/logout.php', { method: 'POST' });
    const data = await response.json();

    if (data.success) {
      localStorage.removeItem('user');
      window.location.href = data.location;
    }
  } catch (error) {
    console.error('Logout Error:', error);
  }

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
   
  const user = JSON.parse(localStorage.getItem('user'));

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
  
