async function fetchStudentProfile() {
  
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
        } 
        else {
            localStorage.removeItem('user');
            window.location.href = '../authentication/login.html';
        }
    } catch (error) { 
        
        console.error("Failed to parse session profile data:", error);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    fetchStudentProfile();
    getEvents();
});

//active events load
async function getEvents(){
    const container = document.getElementById("active_events_container");

    try {
        const response = await fetch("../api/volunteer_api.php?action=get_active_event");
        const result = await response.json();

        if (result.success) {
            const events = result.data;
            if (events.length === 0) {
                container.innerHTML = `<p class="text-slate-500 italic">No active events open right now.</p>`;
                return;
            }

            let html = `<div class="grid grid-cols-1 md:grid-cols-3 gap-4">`;
            events.forEach(ev => {
                
                html += `
                <div class="border border-slate-200 rounded-2xl p-5 bg-white shadow-sm space-y-2">
                    <h3 class="font-bold text-slate-800">${ev.name}</h3>
                    <p class="text-sm text-slate-600"><strong>Date:</strong> ${ev.date}</p>
                    <p class="text-sm text-slate-600"><strong>Reporting time:</strong> ${ev.reporting_time}</p>
                    <p class="text-sm text-slate-600"><strong>Venue:</strong> ${ev.venue}</p>
                    <div class="pt-2 flex justify-evenly">
                         
                            <button onclick="participateInEvent(this)" data-id="${ev.event_id}" class="c_btn ">
                                Participate Now
                            </button>
                            <button class="c_btn_blue"> view<button>
                        
                    </div>
                </div>`;
            });
            html += `</div>`;
            container.innerHTML = html;
        } else {
            console.error("Error loading events:", result.error);
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
                action: "register_event", 
                event_id: eventID 
            })
        });

        const result = await response.json();

        if (result.success) {
            alert("Successfully registered!");
            loadActiveEvents(); 
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
