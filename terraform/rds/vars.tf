variable "namespace" {
  type = string
}

variable "env" {
  type = string
}

variable "region" {
  type = string
}

variable "app_name" {
  type    = string
  default = "core"
}

variable "vpc_id" {
  type = string
}

variable "private_subnet_ids" {
  type = list(string)
  default = []
}

variable "public_subnet_ids" {
  type = list(string)
}

variable "eb_sg_id" {
  type = string
}

variable "lambda_sg_id" {
  type = string
}

variable "core_rds_instance" {
  type = string
}

variable "core_rds_min_storage" {
  type = number
}

variable "core_rds_max_storage" {
  type = number
}

variable "postgres_port" {
  type = number
}

variable "core_rds_username" {
  type = string
}

variable "core_rds_password" {
  type = string
}

