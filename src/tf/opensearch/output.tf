output "domain_arn" {
  description = "The Amazon Resource Name (ARN) of the domain"
  value       = module.opensearch.domain_arn
}

output "package_associations" {
  description = "Map of package associations created and their attributes"
  value       = module.opensearch.package_associations
}

output "vpc_endpoints" {
  description = "Map of VPC endpoints created and their attributes"
  value       = module.opensearch.vpc_endpoints
}

output "outbound_connections" {
  description = "Map of outbound connections created and their attributes"
  value       = module.opensearch.outbound_connections
}

output "domain_id" {
  description = "The unique identifier for the domain"
  value       = module.opensearch.domain_id
}

output "domain_endpoint" {
  description = "Domain-specific endpoint used to submit index, search, and data upload requests"
  value       = module.opensearch.domain_endpoint
}

output "domain_dashboard_endpoint" {
  description = "Domain-specific endpoint for Dashboard without https scheme"
  value       = module.opensearch.domain_dashboard_endpoint
}

output "cloudwatch_logs" {
  description = "Map of CloudWatch log groups created and their attributes"
  value       = module.opensearch.cloudwatch_logs
}

output "security_group_arn" {
  description = "Amazon Resource Name (ARN) of the security group"
  value       = module.opensearch.security_group_arn
}

output "security_group_id" {
  description = "ID of the security group"
  value       = module.opensearch.security_group_id
}

