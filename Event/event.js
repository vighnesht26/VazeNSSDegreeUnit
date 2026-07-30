 
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

const today = new Date();

const yyyy = today.getFullYear();
const mm = String(today.getMonth() + 1).padStart(2, '0');
const dd = String(today.getDate()).padStart(2, '0');
const fdate = `${yyyy}-${mm}-${dd}`;
document.getElementById('Date').min = fdate;

function timevalidate(){
  const etime = document.getElementById("e_time");
  const err = document.getElementById("errortime");
  
  
  const val = etime.value;
  
  if (!val) {
    err.classList.add("hidden");
    err.textContent = "";
    return;
  }
  
  if (val < "05:00" || val > "19:00") {
    err.classList.remove("hidden");
    err.textContent = "Please select a time between 05:00 AM and 07:00 PM.";
    etime.value = "07:00"
  } else {
    err.classList.add("hidden");
    err.textContent = ""; 
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