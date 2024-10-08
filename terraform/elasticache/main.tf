module "label" {
  source      = "git::https://github.com/cloudposse/terraform-null-label.git?ref=tags/0.16.0"
  namespace   = var.namespace
  environment = var.env
}

resource "aws_security_group" "redis" {
  name        = "${module.label.id}-redis"
  description = "Allow inbound traffic to Elasticache (Redis)"
  vpc_id      = var.vpc_id

  tags = {
    Name = "${module.label.id}-redis"
  }
}

resource "aws_security_group_rule" "redis_in_private" {
  type      = "ingress"
  from_port = var.port
  to_port   = var.port
  protocol  = "tcp"

  security_group_id        = aws_security_group.redis.id
  source_security_group_id = var.eb_sg_id
}

resource "aws_security_group_rule" "redis_in_public" {
  count       = var.env != "prd" ? 1 : 0
  type        = "ingress"
  from_port   = var.port
  to_port     = var.port
  protocol    = "tcp"
  cidr_blocks = ["0.0.0.0/0"]

  security_group_id = aws_security_group.redis.id
}

resource "aws_security_group_rule" "redis_out" {
  type        = "egress"
  from_port   = var.port
  to_port     = var.port
  protocol    = "tcp"
  cidr_blocks = ["0.0.0.0/0"]

  security_group_id = aws_security_group.redis.id
}

resource "aws_elasticache_subnet_group" "default" {
  name        = "${module.label.id}-default"
  description = "${var.env} Elasticache default subnet group"
  subnet_ids  = var.public_subnet_ids
}

resource "aws_elasticache_parameter_group" "default" {
  name   = "${module.label.id}-default"
  family = var.family

  parameter {
    name  = "set-max-intset-entries"
    value = "1000"
  }

  parameter {
    name  = "hash-max-ziplist-entries"
    value = "1000"
  }

  parameter {
    name  = "maxmemory-policy"
    value = "allkeys-lfu"
  }
}

# docs: https://www.terraform.io/docs/providers/aws/r/elasticache_replication_group.html
#resource "aws_elasticache_replication_group" "default" {
#  replication_group_id          = module.label.id
#  replication_group_description = "${var.env} Elasticache(Redis) instance"
#  node_type                     = var.instance
#  number_cache_clusters         = 1
#  #  automatic_failover_enabled    = true
#
#  #  availability_zones = var.availability_zones
#  subnet_group_name  = aws_elasticache_subnet_group.default.id
#  security_group_ids = [aws_security_group.redis.id]
#
#  parameter_group_name = var.parameter_group_name
#  engine               = var.engine
#  engine_version       = var.engine_version
#  port                 = var.port
#
#  #  cluster_mode {
#  #    replicas_per_node_group = 1
#  #    num_node_groups         = 2
#  #  }
#
#  #  lifecycle {
#  #    ignore_changes = ["number_cache_clusters"]
#  #  }
#}

# docs: https://www.terraform.io/docs/providers/aws/r/elasticache_cluster.html
resource "aws_elasticache_cluster" "default" {
  #  count = 1
  #  cluster_id           = "${module.label.id}-${count.index}"
  #  replication_group_id = "${aws_elasticache_replication_group.default.id}"

  cluster_id      = module.label.id
  node_type       = var.instance
  num_cache_nodes = 1

  subnet_group_name  = aws_elasticache_subnet_group.default.id
  security_group_ids = [aws_security_group.redis.id]

  parameter_group_name = aws_elasticache_parameter_group.default.name
  engine               = var.engine
  engine_version       = var.engine_version
  port                 = var.port
}
