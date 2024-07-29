# Terraform template:

provider "aws" {
  access_key = "asdqwe124"
  secret_key = "qesafd"
  region     = "us-east-2"
}

resource "aws_instance" "ec2_instance" {
  ami           = "ami-0d5d9d301c853a04a"
  instance_type = "t2.micro"
}