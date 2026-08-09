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
});