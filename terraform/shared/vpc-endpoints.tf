resource "aws_vpc_endpoint" "s3" {
  service_name    = "com.amazonaws.${var.aws_region}.s3"
  vpc_id          = aws_default_vpc.default.id
  route_table_ids = [
    aws_default_vpc.default.default_route_table_id
  ]
}
