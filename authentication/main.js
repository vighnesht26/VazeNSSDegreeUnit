
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
// next page
function nextpage(pageid){
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageid).classList.add('active');
}
//NOT WORKING---
// async function submitform(form){
//     try{
//         const response = await fetch('./register.php',{method:'POST', body: form });
//         const message = await response.json();

//         if(message.success){
//             console.log("Registered Successfully");
//             window.location.href = './login.html';
//         }
//         else if(message.success === false){
//             console.log('Error');
//         }

//     }
//     catch(error){
//         console.log('Error while Registration');
//         // window.location.href= 'adminregister.html';
//     }
// }

//-------------
function validatemobile(){
    const mobile_no = document.getElementById('#mobile');
    const errormsg = document.getElementById('#error');

    const range = '/^[6-9]\d{9}$/';

    if(range.test(mobile_no)){
        errormsg.textContent="";
        return true;

    }else{
        errormsg.textContent="Please Enter valid mobile number!";
        return false;
    }
}




    
    
       
    