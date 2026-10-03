document.addEventListener("DOMContentLoaded", async () => {
    try{fetchStudentProfile();
    }catch(err){
      console.error("Error while fetching user data",err);
    }
    getEvents();
    AcademicUpdateStatus();
    get_hrs();
});

async function fetchStudentProfile(){
  
    try {
       
        const response = await fetch('../config/get_user.php');
        const data = await response.json();
       
        
        if (data.success) {
           
            const std = {
                name: data.name,
                role: data.role,
                username: data.ausername,
                email: data.email,
                mobile: data.mobile
            };

           
            localStorage.setItem('user', JSON.stringify(std));
            
            const nameElement = document.getElementById('name_display');
            const roleElement = document.getElementById('role_display');
            const usernameElement = document.getElementById('username_display');

           
            if (nameElement) {
                
                nameElement.textContent = std.name;
            } 

            if (roleElement) {
                
                roleElement.textContent = std.role;
            }

            if(usernameElement){
               
                usernameElement.textContent = std.username;
            }   
        
            const updateBtn = document.getElementById('academic_update_btn');
            if (updateBtn) {
                const userRole = (std.role || '').toLowerCase().trim();
                if (userRole === 'leader'|| userRole === 'volunteer') {
                    updateBtn.classList.remove('hidden');
                    await AcademicUpdateStatus();
                    
                } else {
                    updateBtn.classList.add('hidden');
                    updateBtn.disabled = true;
                }
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

async function get_hrs(){
  const hrs = document.getElementById('total_hrs');
  const container = document.getElementById('hrs_container');

  let user = null;
  try{
    const storedUser = localStorage.getItem("user");
    user = storedUser ? JSON.parse(storedUser) : null;
  }catch(e) {
    console.error("Failed to parse user from localStorage:", e);
  }

  const isEligible = user?.role === "Leader" || user?.role === "Volunteer";

  
  if(container) {
    if(!isEligible) {
      container.classList.add("hidden");
      container.classList.remove("flex");
      return; 
    } else {
      container.classList.remove("hidden");
      container.classList.add("flex");
    }
  }

 
  if(!hrs) return;

  
  try {
    const response = await fetch('../api/volunteer_api.php?action=get_total_hrs');
    
    if (!response.ok){
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    hrs.textContent = result?.total_hrs ?? 0;
  } catch (error) {
    console.error("Failed to fetch total hours:", error);
    hrs.textContent = "--";
  }
}

//active events load
async function getEvents(){
  
   const leaderContainer = document.getElementById("part_event_leader");
    const volunteerContainer = document.getElementById("active_events_container");
    if (!leaderContainer && !volunteerContainer) {
          return;
      }
    let user = null;
    try {
        const storedUser = localStorage.getItem("user");
        user = storedUser ? JSON.parse(storedUser) : null;
    } catch (e) {
        console.error("Failed to parse user from localStorage:", e);
    }

   
    const isLeader = user?.role === "Leader";

    
    if (leaderContainer) {
        if (!isLeader) {
            leaderContainer.classList.add("hidden");
            leaderContainer.innerHTML = "";   
        } else {
            leaderContainer.classList.remove("hidden");
        }
    }

    
    if (!volunteerContainer && !isLeader) {
        return;
    }
    try {
        const response = await fetch("../api/volunteer_api.php?action=get_active_event");
        const result = await response.json();

        if (!result.success) {
            console.error("Error loading events:", result.error);
            const errHtml = `<p class="text-rose-500 text-sm">Failed to load events: ${result.error || 'Unknown error'}</p>`;
            if (leaderContainer) leaderContainer.innerHTML = errHtml;
            if (volunteerContainer) volunteerContainer.innerHTML = errHtml;
            return;
        }

        const events = result.data || [];

        if (events.length === 0) {
            const emptyHtml = `<p class="text-slate-500 italic text-sm">No active events open right now.</p>`;
            if (leaderContainer) leaderContainer.innerHTML = emptyHtml;
            if (volunteerContainer) volunteerContainer.innerHTML = emptyHtml;
            return;
        }

        if (volunteerContainer) {
            let volHtml = `<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">`;
            events.forEach(ev => {
                const maxP = parseInt(ev.max_participation, 10);
                const regCount = parseInt(ev.registered_count, 10);
                const isFull = regCount >= maxP;

                const participateBtn = ev.isRegistered ? `<button disabled data-id="${ev.event_id}" class="flex-1 py-2 px-3 bg-slate-100 text-slate-400 font-semibold rounded-lg text-xs cursor-not-allowed">
                        Already Registered </button>` : isFull ? `<button disabled data-id="${ev.event_id}" class="flex-1 py-2 px-3 bg-rose-50 text-rose-500 border border-rose-200 font-semibold rounded-lg text-xs cursor-not-allowed">
                        Registration full (${regCount}/${maxP}) </button>` : `<button onclick="participateInEvent(this)" data-id="${ev.event_id}" class="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold rounded-lg text-xs shadow-sm transition">
                        Participate Now
                      </button>`;


                volHtml += `
                    <div class="border border-slate-200 rounded-2xl p-5 bg-white shadow-sm flex flex-col justify-between space-y-4">
                        <div class="space-y-2">
                            <div class="flex items-start justify-between gap-2">
                                <h3 class="font-bold text-slate-800 text-base leading-snug truncate" title="${ev.name}">
                                    ${ev.name}
                                </h3>
                                <span class="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                                    ${ev.event_type || 'Event'}
                                </span>
                            </div>
                            <div class="text-xs text-slate-600 space-y-1">
                                <p><strong class="text-slate-700">Date:</strong> ${ev.date}</p>
                                <p><strong class="text-slate-700">Reporting Time:</strong> ${ev.reporting_time || ev.time}</p>
                                <p class="truncate" title="${ev.venue}"><strong class="text-slate-700">Venue:</strong> ${ev.venue}</p>
                            </div>
                        </div>
                        <div class="pt-3 border-t border-slate-100 flex items-center gap-2">
                            ${participateBtn}
                            <button data-id="${ev.event_id}" onclick="openViewEvent(this)" class="py-2 px-3.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg text-xs transition">
                                View
                            </button>
                        </div>
                    </div>`;
            });
            volHtml += `</div>`;
            volunteerContainer.innerHTML = volHtml;
        }

       
        if (leaderContainer) {
          if(user.role === 'Leader'){
            leaderContainer.classList.remove("hidden");}
            let leaderHtml = `<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">`;
            events.forEach(ev => {
              const maxP = parseInt(ev.max_participation, 10);
              const regCount = parseInt(ev.registered_count, 10);
              const isFull = regCount >= maxP;

              const participateBtn = ev.isRegistered ? `<button disabled data-id="${ev.event_id}" class="flex-1 py-2 px-3 bg-slate-100 text-slate-400 font-semibold rounded-lg text-xs cursor-not-allowed">
                        Already Registered </button>` : isFull ? `<button disabled data-id="${ev.event_id}" class="flex-1 py-2 px-3 bg-rose-50 text-rose-500 border border-rose-200 font-semibold rounded-lg text-xs cursor-not-allowed">
                        Registration full</button>` : `<button onclick="participateInEvent(this)" data-id="${ev.event_id}" class="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold rounded-lg text-xs shadow-sm transition">
                        Participate Now
                      </button>`;
                leaderHtml += `
                    <div class="border border-slate-200 rounded-2xl p-5 bg-white shadow-sm flex flex-col justify-between space-y-4">
                        <div class="space-y-2.5">
                            <div class="flex items-start justify-between gap-2">
                                <h3 class="font-bold text-slate-900 text-base leading-snug truncate" title="${ev.name}">
                                    ${ev.name}
                                </h3>
                                <span class="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                                    ${ev.status || 'Active'}
                                </span>
                            </div>

                            <div class="grid grid-cols-2 gap-2 p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-600">
                                <p><span class="font-medium text-slate-400 block uppercase text-[10px]">Date</span>${ev.date}</p>
                                <p><span class="font-medium text-slate-400 block uppercase text-[10px]">Reporting</span>${ev.reporting_time}</p>
                                <p><span class="font-medium text-slate-400 block uppercase text-[10px]">Maximum</span>${ev.max_participation ?? 'N/A'} volunteers</p>
                                <p><span class="font-medium text-slate-400 block uppercase text-[10px]">Est. Hours</span>${ev.approx_hrs ?? 0} hrs</p>
                            </div>
                        </div>

                        
                        <div class="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
                            <button data-id="${ev.event_id}" onclick="open_attendance(this)" class="flex-1 py-1.5 px-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-semibold transition text-center">
                                Attendance
                            </button>
                            ${participateBtn}
                        </div>
                    </div>`;
            });
            leaderHtml += `</div>`;
            leaderContainer.innerHTML = leaderHtml;
        }

    } catch (error) {
        console.error("Fetch error:", error);
    }
}
async function participateInEvent(button){
        const eventID = button.dataset.id;

    if (!confirm("Confirm registration for this event?")) return;

    try {
        const response = await fetch("../api/volunteer_api.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                action: "participate_event", 
                event_id: eventID 
            })
        });

        const result = await response.json();

        if (result.success) {
            alert(result.attendance_no + result.message);
            getEvents(); 
        } else {
            alert("Registration failed: " + result.error);
        }
    } catch (error) {
        console.error("Error submitting registration:", error);
    }
}

function goToFeedback(btn) {
  const eventId = btn.dataset.id;
  if (eventId) {
    window.location.href = `../Feedback/feedback.html?event_id=${eventId}`;
  }
}
// show feedbacks if active and not submitted
async function showFeedbackPendings() {
  const container = document.getElementById('pending_feedback_container');
  if (!container) return;

  try {
    const response = await fetch('../api/volunteer_api.php?action=showfeedbacks');
    const result = await response.json();

    if (!result.success) {
      container.innerHTML = `<p class="text-xs text-red-500 py-3">${result.error || 'Failed to load feedbacks.'}</p>`;
      return;
    }

    const events = result.data || [];

    
    if (events.length === 0) {
      container.innerHTML = `
        <div class="py-4 text-center text-slate-400 text-xs italic">
          No pending feedback for any attended events.
        </div>
      `;
      return;
    }

    let html = '';
    events.forEach(evt => {
      html += `
      <div class="border border-slate-200 rounded-2xl p-5 bg-white shadow-sm space-y-2">
        <div class="card-content">
          <div class="flex flex-col">
            <span class="font-bold text-slate-800 text-xl">${evt.name}</span>
            <span class="text-xs text-slate-500 ">${evt.date || ''} • ${evt.venue || 'Campus'}</span>
          </div>
          <button data-id="${evt.event_id}" onclick="goToFeedback(this)" class="c_btn text-xs py-1.5 px-3">
            Give Feedback</button>
        </div>
        </div>
      `;
    });

    container.innerHTML = html;
  } catch (error) {
    console.error("Error fetching pending feedbacks:", error);
    container.innerHTML = `<p class="text-xs text-red-500 py-3">Network error loading feedback items.</p>`;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  showFeedbackPendings();
});

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

async function openUpdateModal(){
   closeProfileModal()
const modal = document.getElementById('profile_update_modal');
  const prof = document.getElementById('update_fields');
  
    try{
  const response = await fetch('../api/volunteer_api.php?action=get_academic_details');
  const result = await response.json();
    
    let nextClass = "";
    const currentClass = (result.Class || "").toUpperCase().trim();

    if (currentClass === "FY") {
      nextClass = "SY";
    } else if (currentClass === "SY") {
      nextClass = "TY";
    } else {
      alert("Updates not allowed");
      return;
    }
  if(prof){
   prof.innerHTML = `
    <form id="academicUpdateForm" onsubmit="submitAcademicUpdate(event)" class="space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div>
              <label class="text-xs text-slate-400 font-semibold uppercase block mb-1">Student</label>
              <input type="text" value="${result.name}" readonly disabled 
                     class="w-full bg-slate-200 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-700 font-medium cursor-not-allowed">
            </div>

            <div>
              <label class="text-xs text-slate-400 font-semibold uppercase block mb-1">current Class</label>
              <input type="text" id="upd_class" value="${nextClass}" readonly 
                     class="w-full bg-slate-100 border border-slate-300 rounded-lg px-3 py-1.5 text-blue-950 font-bold cursor-not-allowed">
            </div>

            <div>
              <label class="text-xs text-slate-400 font-semibold uppercase block mb-1">Program</label>
              <input type="text" id="upd_program" value="${result.Program}" readonly 
                     class="w-full bg-slate-100 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-700 font-medium cursor-not-allowed">
            </div>

            <div>
              <label class="text-xs text-slate-400 font-semibold uppercase block mb-1">Division</label>
              <select id="upd_division" required class="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-800 font-medium focus:ring-2 focus:ring-blue-900 focus:outline-none">
                <option value="A" ${result.Division === 'A' ? 'selected' : ''}>A</option>
                <option value="B" ${result.Division === 'B' ? 'selected' : ''}>B</option>
                <option value="C" ${result.Division === 'C' ? 'selected' : ''}>C</option>
                <option value="D" ${result.Division === 'D' ? 'selected' : ''}>D</option>
              </select>
            </div>

            <div class="sm:col-span-2">
              <label class="text-xs text-slate-400 font-semibold uppercase block mb-1">Roll Number</label>
              <input type="text" maxlength="3"  id="upd_roll_no" required  placeholder="E.g. 001" 
                     class="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-800 font-medium focus:ring-2 focus:ring-blue-900 focus:outline-none">
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-2">
            <button type="button" onclick="closeUpdateModal()" class="px-4 py-2 text-sm font-semibold rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 transition">
              Cancel
            </button>
            <button type="submit" class="c_btn text-sm py-2 px-5 font-semibold">
              Save Details
            </button>
          </div>
        </form>
      `;
    }

    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }
  }catch(err) {
    console.error("Error loading academic details:", err);
    alert("Could not load your academic details.");
  }
}


function closeUpdateModal(){
  const modal = document.getElementById('profile_update_modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

async function submitAcademicUpdate(e){
  e.preventDefault();
  const nextClass = document.getElementById('upd_class').value;
  const program   = document.getElementById('upd_program').value;
  const division  = document.getElementById('upd_division').value;
  const rollNo    = document.getElementById('upd_roll_no').value.trim();

  if (!rollNo) {
    alert("Please enter a valid Roll Number.");
    return;
  }

  try {
    const res = await fetch('../api/volunteer_api.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'update_academic_details',
        class: nextClass,
        program: program,
        division: division,
        roll_no: rollNo
      })
    });

    const json = await res.json();
    if (json.success) {
      alert("Academic details updated successfully!");
      closeUpdateModal();
      await AcademicUpdateStatus();
    } else {
      alert(json.error || "Update failed");
    }
  } catch (err) {
    console.error("Failed to update academic profile:", err);
    alert("Network error updating profile.");
  }
}

