module "label" {
  source      = "git::https://github.com/cloudposse/terraform-null-label.git?ref=tags/0.16.0"
  namespace   = var.namespace
  environment = var.env
}

locals {
  image_upload = {
    name          = "${module.label.id}-image-upload"
    source_dir    = "${path.cwd}/../src/lambda/image-upload"
    file_name     = "${local.timestamp}.zip"
    bucket_prefix = "${var.env}-image-upload"
  }

  avatar = {
    name          = "${module.label.id}-avatar"
    source_dir    = "${path.cwd}/../src/lambda/avatar"
    file_name     = "${local.timestamp}.zip"
    bucket_prefix = "${var.env}-avatar"
  }

  timestamp = formatdate("YYYYMMDDhhmmss", timestamp())
}

data "aws_iam_policy_document" "role_assume" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

data "aws_iam_policy_document" "cloudwatch" {
  statement {
    effect    = "Allow"
    actions   = [
      "logs:CreateLogGroup",
      "logs:CreateLogStream",
      "logs:PutLogEvents"
    ]
    resources = ["*"]
  }
}

data "aws_iam_policy_document" "ec2" {
  statement {
    effect    = "Allow"
    actions   = [
      "ec2:DescribeNetworkInterfaces",
      "ec2:CreateNetworkInterface",
      "ec2:DeleteNetworkInterface",
      "ec2:DescribeInstances",
      "ec2:AttachNetworkInterface"
    ]
    resources = ["*"]
  }
}

data "aws_iam_policy_document" "image_bucket_write" {
  statement {
    effect  = "Allow"
    actions = [
      "s3:PutObject",
      "s3:PutObjectAcl"
    ]

    resources = ["arn:aws:s3:::${var.images_bucket}/*"]
  }
}
