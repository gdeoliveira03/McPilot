# Terraform code for provisioning an EC2 instance using AWS as the cloud provider
# The EC2 instance will be provisioned in the specified region using the provided AWS access and secret keys

provider "aws" {
  access_key = "AKIAQE43KICUS4ZVOZ5N"
  secret_key = "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"
  region     = "us-east-1"
}

resource "aws_instance" "ec2_instance" {
  ami           = "ami-0dc2d3e4c0f9ebd18" # Amazon Linux 2 AMI (HVM), SSD Volume Type
  instance_type = "t2.micro"
  tags = {
    Name = "EC2 Instance"
  }
}