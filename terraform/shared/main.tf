terraform {
  backend "s3" {
    bucket  = "unreal-terraform-state-us-west-2"
    key     = "shared/terraform.tfstate"
    region  = "us-west-2"
    encrypt = true
  }
}

