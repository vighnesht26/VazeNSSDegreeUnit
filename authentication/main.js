
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

function validatepass(inputpass){
    const show_set = document.getElementById("a_setpass");
    
    const val =inputpass.value;
    
    
    if(val.length === 0){
         show_set.classList.add('hidden');
        show_set.textContent="";
        return false;
    }
    if(!/[A-Z]/.test(val)){
        show_set.classList.remove('hidden');
        show_set.textContent="Password should contain atleast one Capital letter";
        return false;
    }
    if(!/\d/.test(val)){
        show_set.classList.remove('hidden');
        show_set.textContent="Password should contain atleast one digit";
        return false;
    }
    if(!/[@.#$!%*?&]/.test(val)){
        show_set.classList.remove('hidden');
        show_set.textContent="Password should contain atleast one special character";
        return false;
    }
    if(!/[a-z]/.test(val)){
        show_set.classList.remove('hidden');
        show_set.textContent="Password should contain atleast one lower letter";
        return false;
    }
    if(val.length < 6){
         show_set.classList.remove('hidden');
        show_set.textContent="Password should conatains atleast 6 letters";
        return false;
    }
    else{ 
        show_set.classList.add('hidden');
        show_set.textContent="";
        return true;
    }
}

function toggleshow(btn){
    const adminpassfield = document.getElementById('newpass');
    if( adminpassfield.type === "password"){
         adminpassfield.type = "text";
        btn.textContent="HIDE";
    }
    else {
        adminpassfield.type = "password";
        btn.textContent="SHOW";
    }
    
    
}
function checkpass(){
    let npass = document.getElementById("newpass");
    let cpass = document.getElementById("cnfpass");
    let msg = document.getElementById("errormsg");
    const err = document.getElementById('a_setpass');
 
    let password = npass.value;
    let confirmpass = cpass.value;

    if(password.length == 0){
        err.classList.remove("hidden");
        
        cpass.classList.add("border-green-500", "focus:ring-green-500");
        err.textContent = "Please Enter Password first to Confirm";
        return false; 
    }
   
    if(confirmpass.length == 0){
        msg.classList.add("hidden");
        cpass.classList.remove("border-green-500", "focus:ring-green-500");
        return false; 
    }
    if(password !== confirmpass){
        
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

        const mobileInput = document.getElementById('a_mobile');
        const passInput   = document.getElementById('newpass');
        const emailInput  = document.getElementById('a_email');

       
        const isMobileValid = validatemobile(mobileInput);
        const isPassValid   = validatepass(passInput);
        const isEmailValid  = validateEmail(emailInput);
        const isConfirmValid = checkpass(); 

        
        if (!isMobileValid || !isPassValid || !isEmailValid || !isConfirmValid) {
            console.log("Validation failed on submission");
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


function validatemobile(inputmobile){

    const errormsg = document.getElementById('errormobile');
    const range = /^[6-9]\d{9}$/;

    inputmobile.value = inputmobile.value.replace(/\D/g, '');

    const val = inputmobile.value;

    if(val.length === 0){
        errormsg.classList.add('hidden');
        errormsg.textContent="";
        return true;
    }
    if(!/^[6-9]/.test(val)){
        errormsg.classList.remove('hidden');
        errormsg.textContent="Mobile number must start with 6,7,8 or 9";
        return false;
    }
    if (val.length < 10) {
        errormsg.classList.remove('hidden');
        errormsg.textContent = `Entering number... (${val.length}/10 digits)`;
        return false;
    }
    if(range.test(val)){
        errormsg.classList.add('hidden');
      errormsg.textContent="";
        
        return true;

    }else{ 
        errormsg.classList.remove('hidden');
        errormsg.textContent="Please Enter 10 digit valid mobile number!";
        return false;
    }
}

function validatename(inputname){
        const errormsg = document.getElementById('errorname');
        inputname.value = inputname.value.replace(/\s/g, '');
        inputname.value = inputname.value.replace(/[^A-Za-z]/g, '');

        const val = inputname.value;

        if(val.length ===0){
            errormsg.classList.add('hidden');
            errormsg.textContent = '';
            return false;
        }
        errormsg.classList.add('hidden');
        return true;
}

function validateEmail(inputemail){
            const errormsg = document.getElementById('erroremail');
            inputemail.value = inputemail.value.replace(/\s/g,'');

            const emailexp = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[a-zA-z]{2,}$/;
            const val = inputemail.value;

            if(val.length === 0){
                errormsg.classList.add('hidden');
                errormsg.textContent = '';
                return false;
            }

            if(!emailexp.test(val)){
                 errormsg.classList.remove('hidden');
                errormsg.textContent = 'Please enter valid email address';
                return false;
            }
            else{
                 errormsg.classList.add('hidden');
                errormsg.textContent = '';
                return true;
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
             window.location.href= message.location;
        }else{
            alert(message.error);
            
        }
    }catch(error){
        console.log("System Error"+ error);
        
    }
}

    
    
       
    