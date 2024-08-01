provider "aws" {
 access_key = "AKIAQE43KICUS4ZVOZ5N"
 secret_key = "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"
 region = "us-east-1"
}
resource "aws_instance" "ec2_instance" {
 ami = "ami-0dc2d3e4c0f9ebd18"
 instance_type = "t2.micro"
 tags = {
 Name = "EC2 Instance"
 }
}