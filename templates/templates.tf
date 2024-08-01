# Configure the AWS Provider
provider "aws" {
  access_key = "AKIA5FTY7LMXSTTDLFXM"
  secret_key = "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"
  region     = "us-east-1"
}

# Create An S3 Bucket
resource "aws_s3_bucket" "my_bucket" {
  bucket = "my-bucket"
  acl    = "private"
}

# Create Local File To Be Uploaded
resource "local_file" "my_file" {
  filename = "my_file.txt"
}

# Upload File To S3 Bucket
resource "aws_s3_bucket_object" "my_file_upload" {
  bucket = "${aws_s3_bucket.my_bucket.id}"
  key    = "my_file.txt"
  source = "${local_file.my_file.filename}"
}

# Grant Permissions To S3 Bucket
resource "aws_s3_bucket_policy" "my_bucket_policy" {
  bucket = "${aws_s3_bucket.my_bucket.id}"

  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": [
        "s3:PutObject",
        "s3:GetObject"
      ],
      "Resource": [
        "${aws_s3_bucket.my_bucket.arn}",
        "${aws_s3_bucket.my_bucket.arn}/*"
      ]
    }
  ]
}
EOF
}