variable "aws_access_key" {
  type = string
}

variable "aws_secret_key" {
  type = string
}

variable "aws_region" {
  type    = string
  default = "us-west-2"
}

variable "availability_zones" {
  type = list(string)
  default = [
    "us-west-2a",
    "us-west-2b",
    "us-west-2c",
    "us-west-2d"
  ]
}

variable "namespace" {
  type    = string
  default = "unreal"
}

variable "env" {
  type = string
}

variable "gql_app_name" {
  type    = string
  default = "gql"
}

variable "postgres_port" {
  type    = number
  default = 5432
}

variable "core_rds_instance" {
  type = string
}

variable "core_min_rds_storage" {
  type    = number
  default = 20
}

variable "core_max_rds_storage" {
  type    = number
  default = 100
}

variable "core_rds_username" {
  type    = string
  default = "unreal"
}

variable "core_rds_password" {
  type    = string
  default = "password"
}

variable "core_rds_db" {
  type    = string
  default = "unreal_core"
}

variable "gql_app_instance" {
  type = string
}

variable "gql_eb_autoscale_max" {
  type = number
}

variable "redis_instance" {
  type = string
}

variable "redis_port" {
  type    = number
  default = 6379
}

variable "node_env" {
  type = string
}

variable "master_api_key" {
  type = string
}

variable "service_url" {
  type = string
}

variable "engine_api_key" {
  type = string
}

variable "apollo_debug_enabled" {
  type = bool
}

variable "apollo_tracing_enabled" {
  type = bool
}

variable "confirm_email_url" {
  type = string
}

variable "reset_password_url" {
  type = string
}

variable "firebase_service_account_file" {
  type = string
}

variable "log_level" {
  type = string
}

variable "log_context" {
  type = string
}

variable "mixpanel_token" {
  type = string
}

variable "ios_bundle_id" {
  type = string
}

variable "www_short_domain" {
  type = string
}

variable "www_domain" {
  type = string
}

variable "fb_shortlink_api_key" {
  type = string
}

variable "imgix_cdn_root_url" {
  type = string
}

variable "imgix_api_key" {
  type = string
}

variable "build_number" {
  type = string
}

variable "app_url" {
  type = string
}

variable "users_to_auto_friend" {
  type = string
}
