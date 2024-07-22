# Provider block
provider "aws" {
  access_key = "AKIA5FTY7LMXSTTDLFXM"
  secret_key = "FIsfOimiq9Eco1HVcBwKM8O3UQiDWGLDyTbZjt9A"
  region     = "us-east-1"
}

# Resource block
resource "aws_instance" "example" {
  ami           = "ami-0be2609ba883822ec"
  instance_type = "t2.micro"
}

# Output block
output "instance_id" {
  value = "${aws_instance.example.id}"
}