export interface CommitInfo {
  commit: string;
  branch: string;
  tag: string;
  buildTime?: string;
  app?: string;
}

export interface ServiceCommitData {
  service: string;
  status: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY' | 'UNKNOWN' | 'LOADING';
  version: CommitInfo | Record<string, CommitInfo>;
  error?: string;
}

export interface EnvironmentCommitData {
  environment: string;
  services: ServiceCommitData[];
}

export interface CommitTableData {
  environments: EnvironmentCommitData[];
  lastUpdated: string;
}
