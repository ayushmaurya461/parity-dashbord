import { Component, inject, signal, computed, effect } from '@angular/core';
import { httpResource, HttpClient } from '@angular/common/http';
import { CommonModule, NgClass } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { StateService } from '../../shared/services/state';
import { ENVIRONMENTS } from '../../shared/config/environments';
import { SERVICES, getServiceUrl } from '../../shared/config/services';
import { CommitTableData, ServiceCommitData, EnvironmentCommitData } from '../../shared/models/commit-data';
import { AdminResponse } from '../../shared/models/admin';
import { AlertHealth } from '../../shared/models/alert';
import { ServiceHealth } from '../../shared/models/bulk-upload';
import { DataVisualization as DataVisualizationResponse } from '../../shared/models/data-vizualization';
import { FrontendResponse } from '../../shared/models/frontend';

@Component({
  selector: 'app-commits',
  standalone: true,
  imports: [CommonModule, NgClass],
  templateUrl: './commits.html',
  styleUrl: './commits.scss'
})
export class Commits {
  private stateService = inject(StateService);
  private http = inject(HttpClient);
  selectedEnvironment = signal<string | null>(null);
  environments = ENVIRONMENTS;
  services = SERVICES;
  
  // Baseline feature
  baselineEnvironment = signal<string>('Production');
  showMismatchesOnly = signal<boolean>(false);
  searchFilter = signal<string>('');
  
  // Refresh state
  isRefreshing = signal<boolean>(false);
  
  // Data resources for each service in each environment
  dataResources = new Map<string, any>();
  
  // Fresh data from direct HTTP calls during refresh
  freshData = signal<Map<string, any>>(new Map());
  
  // Computed data for the table
  tableData = computed(() => this.buildTableData());
  isLoading = computed(() => this.checkLoadingState());
  lastUpdated = signal<string>(new Date().toISOString());
  
  // Check if we have any data to show (even if some services are still loading)
  hasAnyData = computed(() => {
    const hasData = Array.from(this.dataResources.values()).some(resource => {
      try {
        return resource.value() !== null || resource.error() !== null;
      } catch (err) {
        // Resource is in error state, consider it as having data (error state)
        return true;
      }
    });
    console.log('Has any data:', hasData);
    return hasData;
  });

  constructor() {
    // Set default environment if none is selected
    if (!this.stateService.selectedEnvironment()) {
      this.stateService.selectedEnvironment.set(this.environments[0]);
      this.selectedEnvironment.set(this.environments[0].title);
    } else {
      this.selectedEnvironment.set(this.stateService.selectedEnvironment()?.title || null);
    }

    // Initialize data resources for all services and environments
    this.initializeDataResources();
    
    // Force updates when data changes
    this.setupDataWatchers();
  }
  
  private setupDataWatchers() {
    // Use effect to watch for changes in data resources
    effect(() => {
      // This effect will run whenever any of the data resources change
      this.dataResources.forEach((resource, key) => {
        try {
          const data = resource.value();
          const error = resource.error();
          const isLoading = resource.isLoading();
          
          // Log when data changes
          if (data || error) {
            console.log(`Data changed for ${key}:`, { data, error, isLoading });
            // Force a re-computation by updating the lastUpdated signal
            this.lastUpdated.set(new Date().toISOString());
          }
        } catch (err) {
          // Handle resources in error state
          console.log(`Resource ${key} is in error state:`, err);
          // Still trigger an update to show the error state
          this.lastUpdated.set(new Date().toISOString());
        }
      });
    });
  }

  setEnvironment(index: number) {
    this.stateService.selectedEnvironment.set(this.environments[index]);
    this.selectedEnvironment.set(this.environments[index].title);
  }

  private initializeDataResources() {
    this.environments.forEach(env => {
      this.services.forEach(service => {
        const key = `${env.title}-${service.name}`;
        const baseUrl = getServiceUrl(env, service);
        
        // Add cache-busting parameter to force fresh requests
        const url = `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}_refresh=${Date.now()}`;
        
        console.log(`Creating resource for ${key}: ${url}`);
        
        // Create appropriate resource based on service type
        let resource;
        switch (service.name) {
          case 'admin':
            resource = httpResource<AdminResponse>(() => url);
            break;
          case 'alerts':
            resource = httpResource<AlertHealth>(() => url);
            break;
          case 'bulk-upload':
            resource = httpResource<ServiceHealth>(() => url);
            break;
          case 'data-visualization':
            resource = httpResource<DataVisualizationResponse>(() => url);
            break;
          case 'frontend':
            resource = httpResource<FrontendResponse>(() => url);
            break;
          default:
            resource = httpResource<any>(() => url);
        }
        
        this.dataResources.set(key, resource);
      });
    });
  }

