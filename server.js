const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const http = require('http');
const { Server } = require('socket.io');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;
const tempDir = path.join(os.tmpdir(), 'code-editor-temp');

// Create temp directory if it doesn't exist
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

app.use(cors());
app.use(bodyParser.json());

// Add Content Security Policy middleware
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-eval' https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; font-src 'self' https://cdnjs.cloudflare.com; img-src 'self' data:;"
  );
  next();
});

app.use(express.static('public'));

// Socket connection
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });

  socket.on('run-code', async (data) => {
    const { code, language, input } = data;
    
    try {
      const result = await executeCode(code, language, input, socket);
      socket.emit('code-result', { result });
    } catch (error) {
      socket.emit('code-error', { error: error.message });
    }
  });
});

async function executeCode(code, language, input, socket) {
  return new Promise((resolve, reject) => {
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    let filePath, command, args;

    switch (language) {
      case 'python':
        filePath = path.join(tempDir, `${fileName}.py`);
        command = 'python';
        args = [filePath];
        break;
      case 'javascript':
        filePath = path.join(tempDir, `${fileName}.js`);
        command = 'node';
        args = [filePath];
        break;
      default:
        return reject(new Error('Unsupported language'));
    }

    fs.writeFileSync(filePath, code);
    
    const process = spawn(command, args);
    let output = '';
    let errorOutput = '';
    let isWaitingForInput = false;

    // Set up event listener for input requests
    socket.on('provide-input', (data) => {
      if (isWaitingForInput && process && !process.killed) {
        process.stdin.write(data.input + '\n');
        socket.emit('input-processed', { message: 'Input received' });
        isWaitingForInput = false;
      }
    });

    // We won't write all input at once anymore
    // Instead, we'll wait for the program to request input

    process.stdout.on('data', (data) => {
      const chunk = data.toString();
      output += chunk;
      
      // Check if the output contains a prompt for input
      // Common patterns in output that typically indicate input prompts
      const inputPromptPatterns = [
        /input\s*\(?.*\)?:/i,   // matches: input(any text):
        /enter.+:/i,            // matches: enter something:
        /.+\?\s*$/i,            // matches: what is your name?
        /prompt:/i              // matches: prompt:
      ];
      
      const mightBeWaitingForInput = inputPromptPatterns.some(pattern => pattern.test(chunk));
      
      if (mightBeWaitingForInput) {
        isWaitingForInput = true;
        socket.emit('waiting-for-input', { prompt: chunk });
      }
      
      socket.emit('code-output', { output: chunk });
    });

    process.stderr.on('data', (data) => {
      const chunk = data.toString();
      errorOutput += chunk;
      socket.emit('code-error', { error: chunk });
    });

    process.on('close', (code) => {
      // Remove the input event listener to avoid memory leaks
      socket.removeAllListeners('provide-input');
      
      // Clean up temp file
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.error('Error deleting temp file:', err);
      }

      if (code === 0) {
        resolve(output);
      } else {
        reject(new Error(errorOutput || `Process exited with code ${code}`));
      }
    });
  });
}

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 