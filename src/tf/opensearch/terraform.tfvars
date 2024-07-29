domain_name    = "test-dashboard012"
engine_version = "OpenSearch_1.0" //"Elasticsearch_7.9"

advanced_security_options = {
  enabled                        = false
  anonymous_auth_enabled         = true
  internal_user_database_enabled = true

  master_user_options = {
    master_user_name     = "DUMMY"
    master_user_password = ""
  }
}

auto_tune_options = {
  "desired_state" : "ENABLED",
  "rollback_on_disable" : "NO_ROLLBACK"
}

cluster_config = {
  instance_count           = 2
  dedicated_master_enabled = true
  dedicated_master_type    = "r5.large.search"
  instance_type            = "r5.large.search"

  zone_awareness_config = {
    availability_zone_count = 2
  }

  zone_awareness_enabled = true
}

vpc_options = {
  subnet_ids         = ["subnet-0b363f6379d08c4f2", "subnet-0d051fbf32c9196f2"]
  security_group_ids = ["sg-0ecf9597ea536f807"]
}

encrypt_at_rest = {
  "enabled" : true
}

domain_endpoint_options = {
  "enforce_https" : true,
  "tls_security_policy" : "Policy-Min-TLS-1-2-2019-07"
}

ebs_options = {
  ebs_enabled = true
  iops        = 3000
  throughput  = 125
  volume_type = "gp3"
  volume_size = 20
}

create = true

node_to_node_encryption = {
  "enabled" : true
}

log_publishing_options = [
  { log_type = "INDEX_SLOW_LOGS" },
  { log_type = "SEARCH_SLOW_LOGS" }
]

create_access_policy                   = true
create_security_group                  = true
cloudwatch_log_group_retention_in_days = 60
create_cloudwatch_log_groups           = true
create_cloudwatch_log_resource_policy  = true
