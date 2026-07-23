
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

function validatepass(event){
    const npass = document.getElementById("newpass");
    const err = document.getElementById("a_setpass");
    
    
    const exp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@.#$!%*?&])[A-Za-z\d@.#$!%*?&]{6,}$/; 
    if(exp.test(npass.value)){
        err.classList.add('hidden');
        return true;
    }
    else{ event.preventDefault();
        err.classList.remove('hidden');
        err.textContent="Password should contain atleast one Capital, digit and Special keyword";
        return false;
    }
}
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
//Rponse registered or not
async function submitform(event, form){
    try{event.preventDefault();
        if (!validatemobile() || !validatepass() || !checkpass()) {
            console.log("Somrthing is wrong");
        return; 
    }
        const formData = new FormData(form);
        const response = await fetch('register.php',{method:'POST', body: formData });
        
        const message = await response.json();

        if(message.success){
            alert("✅Registered Successfully");
            window.location.href = './login.html';
        }
        else if(message.success === false){
            alert('❌Error'+ message.error);
        }

    }
    catch(error){
        alert('Error while Registration'+error);
        window.location.href= 'adminregister.html';
    }
}

//-------------


function validatemobile(event){
    const mobile_no = document.getElementById('a_mobile');
    const errormsg = document.getElementById('error');
    const range = /^[6-9]\d{9}$/;

    if(range.test(mobile_no.value)){
        errormsg.classList.add('hidden');
      errormsg.textContent="";
        
        return true;

    }else{ 
        errormsg.classList.remove('hidden');
        errormsg.textContent="Please Enter valid mobile number!";
        return false;
    }
}


//-------------------LOGIN
async function checklogin(event, form) {
    event.preventDefault();
    try{
        const formData = new FormData(form);
        const response = await fetch('login.php',{method:'POST',body:formData});
         if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const message = await response.json();
       
        if(message.success){
             window.location.href= message.Location;
        }else{
            alert(message.error);
            window.location.href='login.html';
        }
    }catch(error){
        console.log("System Error"+ error);
        
    }
}

    
    
       
    