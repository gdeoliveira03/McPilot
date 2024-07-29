# Terraform configuration file
provider "aws" {
  access_key = "f"
  secret_key = "f"
  region     = "us-east-1"
}

# Create S3 bucket
resource "aws_s3_bucket" "my_bucket" {
  bucket = "my-bucket"
  acl    = "private"

  # Enable versioning
  versioning {
    enabled = true
  }

  # Configure lifecycle rule to delete files after 30 days
  lifecycle {
    prevent_destroy = true
    rule {
      id      = "delete_files"
      enabled = true
      prefix  = ""
      tags    = {
        Expiration = "30"
      }
    }
  }
}

# Create IAM user with S3 permissions
resource "aws_iam_user" "s3_user" {
  name = "s3_user"
  tags = {
    Name = "S3 User"
  }
}

# Attach IAM policy to user
resource "aws_iam_user_policy_attachment" "s3_user_attachment" {
  user       = aws_iam_user.s3_user.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonS3FullAccess"
}

# Generate access key and secret key for user
resource "aws_iam_access_key" "s3_user_access_key" {
  user = aws_iam_user.s3_user.name
}

# Output access key and secret key for user
output "access_key" {
  value = aws_iam_access_key.s3_user_access_key.id
}

output "secret_key" {
  value = aws_iam_access_key.s3_user_access_key.secret
}

# Configure file transfer to S3 bucket using AWS CLI
# NOTE: The following commands should be run in the terminal after this Terraform template has been applied
# aws configure
# # Enter access key, secret key, and region when prompted
# aws s3 cp <file_to_transfer> s3://my-bucket/