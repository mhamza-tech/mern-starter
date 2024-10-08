terraform {
  backend "s3" {
    bucket  = "unreal-terraform-state-us-west-2"
    key     = "terraform.tfstate"
    region  = "us-west-2"
    encrypt = true
  }
}

data "terraform_remote_state" "shared" {
  backend = "s3"
  config  = {
    bucket = "unreal-terraform-state-us-west-2"
    key    = "shared/terraform.tfstate"
    region = "us-west-2"
  }
}

locals {
  vpc = {
    vpc_id            = data.terraform_remote_state.shared.outputs.vpc_id
    #    private_subnet_ids = data.terraform_remote_state.shared.outputs.private_subnet_ids
    public_subnet_ids = data.terraform_remote_state.shared.outputs.public_subnet_ids
    eblb_sg           = data.terraform_remote_state.shared.outputs.eblb_sg
    eb_sg             = data.terraform_remote_state.shared.outputs.eb_sg
    services_sg       = data.terraform_remote_state.shared.outputs.services_sg
  }

  beanstalk = {
    application_name = data.terraform_remote_state.shared.outputs.eb_application_name
  }

  s3 = {
    dist_bucket = data.terraform_remote_state.shared.outputs.dist_bucket
  }
}

module "s3" {
  source = "./s3"

  env       = var.env
  namespace = var.namespace
  region    = var.aws_region
}

module "rds" {
  source = "./rds"

  env                  = var.env
  namespace            = var.namespace
  region               = var.aws_region
  vpc_id               = local.vpc.vpc_id
  #  private_subnet_ids   = local.vpc.private_subnet_ids
  public_subnet_ids    = local.vpc.public_subnet_ids
  eb_sg_id             = local.vpc.eb_sg["id"]
  lambda_sg_id         = local.vpc.services_sg["id"]
  core_rds_instance    = var.core_rds_instance
  core_rds_min_storage = var.core_min_rds_storage
  core_rds_max_storage = var.core_max_rds_storage
  postgres_port        = var.postgres_port
  core_rds_username    = var.core_rds_username
  core_rds_password    = var.core_rds_password
}

module "redis" {
  source = "./elasticache"

  env                = var.env
  namespace          = var.namespace
  availability_zones = var.availability_zones
  vpc_id             = local.vpc.vpc_id
  #  private_subnet_ids = local.vpc.private_subnet_ids
  public_subnet_ids  = local.vpc.public_subnet_ids
  eb_sg_id           = local.vpc.eb_sg["id"]
  instance           = var.redis_instance
  port               = var.redis_port
}

module "beanstalk" {
  source = "./beanstalk"

  env               = var.env
  namespace         = var.namespace
  region            = var.aws_region
  application_name  = local.beanstalk.application_name
  gql_app_name      = var.gql_app_name
  vpc_id            = local.vpc.vpc_id
  #  private_subnet_ids = local.vpc.private_subnet_ids
  public_subnet_ids = local.vpc.public_subnet_ids
  eblb_sg_id        = local.vpc.eblb_sg["id"]
  eb_sg_id          = local.vpc.eb_sg["id"]
  gql_app_instance  = var.gql_app_instance
  gql_autoscale_max = var.gql_eb_autoscale_max

  core_rds = {
    port     = var.postgres_port
    endpoint = module.rds.core_db_endpoint
    username = var.core_rds_username
    password = var.core_rds_password
    db_name  = var.core_rds_db
  }

  redis = {
    port     = var.redis_port
    endpoint = module.redis.primary_endpoint
  }

  env_vars = {
    build_number                  = var.build_number
    node_env                      = var.node_env
    master_api_key                = var.master_api_key
    service_url                   = var.service_url
    engine_api_key                = var.engine_api_key
    apollo_debug_enabled          = var.apollo_debug_enabled
    apollo_tracing_enabled        = var.apollo_tracing_enabled
    confirm_email_url             = var.confirm_email_url
    reset_password_url            = var.reset_password_url
    firebase_service_account_file = var.firebase_service_account_file
    unreal_aws_s3_bucket          = module.s3.main_id
    mixpanel_token                = var.mixpanel_token
    log_level                     = var.log_level
    log_context                   = var.log_context
    ios_bundle_id                 = var.ios_bundle_id
    www_short_domain              = var.www_short_domain
    www_domain                    = var.www_domain
    app_url                       = var.app_url
    fb_shortlink_api_key          = var.fb_shortlink_api_key
    imgix_cdn_root_url            = var.imgix_cdn_root_url
    imgix_api_key                 = var.imgix_api_key
    users_to_auto_friend          = var.users_to_auto_friend
  }
}

module "lambda" {
  source = "./lambda"

  env               = var.env
  namespace         = var.namespace
  vpc_id            = local.vpc.vpc_id
  #  private_subnet_ids = local.vpc.private_subnet_ids
  public_subnet_ids = local.vpc.public_subnet_ids
  lambda_sg_id      = local.vpc.services_sg["id"]

  core_rds = {
    port     = var.postgres_port
    endpoint = module.rds.core_db_endpoint
    username = var.core_rds_username
    password = var.core_rds_password
    db_name  = var.core_rds_db
  }

  images_bucket = module.s3.main_id
  dist_bucket   = local.s3.dist_bucket
}

module "api_gateway" {
  source = "./api-gateway"

  env                  = var.env
  namespace            = var.namespace
  image_upload_lambda  = module.lambda.image_upload_lambda
  avatar_upload_lambda = module.lambda.avatar_lambda
}
