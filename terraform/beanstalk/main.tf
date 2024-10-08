module "label" {
  source      = "git::https://github.com/cloudposse/terraform-null-label.git?ref=tags/0.16.0"
  namespace   = var.namespace
  environment = var.env
  name        = var.gql_app_name
}

# docs: https://www.terraform.io/docs/providers/aws/r/elastic_beanstalk_environment.html
resource "aws_elastic_beanstalk_environment" "gql" {
  name        = module.label.id
  description = "GQL EB ${var.env} environment"
  application = var.application_name
  tier        = "WebServer"
  #  region              = var.region
  solution_stack_name = "64bit Amazon Linux 2 v5.0.2 running Node.js 12"

  dynamic "setting" {
    for_each = local.eblb_settings
    content {
      namespace = setting.value["namespace"]
      name      = setting.value["name"]
      value     = setting.value["value"]
    }
  }

  dynamic "setting" {
    for_each = local.gql_env_vars
    content {
      namespace = "aws:elasticbeanstalk:application:environment"
      name      = setting.key
      value     = setting.value
    }
  }

  setting {
    namespace = "aws:ec2:instances"
    name      = "InstanceTypes"
    value     = var.gql_app_instance
  }
  setting {
    namespace = "aws:autoscaling:launchconfiguration"
    name      = "RootVolumeSize"
    value     = 8
  }
  setting {
    namespace = "aws:autoscaling:launchconfiguration"
    name      = "RootVolumeType"
    value     = "gp2"
  }
  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "BASE_HOST"
    value     = var.gql_app_name
  }
  setting {
    namespace = "aws:autoscaling:asg"
    name      = "MaxSize"
    value     = var.gql_autoscale_max
  }
  setting {
    namespace = "aws:elasticbeanstalk:environment:process:default"
    name      = "HealthCheckPath"
    value     = "/.well-known/apollo/server-health"
  }
  setting {
    namespace = "aws:elbv2:listenerrule:gql"
    name      = "PathPatterns"
    value     = "/graphql"
  }
  setting {
    namespace = "aws:elbv2:listenerrule:gql"
    name      = "Process"
    value     = "default"
  }
  setting {
    namespace = "aws:elbv2:listener:default"
    name      = "Rules"
    value     = "gql"
  }
  setting {
    namespace = "aws:elbv2:listener:443"
    name      = "DefaultProcess"
    value     = "default"
  }
  setting {
    namespace = "aws:elbv2:listener:443"
    name      = "Rules"
    value     = "gql"
  }
}
