# Provider is set as AWS
provider "aws" {
  access_key = "welrjwenrkwejnrkjew"
  secret_key = "alsdkfm"
  region     = "ap-east-1"
}

# Create a new VPC
resource "aws_vpc" "example" {
  cidr_block = "10.0.0.0/16"
}

# Create an internet gateway
resource "aws_internet_gateway" "example" {
  vpc_id = "${aws_vpc.example.id}"
}

# Create a new subnet
resource "aws_subnet" "example" {
  vpc_id            = "${aws_vpc.example.id}"
  cidr_block        = "10.0.1.0/24"
  availability_zone = "ap-east-1a"
}

# Create a new security group
resource "aws_security_group" "example" {
  name        = "example-sg"
  description = "Example security group for web servers"

  # Inbound rule allowing HTTP traffic from any IPv4 address
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Outbound rule allowing all traffic to access the internet
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Allow inbound traffic from the same security group
  # This enables instances within the security group to communicate with each other
  ingress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    self        = true
  }

  # Allow all outbound traffic
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# Create a new instance
resource "aws_instance" "example" {
  ami           = "ami-0ff8a91507f77f867"
  instance_type = "t2.micro"
  subnet_id     = "${aws_subnet.example.id}"
  vpc_security_group_ids = ["${aws_security_group.example.id}"]

  # User data to install and start apache web server
  user_data = <<EOF
              #!/bin/bash
              yum install -y httpd
              systemctl start httpd
              systemctl enable httpd
              EOF
}

# Output the public IP address of the instance
output "public_ip" {
  value = "${aws_instance.example.public_ip}"
}

# Output the instance ID
output "instance_id" {
  value = "${aws_instance.example.id}"
}