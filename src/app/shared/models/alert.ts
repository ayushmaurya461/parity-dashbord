// alert-health.model.ts
export interface AlertVersion {
  app?: string;
  commit: string;
  branch: string;
  tag: string;
  buildTime?: string;
}

export interface MemoryUsage {
  rss: string;
  heapTotal: string;
  heapUsed: string;
  external: string;
}

export interface MemoryHealthDetails {
  heapUsedPercent: number;
  threshold: number;
  heapUsed: number;
  heapTotal: number;
}

export interface MemoryHealthCheck {
  status: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY';
  details: MemoryHealthDetails;
  responseTime: string;
}

export interface AlertHealth {
  status: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY' | 'UNKNOWN';
  timestamp: string;
  service: string;
  version: Record<string, AlertVersion>;
  runtime: {
    nodeVersion: string;
    platform: string;
    arch: string;
    uptime: string;
    uptimeMs: number;
    memoryUsage: MemoryUsage;
    environment: string;
    domainEnv: string;
  };
  checks: {
    memoryHealthCheck: MemoryHealthCheck;
  };
}