  private processServiceData(serviceName: string, data: any): ServiceCommitData {
    // Special handling for frontend service
    if (serviceName === 'frontend') {
      const frontendData = data as FrontendResponse;
      return {
        service: serviceName,
        status: 'HEALTHY',
        version: {
          commit: frontendData.git.shortCommit || frontendData.git.commit,
          branch: frontendData.git.branch,
          tag: frontendData.git.tag,
          buildTime: frontendData.buildTime
        },
        error: undefined
      };
    }

    // Handle other services
    return {
      service: serviceName,
      status: data.status || 'UNKNOWN',
      version: data.version || { commit: 'N/A', branch: 'N/A', tag: 'N/A' },
      error: undefined
    };
  }

  private buildTableData(): CommitTableData {
    console.log('Building table data...');
    console.log('Data resources size:', this.dataResources.size);
    const environmentData: EnvironmentCommitData[] = this.environments.map(env => {
      const services: ServiceCommitData[] = this.services.map(service => {
        const key = `${env.title}-${service.name}`;
        
        // Check if we have fresh data from direct HTTP calls
        const freshDataEntry = this.freshData().get(key);
        if (freshDataEntry) {
          console.log(`Using fresh data for ${key}:`, freshDataEntry);
          if (freshDataEntry.error) {
            return {
              service: service.name,
              status: 'UNHEALTHY',
              version: { commit: 'Error', branch: 'N/A', tag: 'N/A' },
              error: freshDataEntry.error
            };
          } else {
            // Process fresh data based on service type
            return this.processServiceData(service.name, freshDataEntry.data);
          }
        }
        
        const resource = this.dataResources.get(key);
        
        if (!resource) {
          return {
            service: service.name,
            status: 'UNKNOWN',
            version: { commit: 'N/A', branch: 'N/A', tag: 'N/A' },
            error: 'Resource not found'
          };
        }

        let data, error, isLoading;
        
        try {
          data = resource.value();
          error = resource.error();
          isLoading = resource.isLoading();
          
          // Debug logging
          console.log(`Service: ${service.name}, Env: ${env.title}, Key: ${key}`);
          console.log(`Data:`, data);
          console.log(`Error:`, error);
          console.log(`IsLoading:`, isLoading);
        } catch (err) {
          // Resource is in error state
          console.log(`Resource ${key} is in error state:`, err);
          data = null;
          error = err;
          isLoading = false;
        }
        
        if (error) {
          return {
            service: service.name,
            status: 'UNHEALTHY',
            version: { commit: 'Error', branch: 'N/A', tag: 'N/A' },
            error: error // Store raw error, format it when displaying
          };
        }

        if (!data) {
          // Check if resource is still loading
          if (resource.isLoading()) {
            return {
              service: service.name,
              status: 'LOADING',
              version: { commit: 'Loading...', branch: 'N/A', tag: 'N/A' }
            };
          }
          
          return {
            service: service.name,
            status: 'UNKNOWN',
            version: { commit: 'N/A', branch: 'N/A', tag: 'N/A' },
            error: 'No data available'
          };
        }

        // Special handling for frontend service
        if (service.name === 'frontend') {
          // Frontend service returns the data directly, not wrapped in a health check response
          const frontendData = data as FrontendResponse;
          return {
            service: service.name,
            status: 'HEALTHY',
            version: {
              commit: frontendData.git.shortCommit || frontendData.git.commit,
              branch: frontendData.git.branch,
              tag: frontendData.git.tag,
              buildTime: frontendData.buildTime
            },
            error: undefined
          };
        }

        return {
          service: service.name,
          status: data.status || 'UNKNOWN',
          version: data.version || { commit: 'N/A', branch: 'N/A', tag: 'N/A' }
        };
      });

      return {
        environment: env.title,
        services
      };
    });

    const result = {
      environments: environmentData,
      lastUpdated: this.lastUpdated()
    };
    
    console.log('Final table data:', result);
    return result;
  }

