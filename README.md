# McPilot README

McPilot is a Visual Studio Code extension that serves as a "CoPilot" for engineers working with Terraform and AWS. It allows users to write a prompt describing the desired Terraform template, which McPilot then generates automatically.

## Features

Prompt-Based Terraform Generation: Simply describe the AWS infrastructure you need, and McPilot generates the corresponding Terraform template.
AWS Service Support: Supports a variety of AWS services including EC2, S3, RDS, and more.
Automatic Deployment: Deploy the generated Terraform templates directly to your AWS environment.
Integrated with VS Code: Seamlessly integrated into your coding workflow within VS Code.


Here are some screenshots of McPilot in action:

\!\[Prompt Input\]\(images/prompt-input.png\)
\!\[Generated Template\]\(images/generated-template.png\)
Tip: Many popular extensions utilize animations. This is an excellent way to show off your extension! We recommend short, focused animations that are easy to follow.


## Requirements

Terraform: Ensure Terraform is installed and configured on your machine.
AWS CLI: AWS CLI should be installed and configured with the necessary credentials.


## Extension Settings

This extension contributes the following settings:

mcpilot.enable: Enable/disable the McPilot extension.
mcpilot.apiKey: API key for accessing the McPilot service.


## Known Issues

Calling out known issues can help limit users opening duplicate issues against your extension.

## Release Notes

Users appreciate release notes as you update your extension.

### 1.0.0

Initial release of McPilot with basic prompt-based Terraform generation.

### 1.0.1

Fixed issue with AWS authentication.

### 1.1.0

Added support for additional AWS services and improved template accuracy.

**Enjoy using McPilot!**