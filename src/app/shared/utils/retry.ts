import { timer, throwError, Observable } from 'rxjs';
import { mergeMap, finalize } from 'rxjs/operators';

export interface RetryConfig {
  maxRetries: number;
  delay: number;
  backoffMultiplier: number;
  maxDelay: number;
}

export const defaultRetryConfig: RetryConfig = {
  maxRetries: 0,
  delay: 1000, // 1 second
  backoffMultiplier: 2,
  maxDelay: 10000 // 10 seconds max
};

export function retryWithBackoff<T>(config: Partial<RetryConfig> = {}) {
  const finalConfig = { ...defaultRetryConfig, ...config };
  
  return (source: Observable<T>) => {
    return source.pipe(
      mergeMap((value, index) => {
        if (index === 0) {
          return [value];
        }
        
        if (index > finalConfig.maxRetries) {
          return throwError(() => new Error(`Max retries (${finalConfig.maxRetries}) exceeded`));
        }
        
        const delayTime = Math.min(
          finalConfig.delay * Math.pow(finalConfig.backoffMultiplier, index - 1),
          finalConfig.maxDelay
        );
        
        console.log(`Retrying request (attempt ${index}/${finalConfig.maxRetries}) after ${delayTime}ms`);
        
        return timer(delayTime).pipe(
          mergeMap(() => [value])
        );
      })
    );
  };
}