  private checkLoadingState(): boolean {
    const loadingStates = Array.from(this.dataResources.values()).map(resource => {
      try {
        return {
          isLoading: resource.isLoading(),
          hasData: resource.value() !== null,
          hasError: resource.error() !== null
        };
      } catch (err) {
        // Resource is in error state
        return {
          isLoading: false,
          hasData: false,
          hasError: true
        };
      }
    });
    
    console.log('Loading states:', loadingStates);
    const isLoading = loadingStates.some(state => state.isLoading);
    console.log('Overall loading state:', isLoading);
    
    return isLoading;
  }

  private formatError(error: any): string {
    if (typeof error === 'string') {
      return error;
    }
    
    // Handle HTTP status codes
    if (error?.status !== undefined && error?.status !== null) {
      const status = error.status;
      
      // 404 = Not Found
      if (status === 404) {
        return 'Not Found';
      }
      
      // 5xx errors = Server Down
      if (status >= 500 && status < 600) {
        return 'Server Down';
      }
      
      // 4xx errors (except 404) = Not Found
      if (status >= 400 && status < 500) {
        return 'Not Found';
      }
      
      // Status 0 = Server Down (network issues)
      if (status === 0) {
        return 'Server Down';
      }
    }
    
    // Handle error types
    if (error?.name) {
      switch (error.name) {
        case 'TimeoutError':
        case 'NetworkError':
        case 'AbortError':
          return 'Server Down';
        default:
          break;
      }
    }
    
    // Handle error messages
    if (error?.message) {
      const message = error.message.toLowerCase();
      
      if (message.includes('timeout') || 
          message.includes('network') || 
          message.includes('connection') ||
          message.includes('aborted')) {
        return 'Server Down';
      }
    }
    
    // Default fallback
    return 'Server Down';
  }

  getServiceData(environment: string, service: string): any {
    const key = `${environment}-${service}`;
    return this.dataResources.get(key);
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'HEALTHY':
        return 'text-green-600';
      case 'DEGRADED':
        return 'text-yellow-600';
      case 'UNHEALTHY':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  }

  getStatusDotClass(status: string): string {
    switch (status) {
      case 'HEALTHY':
        return 'bg-green-500';
      case 'DEGRADED':
        return 'bg-yellow-500';
      case 'UNHEALTHY':
        return 'bg-red-500';
      case 'LOADING':
        return 'bg-blue-500 animate-pulse';
      default:
        return 'bg-gray-400';
    }
  }

  formatCommit(version: any): string {
    if (typeof version === 'object' && version !== null) {
      // Handle single version object (like admin service)
      if (version.commit) {
        return version.commit.slice(0, 7);
      }
      
      // Handle multiple versions (like alerts, bulk-upload, data-visualization services)
      const versions = Object.values(version) as any[];
      if (versions.length > 0) {
        // Try to find the main service version first
        const mainServiceVersion = versions.find((v: any) => v.commit);
        if (mainServiceVersion) {
          return mainServiceVersion.commit.slice(0, 7);
        }
        
        // Fallback to first available version
        if (versions[0] && versions[0].commit) {
          return versions[0].commit.slice(0, 7);
        }
      }
    }
    return 'N/A';
  }

  // Get all commits from a version object
  getAllCommits(version: any): Array<{name: string, commit: string}> {
    if (typeof version === 'object' && version !== null) {
      // Handle frontend service (git-info.json structure)
      if (version.git && version.git.commit && version.git.commit !== 'Error' && version.git.commit !== 'N/A') {
        return [{ name: 'main', commit: version.git.shortCommit || version.git.commit.slice(0, 7) }];
      }
      
      // Handle single version object (like admin service)
      if (version.commit && version.commit !== 'Error' && version.commit !== 'N/A') {
        return [{ name: 'main', commit: version.commit.slice(0, 7) }];
      }
      
      // Handle multiple versions (like alerts, bulk-upload, data-visualization services)
      const commits: Array<{name: string, commit: string}> = [];
      Object.entries(version).forEach(([key, value]: [string, any]) => {
        if (value && value.commit && value.commit !== 'Error' && value.commit !== 'N/A') {
          commits.push({
            name: key,
            commit: value.commit.slice(0, 7)
          });
        }
      });
      return commits;
    }
    return [];
  }

