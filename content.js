chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "START_SOLVING") {
    console.log("Starting Auto-Pilot...");
    solveNextQuestion();
    sendResponse({ status: "started" });
  }
});

async function solveNextQuestion() {
  const container = document.getElementById('exam_cont');
  
  // FIXED: No more annoying pop-ups when the exam ends
  if (!container) {
    console.log("Exam container (#exam_cont) not found. Exam likely finished or page changed.");
    return;
  }

  const questionDivs = Array.from(container.querySelectorAll('div[id^="question_"]'));
  let currentQuestion = null;

  for (let qDiv of questionDivs) {
    const isVisible = qDiv.offsetParent !== null; 
    const isAnswered = qDiv.querySelector('input:checked');

    if (isVisible && !isAnswered) {
      currentQuestion = qDiv;
      break; 
    }
  }

  if (!currentQuestion) {
    console.log("No unanswered visible questions found. Exam complete or waiting!");
    return;
  }

  const qTextEl = currentQuestion.querySelector('.question_text');
  if (!qTextEl) return;
  
  const questionText = qTextEl.innerText.trim();
  const options = [];
  const labels = currentQuestion.querySelectorAll('label');

  labels.forEach(label => {
    const inputId = label.getAttribute('for');
    if (inputId) {
      options.push({
        id: inputId,
        text: label.innerText.trim()
      });
    }
  });

  const isMultipleType = currentQuestion.classList.contains('multipletype');

  if (options.length > 0) {
    console.log(`Asking AI: "${questionText}" (Multiple Answers Allowed: ${isMultipleType})`);
    
    const correctInputIds = await getAnswerFromAI(questionText, options, isMultipleType);
    
    if (correctInputIds && correctInputIds.length > 0) {
      for (let inputId of correctInputIds) {
        const inputToClick = document.getElementById(inputId);
        const labelToClick = document.querySelector(`label[for="${inputId}"]`);
        
        if (inputToClick) {
          inputToClick.checked = true;
          inputToClick.click();
          inputToClick.dispatchEvent(new Event('change', { bubbles: true }));
        }
        if (labelToClick) {
          labelToClick.click();
        }
        console.log(`✅ Selected option: ${inputId}`);
      }
    } else {
      console.log("❌ AI failed to return an answer. Stopping auto-pilot.");
      return; 
    }
  }

  // Check for the Finish button
  setTimeout(() => {
    const finishBtn = document.getElementById('finish');
    
    const isFinishVisible = finishBtn && window.getComputedStyle(finishBtn).display !== 'none';

    if (isFinishVisible) {
      console.log("Finish Exam button detected! Stopping auto-pilot.");
      alert("All questions answered! You can now review and click 'Finish Exam'.");
      return; 
    }

    const nextBtn = document.getElementById('next');
    
    if (nextBtn && window.getComputedStyle(nextBtn).display !== 'none') {
      console.log("Clicking Next...");
      nextBtn.click();
      setTimeout(solveNextQuestion, 2500); 
    } else {
      console.log("Next button is hidden and Finish button isn't visible. Stopping to be safe.");
    }
  }, 1500);
}

function getAnswerFromAI(question, options, isMultiple) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({
      action: "FETCH_ANSWER",
      question: question,
      options: options,
      isMultiple: isMultiple
    }, (response) => {
      resolve(response ? response.answerIds : null);
    });
  });
}