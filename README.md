# CodeLab - Learn to Code

A simple code editor with a built-in terminal designed for young coders learning to program. This application allows you to:

- Write and run Python and JavaScript code
- See the output in a terminal-like interface
- Input data to your programs
- Learn from pre-built code examples

## Features

- **Code Editor**: A syntax-highlighted editor with support for Python and JavaScript
- **Terminal Output**: Real-time execution results
- **Learning Panel**: Pre-built code examples for beginners
- **Input Support**: Ability to provide input data to your programs
- **Mobile Responsive**: Works on various screen sizes

## Requirements

- Node.js (v14+)
- Python (for Python code execution)

## Installation

1. Clone this repository:
   ```
   git clone https://github.com/NAVEENKUMARKR777/Code-Editor-With-Terminal.git
   cd codelab
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the server:
   ```
   npm start
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## Deployment to Render

Follow these steps to deploy this application to Render for free:

1. Create a Render account at [render.com](https://render.com)

2. Push your code to a GitHub repository

3. In the Render dashboard, click on "New" and select "Web Service"

4. Connect your GitHub repository

5. Configure the service:
   - **Name**: Choose a name (e.g., codelab)
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Plan**: Free

6. Scroll down to "Advanced" and add the following environment variables:
   - `NODE_ENV`: `production`

7. Click "Create Web Service"

8. Render will automatically build and deploy your application
   - You'll be able to access it at `https://your-service-name.onrender.com`

**Important Notes for Render Deployment:**
- The free tier of Render may spin down after periods of inactivity (usually 15 minutes)
- The first request after inactivity will take a bit longer to load as the service spins up
- Python execution is available on Render through their buildpacks system

## For Young Coders

This application is designed to help you learn programming in a fun and interactive way. Here's how to get started:

1. Choose a programming language (Python or JavaScript)
2. Select a code example from the Learning Resources panel
3. Experiment by changing the code
4. Click the "Run" button to see what happens
5. If your program needs input, provide it in the Input box

Have fun coding! 