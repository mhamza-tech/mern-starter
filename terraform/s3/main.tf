locals {
  main_name = "${var.namespace}-${var.env}-${var.region}"
}

data "aws_iam_policy_document" "public_read" {
  statement {
    effect  = "Allow"
    sid     = "UnrealPublicAssets"
    actions = ["s3:GetObject"]

    principals {
      identifiers = ["*"]
      type        = "*"
    }

    resources = ["arn:aws:s3:::${local.main_name}/*"]
  }
}

resource "aws_s3_bucket" "main" {
  bucket = local.main_name
  acl    = "private"
  policy = data.aws_iam_policy_document.public_read.json

  versioning {
    enabled = var.env != "prd" ? false : true
  }
}
