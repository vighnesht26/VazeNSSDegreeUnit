

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
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        
        document.getElementById(pageid).classList.add('active');

        if(pageid == 'u_event'){
            loadUpcomingEvents();
        }
        if(pageid == 'volunteers'){
            loadVolunteers();
        }
        if(pageid == 'leaders'){
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

//Display Event in dashboard1
async function displayeventcard() {
    try{
        const response = await fetch('../api/dash_event.php');
        console.log("step1");
        if(!response.ok){
            throw new Error('Error status: ${response.status}');

        }
        console.log("step2");
        const data = await response.json();
         console.log("excecuted");
        if(!data.success){console.log("step3");
            console.log(data.error);
        }
        if(data.recent){console.log("step4");
            document.getElementById('ename').textContent= data.recent.name;
            document.getElementById('edate').textContent= data.recent.date;
            document.getElementById('etype').textContent= data.recent.event_type;
            // document.getElementById('evenue').textContent= data.recent.venue;
            //  document.getElementById('estatus').textContent= data.recent.status;

        }else{
             document.getElementById('ename').textContent= 'None';
            document.getElementById('edate').textContent= 'None';
            document.getElementById('etype').textContent= 'None';
            // document.getElementById('evenue').textContent= 'None';
            //  document.getElementById('estatus').textContent= 'None';

        }

        if(data.upcoming){console.log("step5");
            document.getElementById('uname').textContent= data.upcoming.name;
            document.getElementById('udate').textContent= data.upcoming.date;
            document.getElementById('utype').textContent= data.upcoming.event_type;
            document.getElementById('uvenue').textContent= data.upcoming.venue;
             document.getElementById('ustatus').textContent= data.upcoming.status;

        }else{
             document.getElementById('uname').textContent= 'None';
            document.getElementById('udate').textContent= 'None';
            document.getElementById('utype').textContent= 'None';
            document.getElementById('uvenue').textContent= 'None';
             document.getElementById('ustatus').textContent= 'None';

        }
        if(data.total_event){
            document.getElementById('e_total').textContent = data.total_event;
        }else{
             document.getElementById('e_total').textContent = none;
        }

    }catch(error){
        console.log(error);
    }
}

async function loadUpcomingEvents() {
  const container = document.getElementById("u_event");
  
  try {
    const response = await fetch("../api/upcoming_event.php");
    const result = await response.json();

    if (result.success) {
      const events = result.data;

      
      if (events.length === 0) {
        container.innerHTML = `
          <h2 class="font-header  font-bold text-slate-800 border-b-2 border-slate-200 pb-3 mb-2">
            Upcoming & Active Events
          </h2>
          <p class="text-slate-500 italic">No pending or upcoming events found.</p>
        `;
        return;
      }

      
      let cardsHTML = `
        <div class="border-b-2 border-slate-200 pb-2 mb-2">
          <h2 class="font-header text-2xl font-bold text-slate-800">
            Upcoming & Active Events :- <span class="text-red-600">${events.length}</span>
          </h2>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 max-h-[70vh] overflow-y-auto  p-2">
      `;

      events.forEach(ev => {
        cardsHTML += `
          <div class="event-card  border border-slate-200 rounded-2xl p-5 bg-white shadow-sm space-y-2">
            <p class="text-sm font-semibold text-slate-700">Event Name: <span class="font-bold text-blue-950">${ev.name}</span></p>
            <p class="text-sm font-semibold text-slate-700">Date: <span class="font-bold text-blue-950">${ev.date}</span></p>
            <p class="text-sm font-semibold text-slate-700">Type: <span class="font-bold text-blue-950">${ev.event_type}</span></p>
            <p class="text-sm font-semibold text-slate-700">Venue: <span class="font-bold text-blue-950">${ev.venue}</span></p>
            <p class="text-sm font-semibold text-slate-700">Status:<span class="font-bold text-amber-700 uppercase text-xs px-2.5 py-1 bg-amber-100 rounded-full">${ev.status}</span>
            </p>
            <button onclick="openEditModal(this)" data-id="${ev.event_id}"
              data-name="${ev.name}"
              data-date="${ev.date}"
              data-type="${ev.event_type}"
              data-venue="${ev.venue}"
              data-status="${ev.status}" class="c_btn">Update</button>
          </div>`;
      });

      cardsHTML += `</div>`;
      container.innerHTML = cardsHTML;

    } else {
      console.error("Error loading events:", result.error);
    }
  } catch (error) {
    console.error("Network error fetching upcoming events:", error);
  }
}

//Volunteers list
async function loadVolunteers() {
  const container = document.getElementById("volunteers"); 

  try {
    const response = await fetch("../api/get_vol-leader-list.php?role=Volunteer");
    const result = await response.json();

    if (result.success) {
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

      let cardsHTML = `
        <div class="border-b-2 border-slate-200 pb-3 mb-4 flex justify-between items-center">
          <h2 class="font-header text-2xl font-bold text-slate-800">
            Volunteers List :- <span class="text-red-600">${volunteers.length}</span>
          </h2>
          <button type="button" onclick="promoteSelectedLeaders()" cursor-pointer class="bg-blue-950 hover:bg-blue-900 text-white font-semibold text-sm px-4 py-2 rounded-xl shadow transition">
            Promote Selected as Leader
          </button>
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
                <span class="text-sm font-semibold text-slate-700">Name: <span class="font-bold text-blue-950">${item.first_name || ''}</span></span>
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
 
//Modal opens
function openEditModal(button) {
  const data = button.dataset;

  document.getElementById("edit_id").value = data.id;
  document.getElementById("edit_name").value = data.name;
  document.getElementById("edit_date").value = data.date;
  document.getElementById("edit_type").value = data.type;
  document.getElementById("edit_venue").value = data.venue;
  document.getElementById("edit_status").value = data.status;

  const modal = document.getElementById("edit_modal");
  modal.classList.remove("hidden");
  modal.classList.add("flex");
}

function closeEditModal() {
  const modal = document.getElementById("edit_modal");
  modal.classList.add("hidden");
  modal.classList.remove("flex");
}


async function handleUpdateEvent(e) {
  e.preventDefault();

  const updatedData = {
    id: document.getElementById("edit_id").value,
    date: document.getElementById("edit_date").value,
    event_type: document.getElementById("edit_type").value,
    venue: document.getElementById("edit_venue").value,
    status: document.getElementById("edit_status").value
  };

  try {
    const response = await fetch("../api/update_event.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedData)
    });

    const result = await response.json();

    if (result.success) {
      closeEditModal();
      loadUpcomingEvents(); 
    } else {
      alert("Error updating event: " + (result.error || "Unknown error"));
    }
  } catch (error) {
    console.error("Error submitting update:", error);
  }
}

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

//assign Leader
async function promoteSelectedLeaders(){
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
                <span class="text-sm font-semibold text-slate-700">Name: <span class="font-bold text-blue-950">${item.first_name || ''}</span></span>
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
  
