#output "primary_endpoint" {
#  value = aws_elasticache_replication_group.default.primary_endpoint_address
#}
#
#output "cluster_endpoint" {
#  value = aws_elasticache_replication_group.default.configuration_endpoint_address
#}

output "primary_endpoint" {
  value = aws_elasticache_cluster.default.cache_nodes.0.address
}
