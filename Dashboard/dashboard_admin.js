

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

            
            if (sessionData.success && (sessionData.role === 'programme officer' ||sessionData.role === "NSS commitee" || sessionData.role === 'leader')) {
                console.log("Access Granted. Proceeding to add event...");
                window.location.href = '../Event/registerevent.html';
              
            } else {
                alert("Unauthorized: Only Admins and Leaders can add events.");
                //window.location.href = '../Authentication/login.html';
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
           
            
            
            const nameElement = document.getElementById('name_display');
            const roleElement = document.getElementById('role_display');
            const usernameElement = document.getElementById('username_display');

           
            if (nameElement) {
                console.log("name RUNNED");
                nameElement.textContent = data.name;
            } 

            if (roleElement) {
                console.log("role RUNNED");
                roleElement.textContent = data.role;
            }

            if(usernameElement){
                console.log("username RUNNED");
                usernameElement.textContent = data.ausername;
            }   
        } else {
            
            window.location.href = '../Authentication/login.html';
        }
    } catch (error) { 
        
        console.error("Failed to parse session profile data:", error);
    }
}

//Display Event in dashboard1
async function displayeventcard() {
    try{
        const response = await fetch('../config/dash_event.php');
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

    }catch(error){
        console.log(error);
    }
}
