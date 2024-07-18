# Configure the AWS Provider
provider "aws" {
  access_key = "AKIA5FTY7LMXSTTDLFXM"
  secret_key = "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"
  region     = "us-east-1"
}

# Create an EC2 Instance
resource "aws_instance" "web" {
  ami           = "ami-0dc2d3e4c0f9ebd18" # Amazon Linux 2 AMI (HVM), SSD Volume Type
  instance_type = "t2.micro"

  tags = {
    Name = "HelloWorld"
  }
}

# Output the Public IP Address
output "public_ip" {
  value = aws_instance.web.public_ip
}