resource "aws_s3_bucket" "dist_bucket" {
  bucket = "${var.namespace}-dist-${var.aws_region}"
  acl    = "private"
}
