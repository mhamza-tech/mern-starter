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

variable "aws_region2" {
  type    = string
  default = "us-west-1"
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
