let isUpcomingLoaded = false;
let isCompletedLoaded = false;

 //Registrations
function updateStatusColor(selectElement) {
 
  selectElement.classList.remove('text-dorg','text-yellow-700','text-green-700',  'text-gray-600', 'text-red-800');
  
 
  const colorMap = {
    'Tentative':'text-dorg',
    'Scheduled': 'text-yellow-700',
    'Active': 'text-green-700',
    'Completed': 'text-gray-600',
    'Cancelled': 'text-red-800'
  };
  
  
  const selectedColor = colorMap[selectElement.value];
  if (selectedColor) {
    selectElement.classList.add(selectedColor);
  }
}

function datevalidate(){
  const eventDate = document.getElementById('Date');

const err = document.getElementById('errordate');
if (!eventDate) return;
const today = new Date();
const yyyy = today.getFullYear();
const mm = String(today.getMonth() + 1).padStart(2, '0');
const dd = String(today.getDate()).padStart(2, '0');
const fdate = `${yyyy}-${mm}-${dd}`;

eventDate.min = fdate;

//max date will be no event can register after april of next year
let maxyear = yyyy;
const month = today.getMonth();
if(month > 3){
  maxyear = yyyy +1;

}
else{
  maxyear =yyyy;
}

let maxDate = `${maxyear}-04-30`;
eventDate.max = maxDate;

eventDate.addEventListener('blur', function(){
  const userDate = eventDate.value;

  if(userDate < fdate && userDate !== ''){
    err.classList.remove('hidden');
    err.textContent = "Past dates are not allowed";
    eventDate.value = '';
  }
  else if(userDate > maxDate){
    err.classList.remove('hidden');
    err.textContent = "Date must be between June to April of this academic year";
    eventDate.value = '';
  }
  else{
    err.classList.add('hidden');
    err.textContent = '';

  }
});
}
const rtPicker = flatpickr('#RT', {
  enableTime: true,
  noCalendar: true,
  dateFormat: "h:i K",
  minTime: "05:00",
  disableMobile: true
}); 
flatpickr('#e_time',{
  enableTime : true,
  noCalendar: true,
  dateFormat: "h:i K",
  minTime: "05:00",
  maxTime:"17:00",
  disableMobile:true,
  
  allowInput: false,
  onChange: function(selectedDates, dateStr, instance) {
    const err = document.getElementById("errortime");
    if (!selectedDates.length) {
      err.classList.add("hidden");
      err.textContent = "";
      return;
    }
    const hours = selectedDates[0].getHours();
    const minutes = selectedDates[0].getMinutes();
    const totalMinutes = hours * 60 + minutes;
    if (totalMinutes < 300 || totalMinutes > 1020) {
      err.classList.remove("hidden");
      err.textContent = "Please select a time between 05:00 AM and 05:00 PM.";

      instance.setDate("07:00", false, "H:i");
    } else {
      err.classList.add("hidden");
      err.textContent = "";
    }

    if (selectedDates.length > 0) {
      const hours = String(selectedDates[0].getHours()).padStart(2, '0');
      const minutes = String(selectedDates[0].getMinutes()).padStart(2, '0');
      const formatted24h = `${hours}:${minutes}`;

      rtPicker.set('maxTime', formatted24h);

      if (rtPicker.selectedDates.length > 0 && rtPicker.selectedDates[0] >= selectedDates[0]) {
        rtPicker.clear();
      }
    } else {
      rtPicker.set('maxTime', null);
    }
  }
});


function checkApHr(){
  const hr = document.getElementById("Ah");
  const err = document.getElementById("errorh");

  if(hr.length == 0){
    hr.value = 1;
    err.classList.add("hidden");
  }

  if(hr.value >12 || hr.value < 1){
    err.textContent = "Approx hours cannot be less than 1 and greater than 12";
    err.classList.remove("hidden");
    hr.value = "";
  }else{
    err.textContent = "";
    err.classList.add("hidden");
  }
}
function checkmx(){
  const hr = document.getElementById("MP");
  const err = document.getElementById("errormx");

  

  if(hr.value >300 || hr.value < 2){
    err.textContent = "Approx hours cannot be less than 2 and greater than 300";
    err.classList.remove("hidden");
    hr.value = "";
  }else{
    err.textContent = "";
    err.classList.add("hidden");
  }
}

