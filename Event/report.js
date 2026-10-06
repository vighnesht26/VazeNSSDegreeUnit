function openReportModal(ev){
    const data = ev.dataset;
    const container = document.getElementById('report_modal');

    let cardHTML = `
    <div class="bg-white rounded-2xl p-5">
    <form id="report_form" onsubmit="handleReportSubmit(event)">
        <input  type="hidden" id="report_event_id" value="${data.id}" name="event_id">
            <p class ="font-bold text-2xl font-header ">${data.name}</p>
            <p class ="font-bold font-header ">${data.date}</p>
            <div>
                <label>Description :</label><br>
                <textarea required class="pl-5 w-full rounded-2xl border-2 border-blue-700 resize-none"  name="desc_report" id="desc_report" type="text" rows="4" class="resize-none"></textarea>
            </div>
            <div>
                <label >Conclusion :</label><br>
                <textarea required class=" pl-5 w-full rounded-2xl border-2 border-blue-700 resize-none" name="con_report" id="con_report" type="text" rows="4" class="resize-none"></textarea>
            </div>
            <div>
                <label>Upload Flyer</label>
                <input  class="bg-gray-300 p-1 rounded-xl border-2 border-blue-700" name="report_flyer" id="report_flyer" type="file" accept="image/*"
            </div>
            <div>
                <label>Upload Geotagged photo</label>
                <input required class="bg-gray-300 m-1 p-1 rounded-xl border-2 border-blue-700" name="report_geotagged" id="report_geotagged" type="file" accept="image/*"
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
            pendingActions();
            const eventId = document.getElementById('report_event_id').value;
            viewReportOpen(eventId);
        }else{
            alert("Error "+ result.error);
        }

    }catch(error){
        console.error('Submission error:', error);
        alert('Network error while generating report.');
    }
}


async function viewReportOpen(ev) {
  const eventId = ev.dataset ? ev.dataset.id : ev;
  if (!eventId) {
    alert("Missing Event ID.");
    return;
  }

  const modal = document.getElementById('view_report_modal');
  const container = document.getElementById('view_report_modal_content');
  if (!modal || !container) return;

  container.innerHTML = `<div class="text-center py-6 text-slate-400 text-xs italic">Fetching report details...</div>`;
  modal.classList.remove('hidden');
  modal.classList.add('flex');

  try {
    const res = await fetch(`../api/report.php?action=get_report_details&event_id=${eventId}`);
    const result = await res.json();

    if (!result.success) {
      container.innerHTML = `<p class="text-xs text-red-500 text-center py-4">${result.error || 'Failed to load report.'}</p>`;
      return;
    }

    const hasExpense = result.expense_url && result.expense_url.trim() !== '';

    container.innerHTML = `
      <!-- Download Word Report -->
      <div class="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3">
        <div>
          <p class="text-xs font-bold text-slate-800">Event Report (Word)</p>
        </div>
        <a href="${result.report_url}" target="_blank" download class="c_btn text-xs font-bold px-3 py-1.5 shrink-0 flex items-center gap-1.5">
          Download Doc
        </a>
      </div>

      <!--  Expense PDF Upload/Download -->
      <div class="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
        <div class="flex items-center justify-between gap-2">
          <div>
            <p class="text-xs font-bold text-slate-800">Expense pdf</p>
            </div>
          <span class="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${hasExpense ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-amber-100 text-amber-800 border border-amber-300'}">
            ${hasExpense ? 'Attached' : 'Pending (Optional)'}
          </span>
        </div>

        ${
          hasExpense
            ? `<div class="pt-1 flex justify-end">
                 <a href="${result.expense_url}" target="_blank" class="c_btn_blue text-xs font-bold px-3 py-1.5 flex items-center gap-1.5">
                   Download Expense PDF
                 </a>
               </div>`
            : `<form onsubmit="handleExpenseSubmit(event, ${eventId})" class="space-y-2 pt-2 border-t border-slate-200">
                 <label class="block text-[11px] font-semibold text-slate-600">Upload Expense PDF:</label>
                 <input type="file" name="expense" accept="application/pdf" required class="block w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-900 file:text-white hover:file:bg-blue-800">
                 <div class="flex justify-end pt-1">
                   <button id="expense_submit" type="submit" class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition">
                     Upload PDF
                   </button>
                 </div>
               </form>`
        }
      </div>
    `;
  } catch (err) {
    console.error("Error loading report modal:", err);
    container.innerHTML = `<p class="text-xs text-red-500 text-center py-4">Network error loading report data.</p>`;
  }
}
function closeViewReportModal() {
  const modal = document.getElementById('view_report_modal');
  if (!modal) return;
  modal.classList.add('hidden');
  modal.classList.remove('flex');
}

// Upload expense PDF
async function handleExpenseSubmit(e, eventId) {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);
  formData.append('action', 'expense_pdf');
  formData.append('event_id', eventId);

  const submitBtn = document.getElementById('expense_submit');
  submitBtn.disabled = true;
  submitBtn.textContent = "Uploading...";

  try {
    const res = await fetch('../api/report.php', {
      method: 'POST',
      body: formData
    });
    const result = await res.json();

    if (result.success) {
      alert("Expense statement attached successfully!");
      viewReportOpen(eventId);
    } else {
      alert("Error: " + (result.error || "Failed to upload expense PDF."));
    }
  } catch (err) {
    console.error("Expense upload failed:", err);
    alert("Network error while uploading expense PDF.");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Upload PDF";
  }
}

async function openVolunteerHoursModal(){
    const container = document.getElementById('volunteerHoursModal');
    const yearDropdown = document.getElementById("modalAcademicYearvolhr");
  // Fetch registered years from db
    if (yearDropdown.children.length === 0) {
        try {
        const res = await fetch("../api/export_list.php?action=get_academic_years");
        const json = await res.json();

        if (json.success && json.years) {
            yearDropdown.innerHTML = json.years.map(yr => `
            <option value="${yr}" ${yr === json.current_year ? 'selected' : ''}>
                ${yr} ${yr === json.current_year ? '(Current)' : ''}
            </option>
            `).join('');
        }
        } catch (err) {
        console.error("Failed to fetch academic years:", err);
        }
    }
    
    container.classList.remove('hidden');
    container.classList.add('flex');
}

function closeVolunteerHoursModal(){
    const container = document.getElementById('volunteerHoursModal');
    container.classList.add('hidden');
    container.classList.remove('flex');
}

async function executeVolunteerHoursExport(){
    const selectedYear = document.getElementById("modalAcademicYearvolhr").value;

    const params = new URLSearchParams({
      action: 'vol_event_report',
      academic_year: selectedYear,
    });

    window.location.href = `../api/report.php?${params.toString()}`;
}
