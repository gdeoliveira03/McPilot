function getWebviewContent() {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>McPilot</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          padding: 10px;
          margin: 20px;
        }
        textarea, .terraform-prompt {
          width: 100%;
          margin-bottom: 10px;
        }
        button {
          background-color: purple;
          color: white;
          padding: 10px 20px;
          border: none;
          cursor: pointer;
          border-radius: 10px; 
        }
        button:hover {
          background-color: darkmagenta;
        }
        #progress {
          margin-top: 10px;
          color: #333;
        }
        .hidden {
          display: none;
        }
        h1,awsCredentials {
          color: white; 
        }
      </style>
    </head>
    <body>
      <h1>McPilot</h1>
      <div id="awsCredentials">
        <label>AWS Access Key: <input type="password" id="awsAccessKey"></label><br>
        <label>AWS Secret Key: <input type="password" id="awsSecretKey"></label><br>
        <label>AWS Region: <input type="text" id="awsRegion"></label><br>
        <button onclick="enterCredentials()">Enter</button>
      </div>
      <div id="terraformPrompt" class="hidden">
        <h3>What can I do for you today?</h3>
        <textarea id="prompt" rows="10" placeholder="Describe the terraform template you want to generate"></textarea>
         <button onclick="goBack()">Back</button>
        <button onclick="generateCode()">Generate</button>
      </div>
      <div id="progress"></div>
      <script>
        const vscode = acquireVsCodeApi();

        function enterCredentials() {
          const awsAccessKey = document.getElementById('awsAccessKey').value;
          const awsSecretKey = document.getElementById('awsSecretKey').value;
          const awsRegion = document.getElementById('awsRegion').value;

          if (!awsAccessKey || !awsSecretKey || !awsRegion) {
            alert('Please fill in all AWS credentials');
            return;
          }

          document.getElementById('awsCredentials').classList.add('hidden');
          document.getElementById('terraformPrompt').classList.remove('hidden');
        }

        function goBack() {
          document.getElementById('terraformPrompt').classList.add('hidden');
          document.getElementById('awsCredentials').classList.remove('hidden');
        }

        function generateCode() {
          const prompt = document.getElementById('prompt').value;
          const awsAccessKey = document.getElementById('awsAccessKey').value;
          const awsSecretKey = document.getElementById('awsSecretKey').value;
          const awsRegion = document.getElementById('awsRegion').value;

          vscode.postMessage({
            command: 'generate',
            text: prompt,
            awsAccessKey: awsAccessKey,
            awsSecretKey: awsSecretKey,
            awsRegion: awsRegion
          });
        }

        window.addEventListener('message', event => {
          const message = event.data;
          switch (message.command) {
            case 'progress':
              document.getElementById('progress').innerText = message.text;
              break;
          }
        });
      </script>
    </body>
    </html>
  `;
}
  
  module.exports = {
    getWebviewContent,
  };