//Submit
async function submitEventData(event , form){
  
  try{event.preventDefault();
    const formdata = new FormData(form);
    const response = await fetch('registerevent.php',{method : 'POST', body :formdata});
    const result = await response.json();

    if(result.success){
      alert("✔️ Event Registered Successfully");
      window.location.href = result.location;
    }
    else{
      alert("❌ Error" + result.error);

    }
  }
  catch(error){
    console.log('Network Error',error);
  }

  
}

document.addEventListener('DOMContentLoaded', function() {
    datevalidate();
});


//Admin/Leader dashboards

async function displayeventcard() {

  
    try{
        const response = await fetch('../api/event_api.php?action=dash_event');
        console.log("step1");
        if(!response.ok){
            throw new Error(`Error status: ${response.status}`);

        }
        console.log("step2");
        const data = await response.json();
         console.log("excecuted");
        if(!data.success){
            console.log(data.error);
            return;
        }

        
        if(data.active){console.log("step4");

            currentActiveEventId = data.active.event_id || data.active.id;
            document.getElementById('ename').textContent= data.active.name;
            document.getElementById('edate').textContent= data.active.date;
            document.getElementById('etype').textContent= data.active.event_type;
            document.getElementById('eMP').textContent= data.active.max_participation;
            
            const attendanceBtn = document.getElementById('btn_active_attendance');
            if (attendanceBtn) {
                attendanceBtn.dataset.id = data.active.event_id;
                attendanceBtn.disabled = false;
                attendanceBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            }
        }else{
             document.getElementById('ename').textContent= 'None';
            document.getElementById('edate').textContent= 'None';
            document.getElementById('etype').textContent= 'None';
            document.getElementById('eMP').textContent= 'None';
          

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
             document.getElementById('e_total').textContent = 'None';
        }

    }catch(error){
        console.log(error);
    }
  }


