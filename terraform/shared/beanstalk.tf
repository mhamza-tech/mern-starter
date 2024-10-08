module "elastic_beanstalk_application" {
  source = "git::https://github.com/cloudposse/terraform-aws-elastic-beanstalk-application.git?ref=tags/0.5.0"

  namespace = var.namespace
  name      = var.gql_app_name
}
