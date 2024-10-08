variable "namespace" {
  type = string
}

variable "env" {
  type = string
}

variable "vpc_id" {
  type = string
}

variable "availability_zones" {
  type = list(string)
}

variable "private_subnet_ids" {
  type = list(string)
  default = []
}

variable "public_subnet_ids" {
  type = list(string)
}

variable "family" {
  type    = string
  default = "redis5.0"
}

variable "engine" {
  type    = string
  default = "redis"
}

variable "engine_version" {
  type    = string
  default = "5.0.5"
}

variable "parameter_group_name" {
  type    = string
  default = "default.redis5.0"
}

variable "instance" {
  type = string
}

variable "port" {
  type = number
}

variable "eb_sg_id" {
  type = string
}