async function loadUpcomingEvents() {
  const container = document.getElementById("u_event");
  
  try {
    const response = await fetch("../api/event_api.php?action=show_upcoming_events");
    const result = await response.json();

    if (result.success) {
      isUpcomingLoaded = true;
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
        const statusClass = getStatusColor(ev.status);
        const statusLower = ev.status ? ev.status.toLowerCase() : '';
        const isCan = statusLower != 'cancelled';
        const disabledAttr = isCan ? '' : 'disabled';
        const disabledClasses = isCan ? '' : 'opacity-50 cursor-not-allowed pointer-events-none !bg-gray-400 !text-gray-700';
        cardsHTML += `
          <div class="event-card  border border-slate-200 rounded-2xl p-5 bg-white shadow-sm space-y-2">
            <p class="text-sm font-semibold text-slate-700">Event Name: <span class="font-bold text-blue-950">${ev.name}</span></p>
            <p class="text-sm font-semibold text-slate-700">Date: <span class="font-bold text-blue-950">${ev.date}</span></p>
            <p class="text-sm font-semibold text-slate-700">Type: <span class="font-bold text-blue-950">${ev.event_type}</span></p>
            <p class="text-sm font-semibold text-slate-700">Venue: <span class="font-bold text-blue-950">${ev.venue}</span></p>
            <p class="text-sm font-semibold text-slate-700">Status:<span class="font-bold uppercase text-xs px-2.5 py-1 ${statusClass}  rounded-full">${ev.status}</span>
            </p>
            <div class="flex justify-between">
            <button onclick="openEditModal(this)" data-id="${ev.event_id}"
              data-name="${ev.name}"
              data-date="${ev.date}"
              data-type="${ev.event_type}"
              data-venue="${ev.venue}"
              data-status="${ev.status}" ${disabledAttr} class="c_btn ${disabledClasses}">Update</button>
            <button type=" button" class="c_btn_blue  "  data-id="${ev.event_id}" onclick="viewEvent(this)"> view </button>
            </div>
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

function getStatusColor(statusStr) {
  const status = statusStr ? statusStr.trim().toLowerCase() : '';

  switch (status) {
    case 'active':
      return 'bg-emerald-100 text-emerald-800 border border-emerald-300';
    case 'cancelled':
      return 'bg-red-100 text-red-800 border border-red-300';
    case 'scheduled':
    case 'upcoming':
      return 'bg-blue-100 text-blue-800 border border-blue-300';
    case 'completed':
      return 'bg-purple-100 text-purple-800 border border-purple-300';
    default:
      return 'bg-amber-100 text-amber-800 border border-amber-300';
  }
}

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
    action : "update_event",
    id: document.getElementById("edit_id").value,
    date: document.getElementById("edit_date").value,
    event_type: document.getElementById("edit_type").value,
    venue: document.getElementById("edit_venue").value,
    status: document.getElementById("edit_status").value
    
  };

  try {
    const response = await fetch("../api/event_api.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedData)
    });

    const result = await response.json();

    if (result.success) {
      closeEditModal();
      isUpcomingLoaded = false;
      loadUpcomingEvents(); 
    } else {
      alert("Error updating event: " + (result.error || "Unknown error"));
    }
  } catch (error) {
    console.error("Error submitting update:", error);
  }
}
// EVENT SECTION VIEW/START/STOP
async function viewEvent(button){
    const container = document.getElementById('event_modal');
    const eventId = button.dataset.id;
    try{
    const response = await fetch("../api/event_api.php",{
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

      const statusLower = event.status ? event.status.toLowerCase() : '';
      const isActive = statusLower === 'scheduled' || statusLower === 'active';
      const disabledAttr = isActive ? '' : 'disabled';
      const disabledClasses = isActive ? '' : 'opacity-50 cursor-not-allowed pointer-events-none !bg-gray-400 !text-gray-700';

      let eventHTML = `
      <div class="w-full bg-gray-300 border-2 h-full rounded-2xl">
    <div class="border-b-2 border-black h-15 flex justify-center pt-5 font-header text-3xl font-bold">
      <div  class="bg-gray-400 w-150 flex justify-center rounded-2xl"><span>${event.name} </span></div>
      
    </div>
    <div class="flex justify-evenly font-bold font-header">
      <div><label>Date :-</label><span class="bg-gray-400">${event.date}</span></div>
      <div><label>Time :-</label><span class="bg-gray-400">${event.time}</span></div>
      <div><label>Venue :-</label><span class="bg-gray-400">${event.venue}</span></div>
    </div>
    <div class="flex justify-center">
      <textarea disabled rows="4" class="resize-none font-header rows-4 bg-gray-400 rounded-2xl  mt-5 h-35 w-250 p-3">${event.description}</textarea>
    </div>
    <div class="flex justify-evenly font-header mt-10">
      <div><label>⏰Reporting Time :-</label><span class="bg-gray-400">${event.reporting_time}</span></div>
      <div><label>📍Reporting Location :-</label><span class="bg-gray-400">${event.reporting_venue}</span></div>
    </div>
    <div class="flex justify-evenly font-header mt-10">
      <div><label>Type :-</label><span class="bg-gray-400">${event.event_type}</span></div>
      <div><label>Approx hours :-</label><span class="bg-gray-400">${event.approx_hrs}</span></div>
      <div><label>Max Participation :-</label><span class="bg-gray-400">${event.max_participation}</span></div>
      
      
    </div>
    <div class="flex justify-evenly font-header mt-10">
      <div><label>Status :-</label><span class="bg-gray-400">${event.status}</span></div>
      <div><label>Count :-</label><span class="bg-gray-400">Not Available</span></div>
    </div>
    <div class="flex justify-evenly mt-2 border-t rounded-2xl border-t-gray-700 pt-2">
      <button ${disabledAttr} class="c_btn ${disabledClasses}" data-id="${event.event_id}" data-status="${event.status}" onclick="startEventReg(this)">Start Registration</button>
      <button  ${disabledAttr} class="c_btn_blue ${disabledClasses}" data-id="${event.event_id}" data-status="${event.status}" onclick = "stopEventReg(this)">Stop Registration</button>
      <button ${disabledAttr} class="c_btn ${disabledClasses}" data-id="${event.event_id}" onclick="open_attendance(this)">Attendance</button>
      <div class=" rounded-2xl bg-slate-50 border-t border-slate-100 flex justify-end">
      <button type="button" onclick="closeEventModal()" class="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-sm font-semibold transition">
        Close
      </button>
    </div>
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

function closeEventModal(){
  const container = document.getElementById('event_modal');
    container.classList.add("hidden");
      container.classList.remove("flex");

}

//Registration of participants start/stop
async function startEventReg(ev){
  const eventId = ev.dataset.id;
  const eventStatus = ev.dataset.status;


  if(!eventId){
    console.error("Missing event ID.");
        return;
  }
  if(eventStatus === "Active"){
    alert("Registration already started");
    return;
  }
  if (!confirm("Are you sure you want to start registration for this event?")) {
        return;
    }

    try{
      const response = await fetch("../api/event_api.php", {
        method : "POST",
          headers :{
            "Content-Type":"application/json"
          },
          
          body : JSON.stringify({id : eventId,
            action : 'start_event_registration'
          })
      });
      const result = await response.json();

      if(result.success){
        alert("Registration started successfully! Event is now active." + result.action);
            
           
                viewEvent(ev);
        
            
                loadUpcomingEvents();
            
        } else {
            alert("Failed to start registration: " + result.error);
        }
    } catch (error) {
        console.error("Error starting registration:", error);
    }
}

async function stopEventReg(ev){
    const eventId = ev.dataset.id;
    const eventStatus = ev.dataset.status;

    if(eventStatus === "Active"){
      if(!confirm("Are you sure, you want to stop registration?")){
        return;
      }
      
    }else{
        alert("Event Registration not started yet");
        return;
      }

    

    try{
      const response = await fetch("../api/event_api.php", {
        method : "POST",
          headers :{
            "Content-Type":"application/json"
          },
          
          body : JSON.stringify({id : eventId,
            action : 'stop_event_registration'
          })
      });
      const result = await response.json();

      if(result.success){
        alert("Registration stopped successfully! Event is now Scheduled."+ result.action);
            
           
                viewEvent(ev);
        
                isUpcomingLoaded = false;
                loadUpcomingEvents();
            
        } else {
            alert("Failed to start registration: " + result.error);
        }
    } catch (error) {
        console.error("Error starting registration:", error);
    }
}

function open_attendance(ev){
  const eventId = ev.dataset.id;

    if (!eventId) {
        console.error("Missing event ID on element:", ev);
        alert("Unable to open attendance: Missing Event ID.");
        return;
    }

    
    window.location.href = `../Attendance/attendance.html?event_id=${eventId}`;
}


//Export Student List
async function exportStudentList(){
  window.location.href = '../api/export_list.php?action=export_std_list';
}

//Load Completed Events(Allocate hrs, report status)
async function loadCompletedEvents(){
  const container = document.getElementById('c_event');

  try {
    const response = await fetch("../api/event_api.php?action=show_completed_events");
    const result = await response.json();

    if (result.success) {
      isCompletedLoaded = true;
      const events = result.data;

      
      if (events.length === 0) {
        container.innerHTML = `
          <h2 class="font-header  font-bold text-slate-800 border-b-2 border-slate-200 pb-3 mb-2">
            Completed Events
          </h2>
          <p class="text-slate-500 italic">No pending or upcoming events found.</p>
        `;
        return;
      }

      
      let cardsHTML = `
        <div class="border-b-2 border-slate-200 pb-2 mb-2 flex"  >
          <h2 class="font-header text-2xl font-bold text-slate-800 w-120">
            Completed Events :- <span class="text-red-600">${events.length}</span>
          </h2>

          <button type="button" class="c_btn_blue" onclick="exportComEventList()">Export List</button>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 max-h-[70vh] overflow-y-auto  p-2">
      `;

     
      events.forEach(ev => {
        const statusClass = getStatusColor(ev.report_status);
        const repStatus = (ev.report_status || '').toLowerCase().trim();
        const hideView = (repStatus === 'pending') ? '!hidden' : '';
        const hideAdd = (repStatus === 'pending') ? '' : '!hidden';

        const hrs = parseFloat(ev.alloted_hrs) || 0;
        const DispHrs = hrs > 0 ? '' : 'hidden';
        const DispHrsBtn = hrs === 0 ? '' : '!hidden';

        cardsHTML += `
          <div class="event-card  border border-slate-200 rounded-2xl p-5 bg-white shadow-sm space-y-2">
            <p class="text-sm font-semibold text-slate-700">Event Name: <span class="font-bold text-blue-950">${ev.name}</span></p>
            <p class="text-sm font-semibold text-slate-700">Date: <span class="font-bold text-blue-950">${ev.date}</span></p>
            <p class="text-sm font-semibold text-slate-700">Type: <span class="font-bold text-blue-950">${ev.event_type}</span></p>
            <p class="text-sm font-semibold text-slate-700">Venue: <span class="font-bold text-blue-950">${ev.venue}</span></p>
            <p class="text-sm font-semibold text-slate-700">Total: <span class="font-bold text-blue-950">${ev.total_attendees}</span><span>  |Male: <span class="font-bold text-blue-950">${ev.male_count}</span></span><span>  |Female: <span class="font-bold text-blue-950">${ev.female_count}</span></span></p>

            <p class="text-sm font-semibold text-slate-700">Report Status:<span class="font-bold uppercase text-xs px-2.5 py-1 ${statusClass}  rounded-full">${ev.report_status}</span>
            </p>
            <p class="${DispHrs} text-sm font-semibold text-slate-700">Hours Alloted:<span class="font-bold  text-xs px-2.5 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full ">${ev.alloted_hrs}</span>
            </p>
            <div class="flex justify-between"> 
            <button type="button"  class="c_btn ${hideAdd}"  data-id="${ev.event_id}" data-name="${ev.name}" data-date="${ev.date}" onclick="openReportModal(this)">Add Report</button>
            <button type="button"  class="c_btn_blue ${hideView}"  data-id="${ev.event_id}" onclick="viewReport(this)">view Report</button>
            <button type="button"  class="c_btn_blue ${DispHrsBtn}"  data-id="${ev.event_id}" data-hrs="${ev.alloted_hrs}" onclick="allocate_hrs_modal(this)">Allocate Hours</button>
            <button type="button" class="c_btn" data-id="${ev.event_id}" onclick="open_attendance(this)">Attendance</button>
            <button type="button" class="c_btn" data-id="${ev.event_id}" onclick="more(this)">More</button>
            </div>
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

//export cmpleted event list
async function exportComEventList(){
  window.location.href = '../api/export_list.php?action=export_c_event_list';
}

//hours allocation
function allocate_hrs_modal(ev){
  const eventId = ev.dataset.id;
  const eventHrs = ev.dataset.hrs;
  const container = document.getElementById('hrs_allocate_modal');

  
  const isAlloted = parseFloat(eventHrs) > 0.0;
  const BtnClass = isAlloted ? 'c_DisBtn' : 'c_btn';
  const dis = isAlloted ? 'disabled' : '';
  
 
  
    container.innerHTML = `
    <div class="border border-slate-200 rounded-2xl p-5 bg-white shadow-sm w-100">
    <div >
    <Label class="font-bold font-header">Enter Hours :</Label>
    <input  id="hrs" ${dis} type="number" step="0.5" min="1" max="12" class="w-30 pl-3 border border-red-500 rounded-2xl bg-gray-400">
  </div>
  <div class="flex justify-evenly mt-5">
    <button   class="${BtnClass}" onclick="allocate_hours(this)" data-id=${eventId}>${isAlloted ? 'Alloted' : 'Confirm'}</button>
    <button type="button" class="c_btn_light" onclick="close_hrs_modal()">Cancle</button>
  </div>
  </div>`
  document.getElementById("hrs").value = eventHrs;
  container.classList.remove('hidden');
  container.classList.add('flex');
}
function close_hrs_modal(){
  const container = document.getElementById('hrs_allocate_modal');
  container.classList.add('hidden');
  container.classList.remove('flex');
}

async function allocate_hours(ev){
  
  const eventId = ev.dataset.id;
  const hrs = document.getElementById('hrs').value;
  if(hrs < 1.0 || hrs > 12.0){
    alert("Hrs not allowed, Please enter valid hours between 1 to 12 hrs");
    return;
  }
  if ((hrs * 2) % 1 !== 0) {
  alert("Invalid format! Hours must end in .0 or .5 (e.g., 1.0, 1.5, 2.0).");
  return;
}
  if(!confirm("Are you sure, you want to allocate this hour?")){
    return;
  }
try{
  const response = await fetch('../api/event_api.php',{
    method : 'POST',
    headers : {
      "Content-type" : "application/json"
    },
    body : JSON.stringify({
      id:eventId,
      hrs : hrs,
      action:'hrs_allocation'
    })
  });

  const result = await response.json();

  if(result.success){
    alert("Allocation successfull");
    isCompletedLoaded = false;
    close_hrs_modal()
    loadCompletedEvents();
  }
  else{
    alert("Error"+result.error);
  }
}catch(error){
   alert("Network error fetching upcoming events:"+error);
}
}

//  More" Modal 
async function more(button) {
  const eventId = button.dataset.id;
  const modal = document.getElementById('more_modal');
  if (!modal) return;

  modal.dataset.id = eventId;
  const container = document.getElementById('more_modal_content');
  container.innerHTML = `<div class="p-6 text-center text-slate-400 text-sm">Checking event feedback details...</div>`;
  modal.classList.remove('hidden');
  modal.classList.add('flex');

  try {
    const response = await fetch(`../api/event_api.php?action=get_event_feedback_summary&id=${eventId}`);
    const result = await response.json();

    if (!result.success) {
      container.innerHTML = `<p class="p-4 text-xs text-red-500 text-center">${result.error || 'Failed to load details.'}</p>`;
      return;
    }

    const { feedback_status, total_responses, total_attendees } = result.data;
    const isCompleted = parseInt(total_responses) > 0;

    container.innerHTML = `
      <div class="border border-slate-200 rounded-2xl p-6 bg-white shadow-xl max-w-md w-full space-y-4">
        <div class="border-b border-slate-100 pb-3 flex justify-between items-center">
          <h3 class="font-header text-lg font-bold text-slate-800">Event Feedback Options</h3>
          <span class="text-xs px-2.5 py-0.5 rounded-full font-semibold ${getStatusColor(feedback_status)}">
            ${feedback_status}
          </span>
        </div>

        <div class="text-xs text-slate-600 space-y-1">
          <p><strong>Total Attendees:</strong> ${total_attendees}</p>
          <p><strong>Submissions Received:</strong> ${total_responses}</p>
        </div>

        <div class="flex flex-col gap-2 pt-2">
          <!-- Button 1: Add Questions -->
          <button type="button" class="c_btn w-full" onclick="openAddQuestionModal(${eventId})">
            ➕ Add Feedback Questions
          </button>

          <!-- Button 2: Toggle Feedback Active/Closed -->
          <button type="button" class="c_btn_outline w-full" onclick="toggleFeedbackState(${eventId}, '${feedback_status}')">
            ${feedback_status === 'Active' ? '⏸ Close Feedback Submissions' : '▶ Set Feedback Active'}
          </button>

          <!-- Button 3: Show Responses (Enabled only if responses exist) -->
          ${
            isCompleted
              ? `<button type="button" class="c_btn_blue w-full" onclick="openViewResponsesModal(${eventId})">
                   📋 View Volunteer Responses (${total_responses})
                 </button>`
              : `<button type="button" disabled class="c_DisBtn w-full">
                   No Responses Yet
                 </button>`
          }
        </div>

        <div class="pt-3 border-t border-slate-100 flex justify-end">
          <button type="button" onclick="closeMoreModal()" class="c_btn_light">Close</button>
        </div>
      </div>
    `;
  } catch (err) {
    console.error("Error fetching event feedback summary:", err);
    container.innerHTML = `<p class="p-4 text-xs text-red-500 text-center">Failed to connect to server.</p>`;
  }
}

function closeMoreModal() {
  const modal = document.getElementById('more_modal');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
}

//  Add Feedback Question 
function openAddQuestionModal(eventId) {
  closeMoreModal();
  const modal = document.getElementById('add_question_modal');
  document.getElementById('q_event_id').value = eventId;
  document.getElementById('q_text').value = '';
  document.getElementById('q_type').value = 'text';

  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

function closeAddQuestionModal() {
  const modal = document.getElementById('add_question_modal');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
}

async function handleAddQuestion(e) {
  e.preventDefault();
  const eventId = document.getElementById('q_event_id').value;
  const question = document.getElementById('q_text').value.trim();
  const q_type = document.getElementById('q_type').value;

  if (!question) {
    alert("Please enter question text.");
    return;
  }

  try {
    const response = await fetch('../api/event_api.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'add_feedback_question',
        event_id: eventId,
        question: question,
        q_type: q_type
      })
    });

    const result = await response.json();
    if (result.success) {
      alert("Feedback question added successfully!");
      closeAddQuestionModal();
    } else {
      alert("Error: " + (result.error || "Failed to add question."));
    }
  } catch (err) {
    console.error("Submission failed:", err);
  }
}

//  Feedback Status
async function toggleFeedbackState(eventId, currentStatus) {
  const nextStatus = currentStatus === 'Active' ? 'Closed' : 'Active';
  if (!confirm(`Are you sure you want to change feedback status to "${nextStatus}"?`)) return;

  try {
    const response = await fetch('../api/event_api.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'toggle_feedback_status',
        id: eventId,
        status: nextStatus
      })
    });
    const result = await response.json();

    if (result.success) {
      alert(result.message);
      closeMoreModal();
      loadCompletedEvents();
    } else {
      alert("Error: " + result.error);
    }
  } catch (err) {
    console.error(err);
  }
}

//  View Responses 
async function openViewResponsesModal(eventId) {
  closeMoreModal();
  const modal = document.getElementById('view_responses_modal');
  const tableContainer = document.getElementById('responses_table_container');
  tableContainer.innerHTML = `<div class="p-8 text-center text-slate-400">Loading submitted responses...</div>`;

  modal.classList.remove('hidden');
  modal.classList.add('flex');

  try {
    const response = await fetch(`../api/event_api.php?action=get_event_responses&id=${eventId}`);
    const result = await response.json();

    if (!result.success) {
      tableContainer.innerHTML = `<p class="p-4 text-red-500 text-center text-sm">${result.error}</p>`;
      return;
    }

    const { questions, students } = result.data;

    if (!students || students.length === 0) {
      tableContainer.innerHTML = `<p class="p-6 text-center text-slate-400 italic">No completed responses found.</p>`;
      return;
    }

    
    let html = `
      <div class="overflow-x-auto max-h-[65vh]">
        <table class="w-full text-left text-xs border-collapse">
          <thead class="bg-slate-800 text-white font-header sticky top-0">
            <tr>
              <th class="p-3 border border-slate-700">Student Name</th>
              <th class="p-3 border border-slate-700">Roll No</th>
              ${questions.map(q => `<th class="p-3 border border-slate-700 min-w-[160px]">${q.question}</th>`).join('')}
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 bg-white text-slate-700">
    `;

    students.forEach(st => {
      html += `
        <tr class="hover:bg-slate-50 transition">
          <td class="p-3 font-semibold text-slate-900 border border-slate-200">${st.first_name} ${st.surname}</td>
          <td class="p-3 border border-slate-200">${st.roll_no || '--'}</td>
          ${questions.map(q => {
            const answer = st.answers[q.q_id] || '<span class="italic text-slate-300">N/A</span>';
            return `<td class="p-3 border border-slate-200">${answer}</td>`;
          }).join('')}
        </tr>
      `;
    });

    html += `</tbody></table></div>`;
    tableContainer.innerHTML = html;
  } catch (err) {
    console.error(err);
    tableContainer.innerHTML = `<p class="p-4 text-red-500 text-center text-sm">Failed to load responses.</p>`;
  }
}

function closeViewResponsesModal() {
  const modal = document.getElementById('view_responses_modal');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
}