  // Get all commits for a service in an environment
  getAllServiceCommits(environment: string, serviceName: string): Array<{name: string, commit: string}> {
    const serviceData = this.getServiceDataForEnvironment(environment, serviceName);
    
    // If there's an error, return empty array (no valid commits)
    if (serviceData?.error) {
      return [];
    }
    
    if (serviceData && serviceData.version) {
      return this.getAllCommits(serviceData.version);
    }
    return [];
  }

  refreshData() {
    console.log('Manual refresh triggered - using direct HTTP calls');
    
    // Set refreshing state
    this.isRefreshing.set(true);
    
    // Update timestamp immediately
    this.lastUpdated.set(new Date().toISOString());
    
    // Set a timeout fallback to ensure button always returns to normal
    const timeoutId = setTimeout(() => {
      console.log('Refresh timeout - forcing button to return to normal');
      this.isRefreshing.set(false);
      this.lastUpdated.set(new Date().toISOString());
    }, 10000); // 10 second timeout
    
    // Make direct HTTP calls to refresh data
    const refreshPromises: Promise<any>[] = [];
    
    this.environments.forEach(env => {
      this.services.forEach(service => {
        const key = `${env.title}-${service.name}`;
        const url = getServiceUrl(env, service);
        
        console.log(`Making direct HTTP call for ${key}: ${url}`);
        
        // Make direct HTTP call based on service type
        let promise: Promise<any>;
        switch (service.name) {
          case 'admin':
            promise = firstValueFrom(this.http.get<AdminResponse>(url));
            break;
          case 'alerts':
            promise = firstValueFrom(this.http.get<AlertHealth>(url));
            break;
          case 'bulk-upload':
            promise = firstValueFrom(this.http.get<ServiceHealth>(url));
            break;
          case 'data-visualization':
            promise = firstValueFrom(this.http.get<DataVisualizationResponse>(url));
            break;
          case 'frontend':
            promise = firstValueFrom(this.http.get<FrontendResponse>(url));
            break;
          default:
            promise = firstValueFrom(this.http.get<any>(url));
        }
        
        refreshPromises.push(
          promise.then(data => {
            console.log(`Successfully refreshed ${key}:`, data);
            return { key, data, error: null };
          }).catch(error => {
            console.log(`Error refreshing ${key}:`, error);
            return { key, data: null, error };
          })
        );
      });
    });
    
    // Check if we have any requests to make
    if (refreshPromises.length === 0) {
      console.log('No requests to make - stopping refresh immediately');
      clearTimeout(timeoutId);
      this.isRefreshing.set(false);
      this.lastUpdated.set(new Date().toISOString());
      return;
    }
    
    console.log(`Making ${refreshPromises.length} HTTP requests for refresh`);
    
    // Wait for all requests to complete
    Promise.all(refreshPromises).then(results => {
      console.log('All refresh requests completed:', results);
      
      // Store fresh data in the signal
      const freshDataMap = new Map<string, any>();
      results.forEach(result => {
        freshDataMap.set(result.key, { data: result.data, error: result.error });
      });
      this.freshData.set(freshDataMap);
      console.log('Stored fresh data:', freshDataMap);
      
      // Clear the timeout since we completed successfully
      clearTimeout(timeoutId);
      
      // Clear and recreate resources with fresh data
      this.dataResources.clear();
      this.initializeDataResources();
      
      // Update timestamp and stop refreshing
      this.lastUpdated.set(new Date().toISOString());
      this.isRefreshing.set(false);
      console.log('Refresh completed - button should return to normal');
    }).catch(error => {
      console.error('Error during refresh:', error);
      
      // Clear the timeout since we're handling the error
      clearTimeout(timeoutId);
      
      // Even if there's an error, make sure to stop refreshing
      this.isRefreshing.set(false);
      this.lastUpdated.set(new Date().toISOString());
      console.log('Refresh failed but button returned to normal');
    });
  }

