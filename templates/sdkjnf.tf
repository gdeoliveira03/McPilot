variable "access_key" {
  default = "kjn"
}

variable "secret_key" {
  default = "kjnkj"
}

# Define AWS provider
provider "aws" {
  access_key = var.access_key
  secret_key = var.secret_key
  region     = "us-east-2"
}

# Create AWS resource
resource "aws_instance" "example" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t2.micro"
}

# Open inbound HTTP access
resource "aws_security_group" "instance" {
  name        = "allow_http"
  description = "Allow inbound HTTP traffic"
  vpc_id      = "vpc-12345678"

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# Attach security group to instance
resource "aws_instance" "example" {
  security_groups = [aws_security_group.instance.name]
}