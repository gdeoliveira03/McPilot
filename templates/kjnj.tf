# This is a sample Terraform template for provisioning an EC2 instance on AWS

# Configure the AWS Provider
provider "aws" {
  access_key = "sdfg"
  secret_key = "sdfg"
  region     = "us-east-2"
}

# Define a resource for an EC2 instance
resource "aws_instance" "ec2_instance" {
  ami = "ami-0c55b159cbfafe1f0"
  instance_type = "t2.micro"
  tags = {
    Name = "EC2 Instance"
  }
}

# Define a security group for the EC2 instance
resource "aws_security_group" "ec2_security_group" {
  name        = "ec2-security-group"
  description = "Security group for the EC2 instance"

  # Allow all inbound TCP traffic on port 22 (SSH)
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Allow all inbound TCP traffic on port 80 (HTTP)
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Allow all outbound traffic
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# Attach the security group to the EC2 instance
resource "aws_instance" "ec2_instance" {
  security_groups = [aws_security_group.ec2_security_group.name]
}