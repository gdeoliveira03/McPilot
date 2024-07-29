provider "aws" {
  access_key = "AKIAQE43KICUS4ZVOZ5N"
  secret_key = "UHcPutSyb5XKlQWsLA02g+KdbfM8NMOdSD81q6fG"
  region     = "us-east-1"
}

resource "aws_instance" "example" {
  ami                    = "ami-0c55b159cbfafe1f0"
  instance_type          = "t2.micro"
  associate_public_ip_address = true
}