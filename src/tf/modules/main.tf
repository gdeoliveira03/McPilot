module "opensearch" {
  # Module source and version
  source  = "terraform-aws-modules/opensearch/aws"
  version = "1.1.2"

  # Module inputs
  vpc_endpoints                           = var.vpc_endpoints
  encrypt_at_rest                         = var.encrypt_at_rest
  log_publishing_options                  = var.log_publishing_options
  access_policy_override_policy_documents = var.access_policy_override_policy_documents
  tags                                    = var.tags
  advanced_security_options               = var.advanced_security_options
  cluster_config                          = var.cluster_config
  domain_name                             = var.domain_name
  ebs_options                             = var.ebs_options
  create                                  = var.create
  node_to_node_encryption                 = var.node_to_node_encryption
  access_policy_statements                = var.access_policy_statements
  create_security_group                   = var.create_security_group
  cloudwatch_log_group_retention_in_days  = var.cloudwatch_log_group_retention_in_days
  cloudwatch_log_group_kms_key_id         = var.cloudwatch_log_group_kms_key_id
  package_associations                    = var.package_associations
  enable_access_policy                    = var.enable_access_policy
  create_saml_options                     = var.create_saml_options
  saml_options                            = var.saml_options
  create_cloudwatch_log_groups            = var.create_cloudwatch_log_groups
  cloudwatch_log_resource_policy_name     = var.cloudwatch_log_resource_policy_name
  advanced_options                        = var.advanced_options
  auto_tune_options                       = var.auto_tune_options
  vpc_options                             = var.vpc_options
  access_policies                         = var.access_policies
  access_policy_source_policy_documents   = var.access_policy_source_policy_documents
  create_cloudwatch_log_resource_policy   = var.create_cloudwatch_log_resource_policy
  security_group_name                     = var.security_group_name
  security_group_tags                     = var.security_group_tags
  cognito_options                         = var.cognito_options
  domain_endpoint_options                 = var.domain_endpoint_options
  engine_version                          = var.engine_version
  off_peak_window_options                 = var.off_peak_window_options
  software_update_options                 = var.software_update_options
  create_access_policy                    = var.create_access_policy
  security_group_rules                    = var.security_group_rules
  outbound_connections                    = var.outbound_connections
  security_group_use_name_prefix          = var.security_group_use_name_prefix
  security_group_description              = var.security_group_description

  # test Overrides
}
