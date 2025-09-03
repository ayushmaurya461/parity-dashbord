type HealthStatus = "HEALTHY" | "DEGRADED" | "UNHEALTHY";

interface VersionInfo {
  app?: string;
  commit: string;
  branch: string;
  tag: string;
  buildTime?: string;
}

interface Versions {
  mform_bulk_upload_service: VersionInfo;
  mform_base: VersionInfo;
  mgrant_base: VersionInfo;
}

interface MemoryUsage {
  rss: string;
  heapTotal: string;
  heapUsed: string;
  external: string;
}

interface RuntimeInfo {
  nodeVersion: string;
  platform: string;
  arch: string;
  uptime: string;
  uptimeMs: number;
  memoryUsage: MemoryUsage;
  environment: string;
  domainEnv: string;
}

interface MemoryHealthDetails {
  heapUsedPercent: number;
  threshold: number;
  heapUsed: number;
  heapTotal: number;
}

interface MemoryHealthCheck {
  status: HealthStatus;
  details: MemoryHealthDetails;
  responseTime: string;
}

interface Checks {
  memoryHealthCheck: MemoryHealthCheck;
}

export interface ServiceHealth {
  status: HealthStatus;
  timestamp: string;
  service: string;
  version: Versions;
  runtime: RuntimeInfo;
  checks: Checks;
}
