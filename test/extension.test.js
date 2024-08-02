const assert = require('assert');
const vscode = require('vscode');
const sinon = require('sinon');
const path = require('path');
const fs = require('fs');
const { generateTerraform } = require('../src/commands/generateTerraform');
const { getWebviewContent } = require('../src/views/webViewContent');
const api = require('../src/utils/api'); 

suite('Extension Test Suite', () => {
  vscode.window.showInformationMessage('Start all tests.');

  test('Sample test', () => {
    assert.strictEqual(-1, [1, 2, 3].indexOf(5));
    assert.strictEqual(-1, [1, 2, 3].indexOf(0));
  });

  // Command Registration
  suite('Command Registration Test Suite', () => {
    let extension;

    suiteSetup(async function () {
      this.timeout(5000);
      const extensionId = 'mcpilot.mcpilot';
      extension = vscode.extensions.getExtension(extensionId);
      if (extension) {
        await extension.activate();
      }
    });

    test('should register the command "mcpilot.mcpilotLives"', async () => {
      const commands = await vscode.commands.getCommands();
      const commandExists = commands.includes('mcpilot.mcpilotLives');
      assert.strictEqual(commandExists, true);
    });
  });

  // Webview Content
  suite('Webview Content Test Suite', () => {
    test('should generate correct webview content', () => {
      const panel = {
        webview: {
          asWebviewUri: uri => uri.fsPath
        }
      };
      const content = getWebviewContent(panel);
      assert.ok(content.includes('<h1>McPilot</h1>'));
      assert.ok(content.includes('AWS Access Key:'));
      assert.ok(content.includes('textarea id="prompt"'));
    });
  });

    // Generate Terraform
	suite('Generate Terraform Command Test Suite', () => {
		suiteSetup(async function () {
		  this.timeout(5000);
		  const extensionId = 'mcpilot.mcpilot'; 
		  const extension = vscode.extensions.getExtension(extensionId);
		  if (extension) {
			await extension.activate();
		  }
		});
	
		test('should generate Terraform configuration and create a file', async function () {
		  this.timeout(10000);
	
		  const context = { subscriptions: [] };
	
		  // Mock the webview panel creation
		  const postMessageStub = sinon.stub();
		  const fakeWebview = {
			webview: {
			  html: '',
			  postMessage: postMessageStub,
			  asWebviewUri: (uri) => uri, 
			  onDidReceiveMessage: sinon.stub().callsFake((callback) => {
				callback({
				  command: 'generate',
				  text: 'Test prompt',
				  awsAccessKey: 'testKey',
				  awsSecretKey: 'testSecret',
				  awsRegion: 'us-east-1',
				  filename: 'test.tf'
				});
			  })
			}
		  };
	
		  const originalCreateWebviewPanel = vscode.window.createWebviewPanel;
		  vscode.window.createWebviewPanel = () => fakeWebview;
	
		  // Mock getTerraformCode to return a predefined Terraform script
		  const mockTerraformCode = `
			provider "aws" {
			  access_key = "testKey"
			  secret_key = "testSecret"
			  region     = "us-east-1"
			}
	
			resource "aws_instance" "example" {
			  ami           = "ami-0c55b159cbfafe1f0"
			  instance_type = "t2.micro"
			}
		  `;
		  const getTerraformCodeStub = sinon.stub(api, 'getTerraformCode').resolves(mockTerraformCode);
	
		  await generateTerraform(context);
	
		  const templatesDir = path.join(__dirname, '..', 'templates');
		  const filename = 'test.tf';
		  const filePath = path.join(templatesDir, filename);
		  sinon.assert.calledWith(postMessageStub, { command: 'progress', text: 'Generating Terraform template...' });
	
		  if (fs.existsSync(filePath)) {
			fs.unlinkSync(filePath);
		  }
		  vscode.window.createWebviewPanel = originalCreateWebviewPanel;
		  getTerraformCodeStub.restore();
		});
	  });
});
