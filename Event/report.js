function openReportModal(ev){
    const data = ev.dataset;
    const container = document.getElementById('report_modal');

    let cardHTML = `
    <div >
    <form id="report_form" onsubmit="handleReportSubmit(event)">
    <input type="hidden" id="report_event_id" value="${data.id}" name="event_id">
    <p class ="font-bold text-2xl font-header ">${data.name}</p>
     <p class ="font-bold font-header ">${data.date}</p>
    <div>
    <label>Description :</label><br>
    <textarea name="desc_report" id="desc_report" type="text" rows="4" class="resize-none"></textarea>
    </div>
     <div>
    <label>Conclusion :</label><br>
    <textarea name="con_report" id="con_report" type="text" rows="4" class="resize-none"></textarea>
    </div>
    <div>
    <label>Upload Flyer</label>
    <input name="report_flyer" id="report_flyer" type="file" accept="image/*"
    </div>
    <div>
    <label>Upload Geotagged photo</label>
    <input name="report_geotagged" id="report_geotagged" type="file" accept="image/*"
    </div>
    <div>
    <label>Expense :</label><br>
    <input type="number" name="expense" id="expense" />
    </div>
    <div class="flex justify-evenly">
     <button type="submit" id="submit_report_btn" class="c_btn">Submit</button>
     <button type="button" class="c_btn_light" onclick="closeReportModal()">Cancle</button>
    </div>
    
    </form>
    </div>
    `

    container.innerHTML = cardHTML;
    container.classList.remove('hidden');
    container.classList.add('flex');
}

function closeReportModal(){
    const container = document.getElementById('report_modal');
    container.classList.add('hidden');
    container.classList.remove('flex');
}

async function handleReportSubmit(ev){
    ev.preventDefault()
    const form = document.getElementById('report_form');
    const formData = new FormData(form);
    formData.append('action', 'generate_report');
    const submitBtn = document.getElementById('submit_report_btn');

    submitBtn.disabled= true;
    submitBtn.textContent = "Generating...";

    try{
        const response = await fetch('../api/report.php',{
            method: 'POST',
            body:formData,
        });

        const result = await response.json();

        if(result.success){
            alert("Report generated and uploaded successfully");
            closeReportModal();
            isCompletedLoaded = false;
            loadCompletedEvents();
        }else{
            alert("Error "+ result.error);
        }

    }catch(error){
        console.error('Submission error:', error);
        alert('Network error while generating report.');
    }
}

function viewReport(ev) {
    const eventId = ev.dataset.id;
    if (!eventId) {
        alert("Missing Event ID.");
        return;
    }
    
    window.open(`../api/report.php?action=view_report&event_id=${eventId}`, '_blank');
}