```markdown
# 🧠 Evolver v3.1: The AI Evolve Soltuion

> *"Because human memory is a flawed storage medium."*

Welcome to **Evolver**, a Chrome extension designed to completely automate the EVOLVE E-LEARNING. It reads the questions, consults the AI of your choice (including local, privacy-respecting LLMs via Ollama), clicks the right radio buttons or checkboxes, and politely clicks "Next" until the exam is finished. 

Sit back, sip your coffee, and watch the DOM manipulate itself.

## ✨ Features

*   **100% Autonomous Navigation:** It doesn't just answer; it waits for page transitions, handles Single Page Applications (SPAs), and loops automatically until it spots the hidden "Finish Exam" button.
*   **Multi-Select Sorcery:** Capable of detecting `multipletype` questions and commanding the AI to return an array of answers. It checks all the right boxes.
*   **Local LLM Support (Ollama):** Hardcoded to support local models like `aratan/qwen3.5-9b-abliterated-flash:latest` (which I'm using) via Ollama. Keep your questions private and your API costs at exactly $0.00.
*   **Cloud Fallbacks:** Supports OpenAI, Google Gemini, Mistral, and Grok if you feel like burning through some API credits.
*   **Anti-Spam Timing:** Uses human-like delays (1.5s - 2.5s) to let animations finish and avoid triggering rate-limits or basic anti-bot scripts.

## 🛠️ Installation

Since Google would probably spontaneously combust if we put this on the Chrome Web Store, you'll need to load it manually:

1. Clone or download this repository to your local machine.
2. Open Chrome and navigate to `chrome://extensions/`.
3. Toggle **Developer mode** on in the top right corner.
4. Click **Load unpacked** in the top left.
5. Select the `evolver` folder.
6. Boom. The Evolver icon is now in your toolbar.

## 🔌 Connecting to Ollama

By default, Ollama is highly suspicious of browser extensions trying to talk to it (CORS block). You must tell Ollama to chill out and accept connections from anywhere.

**Windows:**
1. Add a new System Environment Variable.
2. Name: `OLLAMA_ORIGINS` | Value: `*`
3. Restart Ollama.

**Mac:**
Run Ollama via terminal: `OLLAMA_ORIGINS="*" ollama serve`

**Linux:**
Add `Environment="OLLAMA_ORIGINS=*"` to your `ollama.service` file and restart the daemon.

## 🚀 Usage

1. Open your exam page.
2. Click the **Evolver** extension icon.
3. Select your AI Provider.
    * *Using Ollama?* Select "Local LLM", leave the API key blank, and ensure Ollama is running in the background.
    * *Using Cloud?* Paste your API key.
4. Click **Save Settings**.
5. Click **Solve Current Page**.
6. Take your hands off the keyboard and watch the magic happen. The script will throw an alert box when it reaches the final "Finish Exam" button so you can review the answers.

## ⚠️ Disclaimer

This tool was built for educational purposes, testing authorized practice environments, and demonstrating DOM-parsing combined with LLM API routing. 

**I am not responsible if you use this on a proctored university exam, get caught by advanced telemetry, and are subsequently expelled into the sun.** Use responsibly, understand the code you are running, and remember that AI hallucinates. If Qwen decides the answer to a math question is "Banana", Evolver *will* try to click it. 

```
