function preprocessPrompt(rawPrompt) {
    // Template for generating Terraform code with instructions for the AI
    const template = `
      You are an expert in generating Terraform templates. The user will provide a description of what the Terraform template should do. Please generate a .tf file based on the user's description with the following requirements:
  
      1. The output must be valid Terraform code.
      2. Only include code in the output. Any explanations or non-code content should not be present.
      3. Ensure that all necessary resources, configurations, and permissions are included.
      4. Use AWS as the cloud provider.
      5. DO NOT use code block delimiters like \`\`\`terraform or \`\`\`.
      6. DO NOT include any comments or explanations within the code.


      Here is the user's description:
      "${rawPrompt}"
  
      Generate the Terraform template below:
    `;
  
    return template.trim();
}
  
module.exports = {
    preprocessPrompt,
};