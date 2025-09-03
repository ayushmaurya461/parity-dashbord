import { Environment } from './environments';

export interface ServiceConfig {
  name: string;
  displayName: string;
  endpoint: string;
  versionPath: string;
}

export const SERVICES: ServiceConfig[] = [
  {
    name: 'admin',
    displayName: 'Admin API',
    endpoint: '/healthcheck?detailed=true',
    versionPath: 'version'
  },
  {
    name: 'alerts',
    displayName: 'Alert Service',
    endpoint: '/alert-service/monitoring-service/healthcheck?detailed=true',
    versionPath: 'version'
  },
  {
    name: 'bulk-upload',
    displayName: 'Bulk Upload Service',
    endpoint: '/bulk-upload-service/monitoring-service/healthcheck?detailed=true',
    versionPath: 'version'
  },
  {
    name: 'data-visualization',
    displayName: 'Data Visualization',
    endpoint: '/data-visualization-service/monitoring-service/healthcheck?detailed=true',
    versionPath: 'version'
  },
  {
    name: 'frontend',
    displayName: 'Frontend',
    endpoint: '/assets/git-info.json',
    versionPath: 'git'
  }
];

export function getServiceUrl(environment: Environment, service: ServiceConfig): string {
  // Special handling for frontend service - different base URLs per environment
  if (service.name === 'frontend') {
    const frontendUrls: Record<string, string> = {
      'Staging': 'https://dev.mgrant.in',
      'Production': 'https://portal.mgrant.in', 
      'UAT': 'https://uat.mgrant.in',
      'QA': 'https://qa.mgrant.in'
    };
    const baseUrl = frontendUrls[environment.title] || 'https://dev.mgrant.in';
    return `${baseUrl}${service.endpoint}`;
  }
  
  return `${environment.url}${service.endpoint}`;
}