//status of update on button
async function AcademicUpdateStatus(){
  const updateBtn = document.getElementById('academic_update_btn');
  if (!updateBtn) return;

  try {
    
    const [setRes, acadRes] = await Promise.all([
      fetch('../api/settings.php?action=get_registration_status'),
      fetch('../api/volunteer_api.php?action=get_academic_details')
    ]);

    const setData  = await setRes.json();
    const acadData = await acadRes.json();

    const disableButton = (label, title) => {
      updateBtn.disabled = true;
      updateBtn.textContent = label;
      updateBtn.title = title;
      updateBtn.classList.add('opacity-50', 'cursor-not-allowed', 'bg-slate-400');
      updateBtn.classList.remove('cursor-pointer', 'hover:bg-blue-900');

      const notice = document.getElementById("update_notice");
      if (notice) notice.classList.add("hidden");
    };

    if (!setData.success || setData.status !== 'open') {
      disableButton("Updatation Closed", "Academic re-enrollment window is currently closed by the Admin.");
      return;
    }

    
    if (!acadData.success) {
      disableButton("Updatation Unavailable", "Unable to load academic status.");
      return;
    }

    // Already registered for the current year
    if (acadData.already_registered) {
      disableButton("Already Enrolled (" + acadData.target_year + ")", "You have already completed re-enrollment for the current academic year.");
      return;
    }

    //Completed TY
    if (acadData.is_completed) {
      disableButton("Tenure Completed (TY)", "You have completed your final year (TY) in the NSS unit.");
      return;
    }

    showUpdateNotice()
    btn.disabled = false;
    
    btn.textContent = "Academic Update";
    btn.title = "Click to enroll for the upcoming academic year (" + acadData.target_year + ")";
    btn.classList.remove('opacity-50', 'cursor-not-allowed', 'bg-slate-400');
    btn.classList.add('cursor-pointer');
    

  } catch (error) {
    console.error("Failed to check academic updatation status:", error);
    btn.disabled = true;
    btn.classList.add('opacity-50', 'cursor-not-allowed');
  }
}


