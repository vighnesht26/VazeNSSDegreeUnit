const urlParams = new URLSearchParams(window.location.search);
const eventId = urlParams.get('event_id');

let questionsData = [];

document.addEventListener("DOMContentLoaded", () => {
  if (!eventId) {
    alert("Missing Event ID.");
    return;
  }
  loadFeedbackQuestions();
});

async function loadFeedbackQuestions() {
  try {
    const response = await fetch(`../api/volunteer_api.php?action=get_feedback_questions&id=${eventId}`);
    const result = await response.json();

    if (result.success) {
      if (result.event) {
        document.getElementById('event_name_header').textContent = result.event.name || 'Event Feedback';
        document.getElementById('event_date_header').textContent = result.event.date || '';
      }

      questionsData = result.questions || [];
      renderQuestions(questionsData);
    } else {
      document.getElementById('questions_container').innerHTML = `
        <div class="text-center py-8 text-red-500 font-semibold">${result.error || "Failed to load questions."}</div>
      `;
    }
  } catch (error) {
    console.error("Error loading questions:", error);
    document.getElementById('questions_container').innerHTML = `
      <div class="text-center py-8 text-red-500 font-semibold">Error connecting to server.</div>
    `;
  }
}

function renderQuestions(questions) {
  const container = document.getElementById('questions_container');
  document.getElementById('question_counter').textContent = `${questions.length} Questions`;

  if (questions.length === 0) {
    container.innerHTML = `<p class="text-center text-slate-400 py-8 italic">No feedback questions available for this event.</p>`;
    document.getElementById('submit_feedback_btn').classList.add('hidden');
    return;
  }

  let html = '';
  questions.forEach((q, index) => {
    html += `
      <div class="space-y-2 border-b border-slate-100 pb-5 last:border-b-0">
        <label class="c_label block text-slate-800">
          <span class="text-red-600 font-bold">${index + 1}.</span> ${q.question}
        </label>
        ${renderFieldByType(q)}
      </div>
    `;
  });

  container.innerHTML = html;
}

function renderFieldByType(q) {
  const qType = (q.q_type || 'text').toLowerCase();

  switch (qType) {
    case 'rating':
      const Rate=[
        { label: 1, text: "Very Dissatisfied" },
        { label: 2, text: "Dissatisfied" },
        { label: 3, text: "Neutral" },
        { label: 4, text: "Satisfied" },
        { label: 5, text: "Very Satisfied" }

      ]
      return `
        <div class="grid grid-cols-5 gap-2 pt-2 sm:flex sm:items-center sm:justify-between max-w-md">
          ${Rate.map(item => `
            <label class="flex flex-col items-center gap-1 cursor-pointer text-center group">
              <input 
                type="radio" 
                name="q_${q.q_id}" 
                value="${item.label}" 
                required 
                class="w-4 h-4 text-red-600 focus:ring-red-500 cursor-pointer"
              >
              <span class="text-sm font-semibold text-slate-700 group-hover:text-red-600">${item.label}</span>
              <span class="text-[10px] text-slate-500 group-hover:text-slate-700 leading-tight">${item.text}</span>
            </label>
          `).join('')}
        </div>
      `;

    case 'textarea':
      return `
        <textarea name="q_${q.q_id}" rows="3" required placeholder="Write your answer..." 
          class="c_in w-full max-w-none resize-none"></textarea>
      `;
    case 'multiple_choice':
      const options = [
        {  text: q.option_a },
        { text: q.option_b },
        {  text: q.option_c },
        { text: q.option_d }
      ].filter(opt => opt.text && opt.text.trim() !== ''); // ignores empty options

      return `
        <div class="space-y-2 pt-1">
          ${options.map(opt => `
            <label class="flex items-center gap-2.5 cursor-pointer text-sm text-slate-700 hover:text-slate-900">
              <input type="radio" name="q_${q.q_id}" value="${opt.text.replace(/"/g, '&quot;')}" required class="w-4 h-4 text-red-600 focus:ring-red-500">
              <span>${opt.text}</span>
            </label>
          `).join('')}
        </div>
      `;
    case 'text':
    default:
      return `
        <input type="text" name="q_${q.q_id}" required placeholder="Your answer here..." 
          class="c_in w-full max-w-none" />
      `;
  }
}

function submitFeedback(e) {
  e.preventDefault();
  const modal = document.getElementById('confirm_modal');
  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

function closeConfirmModal() {
  const modal = document.getElementById('confirm_modal');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
}

async function finalizeFeedbackSubmit() {
  closeConfirmModal();

  const form = document.getElementById('feedback_form');
  const formData = new FormData(form);

  const responses = questionsData.map(q => {
    return {
      q_id: q.q_id,
      answer: formData.get(`q_${q.q_id}`)
    };
  });

  try {
    const response = await fetch('../api/volunteer_api.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'submit_feedback',
        id: eventId,
        responses: responses
      })
    });

    const result = await response.json();
    if (result.success) {
      showThankYouModal();
    } else {
      alert("Error: " + (result.error || "Failed to submit feedback."));
    }
  } catch (err) {
    console.error("Submission failed:", err);
    alert("An error occurred while submitting feedback.");
  }
}

function showThankYouModal() {
  const modal = document.getElementById('thank_you_modal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }

  let timeLeft = 3;
  const timerElem = document.getElementById('countdown_timer');

  const interval = setInterval(() => {
    timeLeft -= 1;
    if (timerElem) timerElem.textContent = timeLeft;

    if (timeLeft <= 0) {
      clearInterval(interval);
      redirectAfterFeedback();
    }
  }, 1000);
}
function redirectAfterFeedback() {
  window.location.href = '../Dashboard/dashboardstudent.html'; 
}