

document.addEventListener("DOMContentLoaded", () => {
    fetchAdminProfile();
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


async function fetchAdminProfile() {
    console.log("c1 RUNNED");
    try {
        console.log("c2 RUNNED");
        const response = await fetch('../config/api.php');
        const data = await response.json();
        console.log("c3 RUNNED");
        
        if (data.success) {
            console.log("c4 RUNNED");
            
            // 1. Define the elements first
            const nameElement = document.getElementById('name_display');
            const roleElement = document.getElementById('role_display');

            // 2. Safely check and update the name container
            if (nameElement) {
                nameElement.textContent = data.name;
            } else {
                console.warn("Warning: HTML element with id 'name-display' was not found on this page.");
            }

            // 3. Safely check and update the role container
            if (roleElement) {
                roleElement.textContent = data.role;
            } else {
                console.warn("Warning: HTML element with id 'role-display' was not found on this page.");
            }

        } else {
            console.log("c5 RUNNED");
            window.location.href = '../Authentication/login.html';
        }
    } catch (error) { 
        console.log("c6 RUNNED");
        console.error("Failed to parse session profile data:", error);
    }
}