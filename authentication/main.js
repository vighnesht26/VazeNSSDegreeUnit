


function validatepass(inputpass){
    if(inputpass.id === 'newpass'){
    var show_set = document.getElementById("a_setpass");
    }
    else if(inputpass.id === 's_newpass'){
        var show_set = document.getElementById("s_setpass");
    }
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

//DONE
function toggleshow(btn){
    if(btn.id=== 'passbtn'){
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
    else if(btn.id === 's_passbtn'){
        const stdpassfield =document.getElementById('s_newpass');
        if(stdpassfield.type === "password"){
            stdpassfield.type = "text";
            btn.textContent="HIDE";
        }
        else{
            stdpassfield.type = "password";
            btn.textContent="SHOW";
        }
        
    }
}

//DONE
function checkpass(cnfpass){
    if(cnfpass.id === 'cnfpass'){
    var npass = document.getElementById("newpass");
    var cpass = document.getElementById("cnfpass");
    var msg = document.getElementById("errormsg");
    var err = document.getElementById('a_setpass');
    }
    else if(cnfpass.id === 's_cnfpass'){
        var npass = document.getElementById("s_newpass");
        var cpass = document.getElementById("s_cnfpass");
        var msg = document.getElementById("s_errorpasswd");
        var err = document.getElementById('s_setpass');
    }
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
function validnext(pageid){
        const name = document.getElementById('name');
         const fname = document.getElementById('f_name');
          const mname = document.getElementById('m_name');
           const sname = document.getElementById('s_name');
        const mobile  = document.getElementById('s_mobile');
        const email = document.getElementById('s_email');
         const dob = document.getElementById('s_DOB');
         const gender = document.getElementById('s_gender');
         const bldgrp = document.getElementById('bld_grp');
         const caste = document.getElementById('caste');
         const nssyr = document.getElementById('nssyear');

         const isname = validatename(name);
         const isfname = validatename(fname);
         const ismname = validatename(mname);
         const issname = validatename(sname);
        const isEmailValid  = validateEmail(email);
        const isDOB = validateDate(dob);
         const isValidmob = validatemobile(mobile);

        const isGender = validatedropdown(gender);
        const isbld = validatedropdown(bldgrp);
        const isCaste= validatedropdown(caste);
        const isnssyr = validatedropdown(nssyr);

        const isStep1Valid = isname && isfname && ismname && 
                         issname && isEmailValid && isDOB && 
                         isGender  && isbld && isCaste && isnssyr && isValidmob;
        
        if(isStep1Valid){
            nextpage('form2');
        }
        else{
            alert("Please Enter all fields");
        }
        


}
function checkRoll(inputRoll){
     const errRoll = document.getElementById('s_errorRoll');

     const rollValue = typeof inputRoll === 'string' ? inputRoll.trim() : inputRoll.value.trim();
    rollreg = /^[0-9]{3}$/;
    if(!rollreg.test(rollValue)){
        inputRoll.value = "";
        errRoll.classList.remove('hidden');
        errRoll.textContent = "Please Enter 3 digits, e.g. 001"
        return false;

    }
    else{
        errRoll.classList.add('hidden');
        errRoll.textContent = ""
        return true;
    }
    
}
async function submitstudentform(event, form){
    event.preventDefault();
    try{
    
    const roll = document.getElementById('s_roll');
    const division = document.getElementById('s_div'); 
    const sclass = document.getElementById('s_class');
    const program = document.getElementById('s_program');
    const snewpasswd = document.getElementById('s_newpass');
    const cnfpasswd = document.getElementById('s_cnfpass');

    const isValidroll = checkRoll(roll);
    const isValiddiv = validatedropdown(division);
    
    const isValidClass = validatedropdown(sclass);
    const isValidprogram = validatedropdown(program);
    const isValidpass = validatepass(snewpasswd);
    const isValidcnf = checkpass(cnfpasswd);

    let isValid = isValidroll && isValiddiv && isValidClass && isValidprogram && isValidpass && isValidcnf;

    if(isValid){
     
     
     
                const formData = new FormData(form);
                const response = await fetch('stdregister.php',{method:'POST', body: formData });
                
                const message = await response.json();

                if(message.success){
                    alert(message.message);
                    window.location.href = './login.html';
                }
                else if(message.success === false){
                    alert('❌Error'+ message.error);
                }

            }
    
    else{
        alert("Enter all Fields");
        return false;
    }
}catch(error){
    alert('Error while Registration '+ error);
        //window.location.href= 'studentregister.html'
}
}

//DONE
function validatedropdown(dropdown){
    if(dropdown.id == 's_gender'){
        var errormsg = document.getElementById('s_errorgender');

    }
     if(dropdown.id == 'bld_grp'){
        var errormsg = document.getElementById('s_errorbld');
        
    }
     if(dropdown.id == 'caste'){
        var errormsg = document.getElementById('s_errorcaste');
        
    }
     if(dropdown.id == 'nssyear'){
        var errormsg = document.getElementById('s_errornssyr');
        
    }
     if(dropdown.id == 's_class'){
        var errormsg = document.getElementById('s_errorclass');
        
    }
    if(dropdown.id == 's_program'){
        var errormsg = document.getElementById('s_errorprogram');
        
    }
    if(dropdown.id == "s_div"){
        var errormsg = document.getElementById('s_errordiv');
    }

    if(dropdown.value == ""){
        errormsg.classList.remove('hidden');
        errormsg.textContent = "Not Selected"
        return false;
    }
    else{
        errormsg.classList.add('hidden');
        
        return true;
    }
}
//Rponse registered or not
async function submitform(event, form){
    try{event.preventDefault();
        let isValid =false;
        
            const mobileInput = document.getElementById('a_mobile');
            const passInput   = document.getElementById('newpass');
            const emailInput  = document.getElementById('a_email');
            const cnfpassInput  = document.getElementById('cnfpass');

        
            const isMobileValid = validatemobile(mobileInput);
            const isPassValid   = validatepass(passInput);
            const isEmailValid  = validateEmail(emailInput);
            const isConfirmValid = checkpass(cnfpassInput); 

            isValid = isMobileValid && isPassValid && isEmailValid && isConfirmValid;
            
        
        
            if(isValid){
     
     
     
                const formData = new FormData(form);
                const response = await fetch('register.php',{method:'POST', body: formData });
                
                const message = await response.json();

                if(message.success){
                    alert(message.message);
                    window.location.href = './login.html';
                }
                else if(message.success === false){
                    alert('❌Error'+ message.error);
                }

            }
    
        
    }catch(error){
        alert('Error while Registration'+error);
        window.location.href= 'adminregister.html'
    };
}

//-------------

//DONE for admin and student registration
function validatemobile(inputmobile){

    if(inputmobile.id === 's_mobile'){
    var errormsg = document.getElementById('s_errormobile');
    }
    else if(inputmobile.id === 'a_mobile'){
       var errormsg = document.getElementById('errormobile'); 
    }
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
        if(inputname.id == 'a_fname' || inputname.id == 'a_lname'){
             var errormsg = document.getElementById('errorname');
        }
        else{
            var errormsg = document.getElementById('s_errorname');
        }

       
        inputname.value = inputname.value.replace(/\s/g, '');
        const invalidchar =  /[^A-Za-z]/g;
        if(invalidchar.test(inputname.value)){
            errormsg.classList.remove('hidden');
            errormsg.textContent = 'Special characters or digits are not allowed';
            inputname.value = inputname.value.replace(/[^A-Za-z]/g, '');
            return false;   
        }

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
        if(inputemail.id === 'a_email'){
            var errormsg = document.getElementById('erroremail');
        }
        else{
            var errormsg = document.getElementById('s_erroremail');
        }
            inputemail.value = inputemail.value.replace(/\s/g,'');

            const emailexp = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[a-zA-Z]{2,}$/;
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

function validateDate(inputDate){
    const errormsg = document.getElementById('s_errordate');
    const selectedDate = new Date(inputDate.value);
    const minDate = new Date('2000-01-01');
    

    const dateofbirth =  document.getElementById('s_DOB');
    dateofbirth.min = '2000-01-01';
    
    if (!inputDate.value) {
            errormsg.classList.add('hidden');
            errormsg.textContent = '';
        
        return false;
    }

    
    if (selectedDate < minDate) {
       
            errormsg.textContent = 'Date cannot be earlier than January 1, 2000.';
            errormsg.classList.remove('hidden');
            inputDate.value = '';
            return false;
    }
        if (errormsg) {
        errormsg.classList.add('hidden');
        errormsg.textContent = '';
    }
    return true;
        
        
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

    
    
       
    