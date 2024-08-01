resource "aws_s3_bucket" "mcpilotfiles" {
  bucket = "mcpilotfiles"
  acl    = "private"
}