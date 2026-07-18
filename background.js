chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "FETCH_ANSWER") {
    handleApiCall(request.question, request.options, request.isMultiple).then(answerIds => {
      sendResponse({ answerIds: answerIds });
    });
    return true; 
  }
});

async function handleApiCall(question, options, isMultiple) {
  return new Promise((resolve) => {
    // NEW: Fetch localModel from storage as well
    chrome.storage.local.get(['provider', 'apiKey', 'localModel'], async (settings) => {
      const { provider, apiKey, localModel } = settings;
      
      if (!provider) {
        console.error("No AI provider selected.");
        resolve(null);
        return;
      }

      let optionsText = options.map(opt => `ID: ${opt.id} | Text: ${opt.text}`).join('\n');
      let prompt = `You are an automated exam solver. 
Question: "${question}"
Options:
${optionsText}

Identify the correct option(s) based on the question.`;

      if (isMultiple) {
        prompt += `
CRITICAL RULE: This question may have MULTIPLE correct answers. You must reply ONLY with a comma-separated list of the exact ID strings of ALL correct answers (e.g., chk_1_0,chk_1_2). Do not include any explanations, punctuation, markdown formatting, or extra text.`;
      } else {
        prompt += `
CRITICAL RULE: You must reply ONLY with the exact ID string (e.g., chk_1_0) of the correct answer. Do not include any explanations, punctuation, markdown formatting, or extra text.`;
      }

      try {
        let aiResponseText = "";

        if (provider === "openai") {
          const res = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
            body: JSON.stringify({
              model: 'gpt-4o-mini',
              messages: [{ role: 'user', content: prompt }],
              temperature: 0
            })
          });
          const data = await res.json();
          aiResponseText = data.choices[0].message.content;
        } 
        
        else if (provider === "gemini") {
          const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { temperature: 0 }
            })
          });
          const data = await res.json();
          aiResponseText = data.candidates[0].content.parts[0].text;
        }

        else if (provider === "mistral" || provider === "grok" || provider === "local") {
          let endpoint = provider === "mistral" ? "https://api.mistral.ai/v1/chat/completions" : 
                         provider === "grok" ? "https://api.x.ai/v1/chat/completions" : 
                         "http://localhost:11434/v1/chat/completions";
                         
          // NEW: Use the user's input, or default to a standard model if left blank
          let model = provider === "mistral" ? "mistral-small-latest" : 
                      provider === "grok" ? "grok-beta" : 
                      (localModel || "llama3.1"); 

          const headers = { 'Content-Type': 'application/json' };
          
          if (provider !== "local") {
            headers['Authorization'] = `Bearer ${apiKey}`;
          }

          const res = await fetch(endpoint, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
              model: model,
              messages: [{ role: 'user', content: prompt }],
              temperature: 0
            })
          });
          const data = await res.json();
          aiResponseText = data.choices[0].message.content;
        }

        let answerIds = [];
        if (isMultiple) {
          let parts = aiResponseText.split(',');
          answerIds = parts.map(p => p.trim().replace(/[^a-zA-Z0-9_]/g, '')).filter(p => p !== '');
        } else {
          answerIds = [aiResponseText.trim().replace(/[^a-zA-Z0-9_]/g, '')];
        }

        resolve(answerIds);

      } catch (error) {
        console.error("AI API Call Failed:", error);
        resolve(null);
      }
    });
  });
}