  getServiceDataForEnvironment(environment: string, serviceName: string): any {
    const environmentData = this.tableData().environments.find(e => e.environment === environment);
    if (!environmentData) return null;
    
    const serviceData = environmentData.services.find(s => s.service === serviceName);
    return serviceData;
  }

  getServiceStatus(environment: string, serviceName: string): string {
    const serviceData = this.getServiceDataForEnvironment(environment, serviceName);
    return serviceData?.status || 'UNKNOWN';
  }

  getServiceCommit(environment: string, serviceName: string): string {
    const serviceData = this.getServiceDataForEnvironment(environment, serviceName);
    return this.formatCommit(serviceData?.version);
  }

  getServiceError(environment: string, serviceName: string): string | null {
    const serviceData = this.getServiceDataForEnvironment(environment, serviceName);
    if (serviceData?.error) {
      return this.formatError(serviceData.error);
    }
    return null;
  }

  getHealthyCount(): number {
    let count = 0;
    this.tableData().environments.forEach(env => {
      env.services.forEach(service => {
        if (service.status === 'HEALTHY') count++;
      });
    });
    return count;
  }

  getDegradedCount(): number {
    let count = 0;
    this.tableData().environments.forEach(env => {
      env.services.forEach(service => {
        if (service.status === 'DEGRADED') count++;
      });
    });
    return count;
  }

  getUnhealthyCount(): number {
    let count = 0;
    this.tableData().environments.forEach(env => {
      env.services.forEach(service => {
        if (service.status === 'UNHEALTHY' || service.status === 'UNKNOWN') count++;
      });
    });
    return count;
  }

  getLoadingCount(): number {
    let count = 0;
    this.tableData().environments.forEach(env => {
      env.services.forEach(service => {
        if (service.status === 'LOADING') count++;
      });
    });
    return count;
  }

  // Baseline functionality
  setBaseline(environment: string) {
    this.baselineEnvironment.set(environment);
  }

  toggleMismatchesOnly() {
    this.showMismatchesOnly.set(!this.showMismatchesOnly());
  }

  setSearchFilter(filter: string) {
    this.searchFilter.set(filter);
  }

  onBaselineChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.setBaseline(target.value);
  }

  onSearchChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.setSearchFilter(target.value);
  }

  clearSearch() {
    this.setSearchFilter('');
  }

  getSearchResultCount(): number {
    return this.getFilteredServices().length;
  }

  getTotalServiceCount(): number {
    return this.services.length;
  }

  // Get baseline commit for a service
  getBaselineCommit(serviceName: string): string {
    const baselineEnv = this.baselineEnvironment();
    const baselineCommit = this.getServiceCommit(baselineEnv, serviceName);
    
    // If baseline environment has an error, try to find a working environment for this service
    if (baselineCommit === 'N/A') {
      for (const env of this.environments) {
        const commit = this.getServiceCommit(env.title, serviceName);
        if (commit !== 'N/A') {
          return commit;
        }
      }
    }
    
    return baselineCommit;
  }

  // Check if a service commit matches the baseline
  // Returns true ONLY if ALL commits match (same names and same commit hashes)
  isCommitMatchingBaseline(environment: string, serviceName: string): boolean {
    const baselineCommits = this.getAllServiceCommits(this.baselineEnvironment(), serviceName);
    const currentCommits = this.getAllServiceCommits(environment, serviceName);
    
    // If no commits available, return false
    if (baselineCommits.length === 0 || currentCommits.length === 0) {
      return false;
    }
    
    // If different number of commits, they can't all match
    if (baselineCommits.length !== currentCommits.length) {
      return false;
    }
    
    // Check that EVERY baseline commit has a matching current commit
    // This ensures ALL commits match, not just some
    return baselineCommits.every(baselineCommit => {
      const matchingCurrent = currentCommits.find(current => current.name === baselineCommit.name);
      return matchingCurrent && matchingCurrent.commit === baselineCommit.commit;
    });
  }

  // Get baseline commits for a service
  getBaselineCommits(serviceName: string): Array<{name: string, commit: string}> {
    return this.getAllServiceCommits(this.baselineEnvironment(), serviceName);
  }

  // Get mismatched commits for debugging
  getMismatchedCommits(environment: string, serviceName: string): Array<{name: string, baseline: string, current: string}> {
    const baselineCommits = this.getAllServiceCommits(this.baselineEnvironment(), serviceName);
    const currentCommits = this.getAllServiceCommits(environment, serviceName);
    const mismatches: Array<{name: string, baseline: string, current: string}> = [];
    
    baselineCommits.forEach(baselineCommit => {
      const currentCommit = currentCommits.find(current => current.name === baselineCommit.name);
      if (!currentCommit || currentCommit.commit !== baselineCommit.commit) {
        mismatches.push({
          name: baselineCommit.name,
          baseline: baselineCommit.commit,
          current: currentCommit?.commit || 'N/A'
        });
      }
    });
    
    return mismatches;
  }

  // Get filtered services based on search and mismatch filter
  getFilteredServices() {
    let filteredServices = this.services;
    
    // Apply search filter
    if (this.searchFilter()) {
      const searchTerm = this.searchFilter().toLowerCase();
      filteredServices = filteredServices.filter(service => {
        // Search in service name and display name
        if (service.displayName.toLowerCase().includes(searchTerm) ||
            service.name.toLowerCase().includes(searchTerm)) {
          return true;
        }
        
        // Search in commit data across all environments
        return this.environments.some(env => {
          const serviceData = this.getServiceDataForEnvironment(env.title, service.name);
          if (!serviceData) return false;
          
          // Search in commit hashes
          if (serviceData.version && typeof serviceData.version === 'object') {
            if (serviceData.version.commit && 
                serviceData.version.commit.toLowerCase().includes(searchTerm)) {
              return true;
            }
            if (serviceData.version.branch && 
                serviceData.version.branch.toLowerCase().includes(searchTerm)) {
              return true;
            }
            if (serviceData.version.tag && 
                serviceData.version.tag.toLowerCase().includes(searchTerm)) {
              return true;
            }
          }
          
          // Search in multiple commits (for services with sub-components)
          const allCommits = this.getAllServiceCommits(env.title, service.name);
          if (allCommits.some(commit => 
              commit.commit.toLowerCase().includes(searchTerm) ||
              commit.name.toLowerCase().includes(searchTerm))) {
            return true;
          }
          
          return false;
        });
      });
    }
    
    // Apply mismatch filter
    if (this.showMismatchesOnly()) {
      filteredServices = filteredServices.filter(service => {
        // Check if any environment has a different commit than baseline
        return this.environments.some(env => 
          !this.isCommitMatchingBaseline(env.title, service.name)
        );
      });
    }
    
    return filteredServices;
  }

  // Get commit status class based on baseline comparison
  getCommitStatusClass(environment: string, serviceName: string): string {
    const baselineCommits = this.getAllServiceCommits(this.baselineEnvironment(), serviceName);
    const currentCommits = this.getAllServiceCommits(environment, serviceName);
    const baselineEnv = this.baselineEnvironment();
    
    // If current environment is the baseline environment and it has no data, show gray
    if (environment === baselineEnv && currentCommits.length === 0) {
      return 'text-gray-500';
    }
    
    // If no baseline commits available, show gray
    if (baselineCommits.length === 0) {
      return 'text-gray-500';
    }
    
    // If current commits are not available, show gray
    if (currentCommits.length === 0) {
      return 'text-gray-500';
    }
    
    if (this.isCommitMatchingBaseline(environment, serviceName)) {
      return 'text-green-600';
    } else {
      return 'text-red-600';
    }
  }

  // Get commit status icon based on baseline comparison
  getCommitStatusIcon(environment: string, serviceName: string): string {
    const baselineCommits = this.getAllServiceCommits(this.baselineEnvironment(), serviceName);
    const currentCommits = this.getAllServiceCommits(environment, serviceName);
    const baselineEnv = this.baselineEnvironment();
    
    // If current environment is the baseline environment and it has no data, show question mark
    if (environment === baselineEnv && currentCommits.length === 0) {
      return '';
    }
    
    // If no baseline commits available, show question mark
    if (baselineCommits.length === 0) {
      return '';
    }
    
    // If current commits are not available, show question mark
    if (currentCommits.length === 0) {
      return '';
    }
    
    if (this.isCommitMatchingBaseline(environment, serviceName)) {
      return '✅';
    } else {
      return '❌';
    }
  }
}
