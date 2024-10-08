variable "namespace" {
  type = string
}

variable "env" {
  type = string
}

variable "region" {
  type = string
}

variable "application_name" {
  type = string
}

variable "gql_app_name" {
  type = string
}

variable "vpc_id" {
  type = string
}

variable "private_subnet_ids" {
  type    = list(string)
  default = []
}

variable "public_subnet_ids" {
  type = list(string)
}

variable "eblb_sg_id" {
  type = string
}

variable "eb_sg_id" {
  type = string
}

variable "gql_app_instance" {
  type = string
}

variable "gql_autoscale_max" {
  type = number
}

variable "core_rds" {
  type = map(string)
}

variable "redis" {
  type = map(string)
}

variable "env_vars" {
  type = map(string)
}

locals {
  gql_env_vars  = {
    "BUILD_NUMBER"                  = var.env_vars["build_number"]
    "SECRET"                        = "test"
    "PORT"                          = "3000"
    "TYPEORM_CONNECTION"            = "default"
    "TYPEORM_HOST"                  = var.core_rds["endpoint"]
    "TYPEORM_PORT"                  = var.core_rds["port"]
    "TYPEORM_USERNAME"              = var.core_rds["username"]
    "TYPEORM_PASSWORD"              = var.core_rds["password"]
    "TYPEORM_DATABASE"              = var.core_rds["db_name"]
    "TYPEORM_MIGRATIONS_RUN"        = true
    "TYPEORM_MIGRATIONS_DIR"        = "dist/db/migrations"
    "TYPEORM_DROP_SCHEMA"           = false
    "TYPEORM_SYNCHRONIZE"           = false
    "TYPEORM_LOGGING"               = false
    "SENDGRID_API_KEY"              = "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"
    "NODE_ENV"                      = var.env_vars["node_env"]
    "MASTER_API_KEY"                = var.env_vars["master_api_key"]
    "SERVICE_URL"                   = var.env_vars["service_url"]
    "ENGINE_API_KEY"                = var.env_vars["engine_api_key"]
    "APOLLO_DEBUG_ENABLED"          = var.env_vars["apollo_debug_enabled"]
    "APOLLO_TRACING_ENABLED"        = var.env_vars["apollo_tracing_enabled"]
    "CONFIRM_EMAIL_URL"             = var.env_vars["confirm_email_url"]
    "RESET_PASSWORD_URL"            = var.env_vars["reset_password_url"]
    "CONTENTFUL_SPACE_ID"           = "k7kwi95p54k1"
    "CONTENTFUL_DELIVERY_API_KEY"   = "wkCWeTZSaVoRJlaTD85A99k2ugEWXmmN79LnnfYONCg"
    "CONTENTFUL_PREVIEW_API_KEY"    = "IDdw9Y-gzxfZmewofoeUgTGTYLoTEbouE02UiEp6uQE"
    "FIREBASE_SERVICE_ACCOUNT_FILE" = var.env_vars["firebase_service_account_file"]
    "UNREAL_AWS_ACCESS_KEY"         = "AKIAYISB4C3XUPCRQ4FL"
    "UNREAL_AWS_SECRET_ACCESS_KEY"  = "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"
    "UNREAL_AWS_S3_BUCKET"          = var.env_vars["unreal_aws_s3_bucket"]
    "MIXPANEL_TOKEN"                = var.env_vars["mixpanel_token"]
    "LOG_LEVEL"                     = var.env_vars["log_level"]
    "LOG_CONTEXT"                   = var.env_vars["log_context"]
    "IOS_BUNDLE_ID"                 = var.env_vars["ios_bundle_id"]
    "WWW_SHORT_DOMAIN"              = var.env_vars["www_short_domain"]
    "WWW_DOMAIN"                    = var.env_vars["www_domain"]
    "APP_URL"                       = var.env_vars["app_url"]
    "FB_SHORTLINK_API_KEY"          = var.env_vars["fb_shortlink_api_key"]
    "REDIS_HOST"                    = var.redis["endpoint"]
    "REDIS_PORT"                    = var.redis["port"]
    "IMGIX_CDN_ROOT_URL"            = var.env_vars["imgix_cdn_root_url"]
    "IMGIX_API_KEY"                 = var.env_vars["imgix_api_key"]
    "SENTRY_DSN"                    = "https://5dfbb434dc59434b879022e16e0212ab@o345324.ingest.sentry.io/5295380"
    "WELCOME_BOT_EID"               = "unobject/66"
    "USERS_TO_AUTO_FRIEND"          = var.env_vars["users_to_auto_friend"]
    "DEFAULT_NPC_ID"                = "bedroom_357"
  }
  eblb_settings = [
    {
      namespace = "aws:elbv2:loadbalancer"
      name      = "SecurityGroups"
      value     = join(",", sort([var.eblb_sg_id]))
    },
    {
      namespace = "aws:elbv2:loadbalancer"
      name      = "ManagedSecurityGroup"
      value     = var.eblb_sg_id
    },
    {
      namespace = "aws:elbv2:listener:default"
      name      = "ListenerEnabled"
      value     = "true"
    },
    {
      namespace = "aws:elbv2:listener:443"
      name      = "ListenerEnabled"
      value     = "true"
    },
    {
      namespace = "aws:elbv2:listener:443"
      name      = "Protocol"
      value     = "HTTPS"
    },
    {
      namespace = "aws:elbv2:listener:443"
      name      = "SSLCertificateArns"
      value     = "arn:aws:acm:us-west-2:568147580655:certificate/838d94f7-0d93-4ea1-8f0d-6c518bc1393a"
    },
    {
      namespace = "aws:elbv2:listener:443"
      name      = "SSLPolicy"
      value     = "ELBSecurityPolicy-2016-08"
    },
    {
      namespace = "aws:ec2:vpc"
      name      = "ELBSubnets"
      value     = join(",", sort(var.public_subnet_ids))
    },
    {
      namespace = "aws:elasticbeanstalk:environment"
      name      = "LoadBalancerType"
      value     = "application"
    },
    {
      namespace = "aws:elasticbeanstalk:environment:process:default"
      name      = "Protocol"
      value     = "HTTP"
    },
    {
      namespace = "aws:elasticbeanstalk:environment:process:default"
      name      = "Port"
      value     = "80"
    },
    {
      namespace = "aws:ec2:vpc"
      name      = "VPCId"
      value     = var.vpc_id
    },
    {
      namespace = "aws:ec2:vpc"
      name      = "AssociatePublicIpAddress"
      value     = "true"
    },
    {
      namespace = "aws:ec2:vpc"
      name      = "Subnets"
      value     = join(",", sort(var.public_subnet_ids))
    },
    {
      namespace = "aws:autoscaling:launchconfiguration"
      name      = "SecurityGroups"
      value     = var.eb_sg_id
    },
    {
      namespace = "aws:autoscaling:launchconfiguration"
      name      = "IamInstanceProfile"
      value     = aws_iam_instance_profile.ec2.name
    },
    {
      namespace = "aws:autoscaling:asg"
      name      = "Availability Zones"
      value     = "Any 2"
    },
    {
      namespace = "aws:elasticbeanstalk:environment"
      name      = "EnvironmentType"
      value     = "LoadBalanced"
    },
    {
      namespace = "aws:elasticbeanstalk:environment"
      name      = "ServiceRole"
      value     = aws_iam_role.service.name
    },
    {
      namespace = "aws:elasticbeanstalk:healthreporting:system"
      name      = "SystemType"
      value     = "enhanced"
    },
    {
      namespace = "aws:elasticbeanstalk:managedactions"
      name      = "ManagedActionsEnabled"
      value     = "true"
    },
    {
      namespace = "aws:elasticbeanstalk:managedactions"
      name      = "PreferredStartTime"
      value     = "Sat:08:00"
    },
    {
      namespace = "aws:elasticbeanstalk:managedactions:platformupdate"
      name      = "UpdateLevel"
      value     = "minor"
    },
    {
      namespace = "aws:autoscaling:asg"
      name      = "MinSize"
      value     = "1"
    },
    {
      namespace = "aws:autoscaling:updatepolicy:rollingupdate"
      name      = "RollingUpdateEnabled"
      value     = "true"
    },
    {
      namespace = "aws:autoscaling:updatepolicy:rollingupdate"
      name      = "RollingUpdateType"
      value     = "Health"
    },
    {
      namespace = "aws:autoscaling:updatepolicy:rollingupdate"
      name      = "MinInstancesInService"
      value     = "1"
    },
    {
      namespace = "aws:elasticbeanstalk:command"
      name      = "DeploymentPolicy"
      value     = "Rolling"
    },
    {
      namespace = "aws:autoscaling:updatepolicy:rollingupdate"
      name      = "MaxBatchSize"
      value     = "1"
    },
    {
      namespace = "aws:elasticbeanstalk:command"
      name      = "BatchSizeType"
      value     = "Fixed"
    },
    {
      namespace = "aws:elasticbeanstalk:command"
      name      = "BatchSize"
      value     = "1"
    },
    {
      namespace = "aws:autoscaling:trigger"
      name      = "MeasureName"
      value     = "CPUUtilization"
    },
    {
      namespace = "aws:autoscaling:trigger"
      name      = "Unit"
      value     = "Percent"
    },
    {
      namespace = "aws:autoscaling:trigger"
      name      = "LowerThreshold"
      value     = "20"
    },
    {
      namespace = "aws:autoscaling:trigger"
      name      = "UpperThreshold"
      value     = "80"
    },
    {
      namespace = "aws:elasticbeanstalk:cloudwatch:logs"
      name      = "StreamLogs"
      value     = "true"
    },
    {
      namespace = "aws:elasticbeanstalk:cloudwatch:logs"
      name      = "DeleteOnTerminate"
      value     = "true"
    },
    {
      namespace = "aws:elasticbeanstalk:cloudwatch:logs"
      name      = "RetentionInDays"
      value     = "7"
    },
    {
      namespace = "aws:elasticbeanstalk:cloudwatch:logs:health"
      name      = "HealthStreamingEnabled"
      value     = "false"
    },
    {
      namespace = "aws:elasticbeanstalk:cloudwatch:logs:health"
      name      = "DeleteOnTerminate"
      value     = "true"
    },
    {
      namespace = "aws:elasticbeanstalk:cloudwatch:logs:health"
      name      = "RetentionInDays"
      value     = "7"
    }
  ]
}
