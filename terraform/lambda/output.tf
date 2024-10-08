output "image_upload_lambda" {
  value = {
    name       = aws_lambda_function.image_upload.function_name
    arn        = aws_lambda_function.image_upload.arn
    invoke_arn = aws_lambda_function.image_upload.invoke_arn
  }
}

output "avatar_lambda" {
  value = {
    name       = aws_lambda_function.avatar.function_name
    arn        = aws_lambda_function.avatar.arn
    invoke_arn = aws_lambda_function.avatar.invoke_arn
  }
}
