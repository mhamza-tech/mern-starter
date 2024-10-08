module "label" {
  source      = "git::https://github.com/cloudposse/terraform-null-label.git?ref=tags/0.16.0"
  namespace   = var.namespace
  environment = var.env
  name        = var.app_name
}

module "final_snapshot_label" {
  source      = "git::https://github.com/cloudposse/terraform-null-label.git?ref=tags/0.16.0"
  namespace   = var.namespace
  environment = var.env
  name        = var.app_name
  attributes  = ["final", "snapshot"]
}

resource "aws_security_group" "core" {
  name        = "${module.label.id}-rds"
  description = "Allow inbound traffic to GQL RDS"
  vpc_id      = var.vpc_id

  tags = {
    Name = "${module.label.id}-rds"
  }
}

resource "aws_security_group_rule" "core_rds_in_private" {
  type      = "ingress"
  from_port = var.postgres_port
  to_port   = var.postgres_port
  protocol  = "tcp"

  security_group_id        = aws_security_group.core.id
  source_security_group_id = var.eb_sg_id
}

resource "aws_security_group_rule" "core_rds_in_public" {
  # TODO temp public access in all environments
  # count             = var.env != "prd" ? 1 : 0
  type        = "ingress"
  from_port   = var.postgres_port
  to_port     = var.postgres_port
  protocol    = "tcp"
  cidr_blocks = ["0.0.0.0/0"]

  security_group_id = aws_security_group.core.id
}

resource "aws_security_group_rule" "core_rds_in_lambda" {
  type        = "ingress"
  from_port   = var.postgres_port
  to_port     = var.postgres_port
  protocol    = "tcp"

  security_group_id = aws_security_group.core.id
  source_security_group_id = var.lambda_sg_id
}

resource "aws_security_group_rule" "core_rds_out" {
  type        = "egress"
  from_port   = var.postgres_port
  to_port     = var.postgres_port
  protocol    = "tcp"
  cidr_blocks = ["0.0.0.0/0"]

  security_group_id = aws_security_group.core.id
}

resource "aws_db_subnet_group" "default" {
  name        = "${var.namespace}-${var.env}-default"
  description = "${var.env} RDS default subnet group"
  subnet_ids  = var.public_subnet_ids
}

# docs: https://www.terraform.io/docs/providers/aws/r/db_instance.html
resource "aws_db_instance" "core" {
  identifier            = module.label.id
  name                  = "postgres"
  username              = var.core_rds_username
  password              = var.core_rds_password
  port                  = var.postgres_port
  engine                = "postgres"
  engine_version        = "12.3"
  instance_class        = var.core_rds_instance
  allocated_storage     = var.core_rds_min_storage
  max_allocated_storage = var.core_rds_max_storage
  storage_encrypted     = true

  vpc_security_group_ids = [aws_security_group.core.id]

  ca_cert_identifier   = "rds-ca-2019"
  db_subnet_group_name = aws_db_subnet_group.default.id
  parameter_group_name = "default.postgres12"
  multi_az             = false
  storage_type         = "gp2"
  # publicly_accessible  = var.env != "prd" ? true : false
  publicly_accessible  = true
  # snapshot_identifier         = module.label.id
  backup_retention_period = var.env != "prd" ? 0 : 7
  backup_window           = "08:00-09:00"
  skip_final_snapshot     = true
  # final_snapshot_identifier = module.final_snapshot_label.id

  enabled_cloudwatch_logs_exports       = var.env != "prd" ? null : ["postgresql"]
  performance_insights_enabled          = var.env != "prd" ? false : true
  performance_insights_retention_period = var.env != "prd" ? 0 : 7

  # monitoring_interval = var.env != "prd" ? 0 : 30
  # monitoring_role_arn = ""
}
