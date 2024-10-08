variable "namespace" {
  type = string
}

variable "env" {
  type = string
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

variable "lambda_sg_id" {
  type = string
}

variable "core_rds" {
  type = map(string)
}

variable "images_bucket" {
  type = string
}

variable "dist_bucket" {
  type = string
}
