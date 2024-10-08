resource "aws_iam_role" "avatar" {
  name               = local.avatar["name"]
  assume_role_policy = data.aws_iam_policy_document.role_assume.json
}

resource "aws_iam_role_policy" "avatar_cloudwatch" {
  name   = "${local.avatar["name"]}-cloudwatch"
  policy = data.aws_iam_policy_document.cloudwatch.json
  role   = aws_iam_role.avatar.id
}

resource "aws_iam_role_policy" "avatar_ec2" {
  name   = "${local.avatar["name"]}-ec2"
  policy = data.aws_iam_policy_document.ec2.json
  role   = aws_iam_role.avatar.id
}

resource "aws_iam_role_policy" "avatar_s3_write" {
  name   = "${local.avatar["name"]}-s3-write"
  policy = data.aws_iam_policy_document.image_bucket_write.json
  role   = aws_iam_role.avatar.id
}

resource "null_resource" "avatar_package" {
  provisioner "local-exec" {
    working_dir = local.avatar["source_dir"]
    command     = <<EOT
      rm -fr node_modules dist *.zip
      npm install --prune
      ./node_modules/.bin/tsc -p ./tsconfig.json
      rm -fr node_modules
      npm install --production
    EOT
  }

  provisioner "local-exec" {
    working_dir = local.avatar["source_dir"]
    command     = "zip -r ${local.avatar["file_name"]} dist node_modules > /dev/null 2>&1"
  }

  triggers = {
    rerun_every_time = uuid()
  }
}

resource "aws_s3_bucket_object" "avatar_file" {
  bucket = var.dist_bucket
  key    = "${local.avatar["bucket_prefix"]}/${local.avatar["file_name"]}"
  source = "${local.avatar["source_dir"]}/${local.avatar["file_name"]}"

  depends_on = [null_resource.avatar_package]
}

resource "aws_lambda_function" "avatar" {
  function_name = local.avatar["name"]
  s3_bucket     = var.dist_bucket
  s3_key        = "${local.avatar["bucket_prefix"]}/${local.avatar["file_name"]}"
  handler       = "dist/lambda/avatar/index.handler"
  runtime       = "nodejs12.x"
  publish       = "true"
  role          = aws_iam_role.avatar.arn
  timeout       = 60
  memory_size   = 3008

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
    null_resource.avatar_package,
    aws_s3_bucket_object.avatar_file,
    aws_iam_role_policy.avatar_cloudwatch
  ]
}
