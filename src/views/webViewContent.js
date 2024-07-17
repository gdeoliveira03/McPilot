function getWebviewContent() {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Terraform Code Generator</title>
    </head>
    <body>
      <h1>Terraform Code Generator</h1>
      <textarea id="prompt" rows="10" cols="50" placeholder="Enter the description for the Terraform configuration"></textarea>
      <br>
      <label>AWS Access Key: <input type="password" id="awsAccessKey"></label><br>
      <label>AWS Secret Key: <input type="password" id="awsSecretKey"></label><br>
      <label>AWS Region: <input type="text" id="awsRegion"></label><br>
      <button onclick="generateCode()">Generate</button>
      <div id="progress"></div>
      <script>
        const vscode = acquireVsCodeApi();
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