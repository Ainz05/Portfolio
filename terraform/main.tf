terraform {
  required_providers {
    ovh = {
      source = "ovh/ovh"
    }
  }
}

provider "ovh" {
  endpoint = "ovh-eu"
}

resource "ovh_domain_zone_record" "apex" {
  zone      = var.zone
  fieldtype = "A"
  ttl       = 3600
  target    = var.server_ip
}

resource "ovh_domain_zone_record" "www" {
  zone      = var.zone
  subdomain = "www"
  fieldtype = "A"
  ttl       = 3600
  target    = var.server_ip
}