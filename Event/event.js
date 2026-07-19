 
function updateStatusColor(selectElement) {
 
  selectElement.classList.remove('text-dorg','text-yellow-700','text-green-700',  'text-gray-600', 'text-red-800');
  
  // Map value to the corresponding Tailwind color class
  const colorMap = {
    'Tentative':'text-dorg',
    'Scheduled': 'text-yellow-700',
    'Active': 'text-green-700',
    'Completed': 'text-gray-600',
    'Cancelled': 'text-red-800'
  };
  
  // Apply the selected color class
  const selectedColor = colorMap[selectElement.value];
  if (selectedColor) {
    selectElement.classList.add(selectedColor);
  }
}

async function submitEventData(form){
  try{
    const response = await fetch('./registerevent.php',{method : 'POST', body :form});
    const result = await response.json();

    if(result.success === true){
      alert("✔️ Event Regisaterd Successfully");
    }
    else if(result.success === false){
      alert("❌ Error");
    }
  }
  catch(error){
    console.log('Network Error');
  }

  
}