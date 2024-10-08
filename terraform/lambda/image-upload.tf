resource "aws_iam_role" "image_upload" {
  name               = local.image_upload["name"]
  assume_role_policy = data.aws_iam_policy_document.role_assume.json
}

resource "aws_iam_role_policy" "image_upload_cloudwatch" {
  name   = "${local.image_upload["name"]}-cloudwatch"
  policy = data.aws_iam_policy_document.cloudwatch.json
  role   = aws_iam_role.image_upload.id
}

resource "aws_iam_role_policy" "image_upload_ec2" {
  name   = "${local.image_upload["name"]}-ec2"
  policy = data.aws_iam_policy_document.ec2.json
  role   = aws_iam_role.image_upload.id
}

resource "aws_iam_role_policy" "image_upload_s3_write" {
  name   = "${local.image_upload["name"]}-s3-write"
  policy = data.aws_iam_policy_document.image_bucket_write.json
  role   = aws_iam_role.image_upload.id
}

resource "null_resource" "image_upload_package" {
  provisioner "local-exec" {
    working_dir = local.image_upload["source_dir"]
    command     = <<EOT
      rm -fr node_modules dist *.zip
      npm install --prune
      ./node_modules/.bin/tsc -p ./tsconfig.json
      rm -fr node_modules
      npm install --production
    EOT
  }

  provisioner "local-exec" {
    working_dir = local.image_upload["source_dir"]
    command     = "zip -r ${local.image_upload["file_name"]} dist node_modules > /dev/null 2>&1"
  }

  triggers = {
    rerun_every_time = uuid()
  }
}

resource "aws_s3_bucket_object" "image_upload_file" {
  bucket = var.dist_bucket
  key    = "${local.image_upload["bucket_prefix"]}/${local.image_upload["file_name"]}"
  source = "${local.image_upload["source_dir"]}/${local.image_upload["file_name"]}"

  depends_on = [null_resource.image_upload_package]
}

resource "aws_lambda_function" "image_upload" {
  function_name = local.image_upload["name"]
  s3_bucket     = var.dist_bucket
  s3_key        = "${local.image_upload["bucket_prefix"]}/${local.image_upload["file_name"]}"
  handler       = "dist/lambda/image-upload/index.handler"
  runtime       = "nodejs12.x"
  publish       = "true"
  role          = aws_iam_role.image_upload.arn
  timeout       = 60

  vpc_config {
    security_group_ids = [var.lambda_sg_id]
    subnet_ids         = var.public_subnet_ids
  }

  environment {
    variables = {
      DB_HOST       = var.core_rds["endpoint"]
      DB_PORT       = var.core_rds["port"]
      DB_USERNAME   = var.core_rds["username"]
      DB_PASSWORD   = var.core_rds["password"]
      DB_NAME       = var.core_rds["db_name"]
      IMAGES_BUCKET = var.images_bucket
    }
  }

  depends_on = [
    null_resource.image_upload_package,
    aws_s3_bucket_object.image_upload_file,
    aws_iam_role_policy.image_upload_cloudwatch
  ]
}
