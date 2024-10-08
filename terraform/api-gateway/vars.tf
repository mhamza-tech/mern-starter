variable "namespace" {
  type = string
}

variable "env" {
  type = string
}

variable "image_upload_lambda" {
  type = map(string)
}

variable "avatar_upload_lambda" {
  type = map(string)
}
