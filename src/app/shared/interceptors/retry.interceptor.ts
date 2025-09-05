import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { retry, timer, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export const retryInterceptor: HttpInterceptorFn = (req, next) => {
  // Only apply retry to health check endpoints
  const isHealthCheck = req.url.includes('healthcheck') || req.url.includes('monitoring-service');
  
  if (!isHealthCheck) {
    return next(req);
  }

  return next(req).pipe(
    retry({
      count: 3,
      delay: (error: HttpErrorResponse, retryCount: number) => {
        // Only retry on network errors or 5xx server errors
        if (shouldRetry(error)) {
          const delay = Math.min(1000 * Math.pow(2, retryCount - 1), 8000);
          return timer(delay);
        }
        
        // Don't retry for client errors (4xx)
        return throwError(() => error);
      }
    }),
    catchError((error: HttpErrorResponse) => {
      return throwError(() => error);
    })
  );
};

function shouldRetry(error: HttpErrorResponse): boolean {
  // Retry on network errors (status 0) or server errors (5xx)
  return !error.status || error.status >= 500;
}