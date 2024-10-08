module "label" {
  source      = "git::https://github.com/cloudposse/terraform-null-label.git?ref=tags/0.16.0"
  namespace   = var.namespace
  environment = var.env
}

data "aws_iam_policy_document" "role_assume" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["apigateway.amazonaws.com"]
    }
  }
}

data "aws_iam_policy_document" "cloudwatch" {
  statement {
    effect    = "Allow"
    actions   = [
      "logs:CreateLogGroup",
      "logs:CreateLogStream",
      "logs:DescribeLogGroups",
      "logs:DescribeLogStreams",
      "logs:PutLogEvents",
      "logs:GetLogEvents",
      "logs:FilterLogEvents"
    ]
    resources = ["*"]
  }
}

resource "aws_iam_role" "cloudwatch" {
  name               = "${module.label.id}-agw-cloudwatch"
  assume_role_policy = data.aws_iam_policy_document.role_assume.json
}

resource "aws_iam_role_policy" "cloudwatch" {
  name   = "${module.label.id}-agw-cloudwatch"
  policy = data.aws_iam_policy_document.cloudwatch.json
  role   = aws_iam_role.cloudwatch.id
}

resource "aws_api_gateway_account" "main" {
  depends_on          = [
    aws_iam_role.cloudwatch,
    aws_iam_role_policy.cloudwatch
  ]
  cloudwatch_role_arn = aws_iam_role.cloudwatch.arn
}

resource "aws_api_gateway_rest_api" "unreal" {
  name        = module.label.id
  description = "Unreal api"

  endpoint_configuration {
    types = ["REGIONAL"]
  }

  minimum_compression_size = 0
  binary_media_types       = ["*/*"]
}

resource "aws_api_gateway_deployment" "unreal" {
  depends_on  = [
    aws_api_gateway_method.image,
    aws_api_gateway_method.image_cors_methods,
    aws_api_gateway_integration.image_upload,
    aws_api_gateway_integration.image_cors_integrations,
    aws_api_gateway_method.avatar,
    aws_api_gateway_method.avatar_cors_methods,
    aws_api_gateway_integration.avatar_upload,
    aws_api_gateway_integration.avatar_cors_integrations
  ]
  rest_api_id = aws_api_gateway_rest_api.unreal.id
  stage_name  = "api"

  #  triggers = {
  #    redeployment = sha1(join(",", list(
  #    jsonencode(aws_api_gateway_integration.image_upload),
  #    )))
  #  }
  variables = {
    deployed_at = timestamp()
  }

  #  lifecycle {
  #    create_before_destroy = true
  #  }
}
