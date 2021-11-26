// TODO: retry attempt should be pass as start flow payload
import * as joi from 'joiful';

// Retry policy for each flow
export class RetryPolicy {
  // Timeouts between flow retries
  // Default 1000ms
  @(joi
    .array()
    .items(joi => joi.number().integer())
    .min(1)
    .required())
  timeouts: Array<number> = [1000];

  // BackOff policy
  @(joi.boolean().required())
  exponentialBackOff = false;

  // Number of retry times
  @(joi.number().integer().required())
  retryCount = 1;
}
