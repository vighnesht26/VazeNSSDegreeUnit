
document.addEventListener("DOMContentLoaded", ()=>{

let checkboxes = document.querySelectorAll('.checkbox');
checkboxes.forEach((checkbox)=>{
    checkbox.addEventListener('change', function(){
        if(this.checked){
            checkboxes.forEach((box)=>{
                if (box !== this) {
                    box.checked = false;
                }
            });
        }
    });

});




});

function checkpass(event){
    let npass = document.getElementById("newpass");
    let cpass = document.getElementById("cnfpass");
    let msg = document.getElementById("errormsg");

    let password = npass.value;
    let confirmpass = cpass.value;

    if(password !== confirmpass){
        event.preventDefault();
        msg.textContent = "Passwords do not match. Please try again.";
        msg.classList.remove("hidden");
        cpass.classList.add("border-red-500", "focus:ring-red-500");
        
        return false;
    }
    msg.classList.add("hidden");
    cpass.classList.remove("border-green-500", "focus:ring-green-500");
    return true; 

}




    
    
       
    