function showUpdateNotice(){
    const notice = document.getElementById("update_notice");

    notice.classList.remove("hidden");
    notice.classList.add("flex");

    
}

async function logout(){
    try {
    const response = await fetch('../authentication/logout.php', { method: 'POST' });
    const data = await response.json();

    if (data.success) {
      localStorage.removeItem('user');
      sessionStorage.clear();
      window.location.replace('../authentication/index.html');

    }
  } catch (error) {
    console.error('Logout Error:', error);
  }
}
async function openViewEvent(button){
  const container = document.getElementById('view_event_modal');
    const eventId = button.dataset.id;
    try{
    const response = await fetch("../api/volunteer_api.php",{
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ id: eventId,
              action : 'view_event'
             })
        });
    const result = await response.json();

    if(result.success){
      const event = result.data;

      console.log("Fetched status:", `"${event.status}"`);

      let eventHTML = `
      <div  class="w-full max-w-xl mx-auto bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden font-sans">
  
  
  <div class="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
    <div>
      <span class="text-xs font-semibold text-emerald-400 uppercase tracking-wider">${event.status}</span>
      <h2 class="text-xl font-bold">${event.name}</h2>
    </div>
    <span class="text-xs bg-slate-800 text-slate-300 px-3 py-1 rounded-full border border-slate-700">
      ${event.event_type}
    </span>
  </div>

  <div class="p-6 space-y-5">
    
   
    <div class="bg-amber-50 border-l-4 border-amber-500 p-3 rounded-r-xl flex flex-wrap sm:flex-nowrap gap-4 justify-between text-xs text-amber-950">
      <div>
        <p class="font-bold text-amber-800">⏰ Reporting Time</p>
        <p class="text-sm font-semibold">${event.reporting_time}</p>
      </div>
      <div>
        <p class="font-bold text-amber-800">📍 Reporting Venue</p>
        <p class="text-sm font-semibold">${event.reporting_venue}</p>
      </div>
    </div>

    <!-- Description-->
    <div>
      <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Description</h3>
      <p class="text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-xl p-3 leading-relaxed">
        ${event.description?.trim() ? event.description : 'No additional details or instructions provided for this event.'}
      </p>
    </div>

    
    <div class="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden text-sm bg-white">
      <div class="flex justify-between px-4 py-2.5 bg-slate-50/50">
        <span class="text-slate-500 font-medium">Date</span>
        <span class="text-slate-800 font-bold">${event.date}</span>
      </div>
      <div class="flex justify-between px-4 py-2.5">
        <span class="text-slate-500 font-medium">Time</span>
        <span class="text-slate-800 font-bold">${event.time}</span>
      </div>
      <div class="flex justify-between px-4 py-2.5 bg-slate-50/50">
        <span class="text-slate-500 font-medium">Event Venue</span>
        <span class="text-slate-800 font-bold truncate max-w-50">${event.venue}</span>
      </div>
      <div class="flex justify-between px-4 py-2.5">
        <span class="text-slate-500 font-medium">Approx. Hours</span>
        <span class="text-slate-800 font-bold">${event.approx_hrs} hrs</span>
      </div>
      <div class="flex justify-between px-4 py-2.5 bg-slate-50/50">
        <span class="text-slate-500 font-medium">Max Volunteers</span>
        <span class="text-slate-800 font-bold">${event.max_participation}</span>
      </div>
      <div class="flex justify-between px-4 py-2.5">
        <span class="text-slate-500 font-medium">Registered</span>
        <span class="text-slate-800 font-medium">${event.registered ?? 'Not Available'}</span>
      </div>
    </div>

  </div>
  <div class="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
    <button type="button" onclick="closeViewEventModal()" class="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold shadow-sm transition">
      Close
    </button>
  </div>

</div>
      `
      container.innerHTML = eventHTML;
      container.classList.remove("hidden");
      container.classList.add("flex");

    }else{
      alert("Error occured" , result.error);
    }
    }catch(error){
      console.log("Error occured", error);
    } 
}

function closeViewEventModal(){
  const container = document.getElementById('view_event_modal');
    container.classList.add("hidden");
      container.classList.remove("flex");

}

