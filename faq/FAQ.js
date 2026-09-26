async function submitStudentQuestion(){
  const input = document.getElementById('student_question_input');
  const question = input.value.trim();
  if (!question){
    return alert("Please enter a question.");
  }

  const response = await fetch("../api/faq.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: 'ask_question', question })
  });
  const res = await response.json();

  if (res.success) {
    alert("Your question has been sent! A leader will answer it soon.");
    input.value = "";
  } else {
    alert("Error: " + res.error);
  }
}

async function loadPublicFAQs(){
  const container = document.getElementById('faq_display_list');
  const response = await fetch("../api/faq.php?action=get_faqs");
  const res = await response.json();

  if (res.success && res.data.length > 0) {
    container.innerHTML = res.data.map(item => `
      <details class="group bg-slate-50 border border-slate-200 rounded-xl p-3.5 transition-all">
        <summary class="flex justify-between items-center font-semibold text-sm text-slate-800 cursor-pointer list-none">
          <span>${item.question}</span>
          <span class="text-slate-400 group-open:rotate-180 transition-transform">▼</span>
        </summary>
        <p class="mt-2 text-xs md:text-sm text-slate-600 border-t border-slate-200 pt-2 leading-relaxed">
          ${item.answer}
        </p>
      </details>
    `).join('');
  } else {
    container.innerHTML = `<p class="text-xs text-slate-400 italic">No FAQs available yet.</p>`;
  }
}

loadPublicFAQs();

async function loadUnansweredQuestions() {
  const container = document.getElementById('unanswered_list');
  const response = await fetch("../api/faq.php?action=get_unanswered");
  const res = await response.json();

  if (res.success && res.data.length > 0) {
    container.innerHTML = res.data.map(q => `
      <div class="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3" id="faq_item_${q.f_id}">
        <p class="text-xl font-semibold text-slate-800">❓ ${q.question}</p>
        <textarea 
          id="reply_text_${q.f_id}" 
          rows="4" 
          placeholder="Write your answer..." 
          class="w-full p-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 resize-none"
        ></textarea>
        <div class="flex justify-end">
          <button 
            onclick="replyToQuestion(${q.f_id})" 
            class="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition shadow-sm">
            Publish Answer
          </button>
        </div>
      </div>
    `).join('');
  } else {
    container.innerHTML = `<p class="text-sm text-slate-500 italic">No pending questions right now.</p>`;
  }
}

async function replyToQuestion(fId) {
  const replyInput = document.getElementById(`reply_text_${fId}`);
  const answer = replyInput.value.trim();
  if (!answer) return alert("Please type an answer.");

  const response = await fetch("../api/faq.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: 'submit_answer', f_id: fId, answer })
  });
  const res = await response.json();

  if (res.success) {
    alert("Answer published!");
    document.getElementById(`faq_item_${fId}`).remove();
    loadUnansweredQuestions()
  } else {
    alert("Error: " + res.error);
  }
}

loadUnansweredQuestions();