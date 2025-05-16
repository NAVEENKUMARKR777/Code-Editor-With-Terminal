document.addEventListener('DOMContentLoaded', () => {
  // Initialize CodeMirror editor
  const editor = CodeMirror.fromTextArea(document.getElementById('code-editor'), {
    mode: 'python',
    theme: 'dracula',
    lineNumbers: true,
    indentUnit: 4,
    tabSize: 4,
    autoCloseBrackets: true,
    matchBrackets: true,
    lineWrapping: true,
  });

  // Adjust editor height
  editor.setSize(null, '100%');

  // Initialize socket connection
  const socket = io();

  // DOM elements
  const languageSelect = document.getElementById('language-select');
  const runBtn = document.getElementById('run-btn');
  const clearBtn = document.getElementById('clear-btn');
  const clearTerminalBtn = document.getElementById('clear-terminal-btn');
  const terminalOutput = document.getElementById('terminal-output');
  const inputData = document.getElementById('input-data');
  const togglePanelBtn = document.getElementById('toggle-panel-btn');
  const panelContent = document.querySelector('.panel-content');
  const snippetButtons = document.querySelectorAll('.snippet-btn');
  const toastMessage = document.getElementById('toast-message');

  // Add new input submit button
  const inputArea = document.querySelector('.input-area');
  const inputLabel = inputArea.querySelector('label');
  
  // Create submit button
  const submitBtn = document.createElement('button');
  submitBtn.id = 'submit-input-btn';
  submitBtn.className = 'btn primary';
  submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Input';
  submitBtn.style.marginTop = '10px';
  submitBtn.style.width = '100%';
  submitBtn.disabled = true; // Initially disabled
  inputArea.appendChild(submitBtn);

  // Flag to track if program is waiting for input
  let isWaitingForInput = false;

  // Change editor mode when language is changed
  languageSelect.addEventListener('change', () => {
    const language = languageSelect.value;
    editor.setOption('mode', language === 'javascript' ? 'javascript' : 'python');
    
    // Show toast
    showToast(`Switched to ${language} mode`, 'success');
  });

  // Run code
  runBtn.addEventListener('click', () => {
    const code = editor.getValue();
    const language = languageSelect.value;
    // We'll use input only if explicitly needed now
    // const input = inputData.value;

    if (!code.trim()) {
      showToast('Please write some code first', 'error');
      return;
    }

    // Reset input state
    isWaitingForInput = false;
    submitBtn.disabled = true;
    
    // Clear previous output
    terminalOutput.innerHTML = '';
    
    // Add loading indicator
    const loadingEl = document.createElement('div');
    loadingEl.className = 'output';
    loadingEl.textContent = 'Running code...';
    terminalOutput.appendChild(loadingEl);

    // Disable run button
    runBtn.disabled = true;
    runBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Running';

    // Send code to server - without input initially
    socket.emit('run-code', { code, language, input: '' });
  });

  // Submit input when the program is waiting for it
  submitBtn.addEventListener('click', () => {
    if (isWaitingForInput) {
      const input = inputData.value;
      
      // Create a user input element in the terminal
      const userInputEl = document.createElement('div');
      userInputEl.className = 'input-entry';
      userInputEl.textContent = input;
      userInputEl.style.color = '#a29bfe'; // Highlight user input
      userInputEl.style.fontStyle = 'italic';
      terminalOutput.appendChild(userInputEl);
      
      // Send the input to the server
      socket.emit('provide-input', { input });
      
      // Clear the input field for next input
      inputData.value = '';
      
      // Disable the submit button until next input request
      submitBtn.disabled = true;
      isWaitingForInput = false;
      
      // Auto scroll to bottom
      terminalOutput.scrollTop = terminalOutput.scrollHeight;
    }
  });

  // Also allow pressing Enter to submit input
  inputData.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && isWaitingForInput && !submitBtn.disabled) {
      e.preventDefault(); // Prevent default to avoid newline in textarea
      submitBtn.click();
    }
  });

  // Socket events
  socket.on('code-output', (data) => {
    // Remove loading indicator if exists
    if (terminalOutput.querySelector('.output:first-child')?.textContent === 'Running code...') {
      terminalOutput.querySelector('.output:first-child').remove();
    }
    
    const outputEl = document.createElement('div');
    outputEl.className = 'output';
    outputEl.textContent = data.output;
    terminalOutput.appendChild(outputEl);
    
    // Auto scroll to bottom
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
  });

  // New event for when the program is waiting for input
  socket.on('waiting-for-input', (data) => {
    isWaitingForInput = true;
    submitBtn.disabled = false;
    inputLabel.textContent = data.prompt ? `Input for: ${data.prompt}` : 'Input:';
    inputData.focus(); // Focus the input box
    
    // Change input area style to indicate it's active
    inputArea.style.borderColor = '#6c5ce7';
    inputArea.style.boxShadow = '0 0 5px rgba(108, 92, 231, 0.5)';
    
    // Add subtle animation to draw attention
    inputArea.style.animation = 'pulse 1.5s infinite';
    if (!document.querySelector('#pulse-animation')) {
      const style = document.createElement('style');
      style.id = 'pulse-animation';
      style.textContent = `
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.8; }
          100% { opacity: 1; }
        }
      `;
      document.head.appendChild(style);
    }
  });

  socket.on('input-processed', () => {
    // Reset input area styling
    inputArea.style.borderColor = '';
    inputArea.style.boxShadow = '';
    inputArea.style.animation = '';
    inputLabel.textContent = 'Input:';
  });

  socket.on('code-error', (data) => {
    // Remove loading indicator if exists
    if (terminalOutput.querySelector('.output:first-child')?.textContent === 'Running code...') {
      terminalOutput.querySelector('.output:first-child').remove();
    }
    
    const errorEl = document.createElement('div');
    errorEl.className = 'error';
    errorEl.textContent = data.error;
    terminalOutput.appendChild(errorEl);
    
    // Auto scroll to bottom
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
    
    // Reset input state
    isWaitingForInput = false;
    submitBtn.disabled = true;
    inputArea.style.borderColor = '';
    inputArea.style.boxShadow = '';
    inputArea.style.animation = '';
    
    // Enable run button
    runBtn.disabled = false;
    runBtn.innerHTML = '<i class="fas fa-play"></i> Run';
  });

  socket.on('code-result', (data) => {
    // Enable run button
    runBtn.disabled = false;
    runBtn.innerHTML = '<i class="fas fa-play"></i> Run';
    
    // Reset input state
    isWaitingForInput = false;
    submitBtn.disabled = true;
    inputArea.style.borderColor = '';
    inputArea.style.boxShadow = '';
    inputArea.style.animation = '';
    
    showToast('Code executed successfully!', 'success');
  });

  // Clear editor
  clearBtn.addEventListener('click', () => {
    if (editor.getValue().trim()) {
      if (confirm('Are you sure you want to clear all code?')) {
        editor.setValue('');
        showToast('Editor cleared', 'success');
      }
    } else {
      showToast('Editor is already empty', 'info');
    }
  });

  // Clear terminal
  clearTerminalBtn.addEventListener('click', () => {
    terminalOutput.innerHTML = '';
    showToast('Terminal cleared', 'success');
  });

  // Toggle learning panel
  togglePanelBtn.addEventListener('click', () => {
    panelContent.style.display = panelContent.style.display === 'none' ? 'block' : 'none';
    togglePanelBtn.innerHTML = panelContent.style.display === 'none' 
      ? '<i class="fas fa-chevron-down"></i>' 
      : '<i class="fas fa-chevron-up"></i>';
  });

  // Load code snippets
  snippetButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const snippetLanguage = btn.dataset.language;
      const snippetName = btn.dataset.snippet;
      
      // Set the language in the select box
      languageSelect.value = snippetLanguage;
      editor.setOption('mode', snippetLanguage === 'javascript' ? 'javascript' : 'python');
      
      // Get the snippet code
      const snippet = codeSnippets[snippetLanguage][snippetName];
      
      // Set the code in the editor
      editor.setValue(snippet);
      
      showToast(`Loaded ${snippetName} example`, 'success');
    });
  });

  // Toast function
  function showToast(message, type = 'info') {
    toastMessage.textContent = message;
    toastMessage.className = `toast ${type} show`;
    
    setTimeout(() => {
      toastMessage.className = toastMessage.className.replace('show', '');
    }, 3000);
  }

  // Initialize with default values
  editor.setValue(codeSnippets.python['hello-world']);
  showToast('Welcome to CodeLab! Start coding now!', 'success');
}); 