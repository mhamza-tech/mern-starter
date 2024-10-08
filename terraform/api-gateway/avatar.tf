resource "aws_api_gateway_resource" "user_path" {
  rest_api_id = aws_api_gateway_rest_api.unreal.id
  parent_id   = aws_api_gateway_rest_api.unreal.root_resource_id
  path_part   = "users"
}

resource "aws_api_gateway_resource" "avatar_path" {
  rest_api_id = aws_api_gateway_rest_api.unreal.id
  parent_id   = aws_api_gateway_resource.user_path.id
  path_part   = "avatar"
}

resource "aws_api_gateway_method" "avatar" {
  rest_api_id   = aws_api_gateway_rest_api.unreal.id
  resource_id   = aws_api_gateway_resource.avatar_path.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "avatar_upload" {
  rest_api_id             = aws_api_gateway_rest_api.unreal.id
  resource_id             = aws_api_gateway_resource.avatar_path.id
  http_method             = aws_api_gateway_method.avatar.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
#  content_handling        = "CONVERT_TO_BINARY"
  uri                     = var.avatar_upload_lambda["invoke_arn"]
}

resource "aws_lambda_permission" "avatar_upload" {
  function_name = var.avatar_upload_lambda["name"]
  principal     = "apigateway.amazonaws.com"
  action        = "lambda:InvokeFunction"
  source_arn    = "${aws_api_gateway_rest_api.unreal.execution_arn}/*/*"
}

resource "aws_api_gateway_method" "avatar_cors_methods" {
  depends_on    = [aws_api_gateway_integration.avatar_upload]
  rest_api_id   = aws_api_gateway_rest_api.unreal.id
  resource_id   = aws_api_gateway_resource.avatar_path.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_method_response" "avatar_cors_resps" {
  depends_on  = [
    aws_api_gateway_integration.avatar_upload,
    aws_api_gateway_method.avatar_cors_methods
  ]
  rest_api_id = aws_api_gateway_rest_api.unreal.id
  resource_id = aws_api_gateway_resource.avatar_path.id
  http_method = "OPTIONS"
  status_code = "200"

  response_models = {
    "application/json" = "Empty"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

resource "aws_api_gateway_integration" "avatar_cors_integrations" {
  depends_on  = [
    aws_api_gateway_integration.avatar_upload,
    aws_api_gateway_method.avatar_cors_methods
  ]
  rest_api_id = aws_api_gateway_rest_api.unreal.id
  resource_id = aws_api_gateway_resource.avatar_path.id
  http_method = "OPTIONS"
  type        = "MOCK"

  passthrough_behavior = "WHEN_NO_TEMPLATES"
  request_templates    = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

resource "aws_api_gateway_integration_response" "avatar_cors_integration_resps" {
  depends_on  = [
    aws_api_gateway_integration.avatar_upload,
    aws_api_gateway_method.avatar_cors_methods,
    aws_api_gateway_integration.avatar_cors_integrations
  ]
  rest_api_id = aws_api_gateway_rest_api.unreal.id
  resource_id = aws_api_gateway_resource.avatar_path.id
  http_method = "OPTIONS"
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Token'"
    "method.response.header.Access-Control-Allow-Methods" = "'POST,GET,PUT,OPTIONS'"
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
  }
}
