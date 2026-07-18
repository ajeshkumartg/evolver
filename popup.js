document.addEventListener('DOMContentLoaded', () => {
  const providerSelect = document.getElementById('provider');
  const apiKeyInput = document.getElementById('apiKey');
  const saveBtn = document.getElementById('saveBtn');
  const solveBtn = document.getElementById('solveBtn');

  // Load saved settings when popup opens
  chrome.storage.local.get(['provider', 'apiKey'], (result) => {
    if (result.provider) providerSelect.value = result.provider;
    if (result.apiKey) apiKeyInput.value = result.apiKey;
  });

  // Save settings
  saveBtn.addEventListener('click', () => {
    const provider = providerSelect.value;
    const apiKey = apiKeyInput.value;
    
    chrome.storage.local.set({ provider, apiKey }, () => {
      saveBtn.innerText = "Saved!";
      setTimeout(() => { saveBtn.innerText = "Save Settings"; }, 1500);
    });
  });

  // Trigger the solver on the active tab
  solveBtn.addEventListener('click', () => {
    solveBtn.innerText = "Solving...";
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: "START_SOLVING" }, (response) => {
        solveBtn.innerText = "Solve Current Page";
      });
    });
  });
});