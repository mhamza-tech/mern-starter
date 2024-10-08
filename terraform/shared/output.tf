output "vpc_id" {
  value = aws_default_vpc.default.id
}

#output "private_subnet_ids" {
#  value = module.subnets.private_subnet_ids
#}

output "public_subnet_ids" {
  value = [
    aws_default_subnet.default_az1.id,
    aws_default_subnet.default_az2.id,
    aws_default_subnet.default_az3.id,
    aws_default_subnet.default_az4.id,
  ]
}

output "eblb_sg" {
  value = {
    id   = aws_security_group.eblb.id
    name = aws_security_group.eblb.name
  }
}

output "eb_sg" {
  value = {
    id   = aws_security_group.eb.id
    name = aws_security_group.eb.name
  }
}

output "services_sg" {
  value = {
    id   = aws_security_group.services.id
    name = aws_security_group.services.name
  }
}

output "eb_application_name" {
  value = module.elastic_beanstalk_application.elastic_beanstalk_application_name
}

output "dist_bucket" {
  value = aws_s3_bucket.dist_bucket.id
}
