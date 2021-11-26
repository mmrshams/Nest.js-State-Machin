import * as joi from 'joiful';

export class Config {
  constructor(data: Partial<Config>) {
    Object.assign(this, data);
  }

  @(joi.string().required())
  readonly GRPC_URI!: string;

  @(joi.boolean().required().default(false))
  readonly GRPC_SET_DEFAULT_VALUES!: boolean;

  @(joi.boolean().required().default(false))
  readonly MONGODB_ENABLED!: boolean;

  @(joi.string().required())
  readonly MONGODB_URI!: string;

  @(joi.string().required())
  readonly REDIS_READ_URI!: string;

  @(joi.string().required())
  readonly REDIS_WRITE_URI!: string;

  @(joi.string().required())
  readonly HEALTH_URI!: string;

  @(joi.string().required())
  readonly PROVIDER_TCP_URI!: string;

  @(joi.string().required())
  readonly PROVIDER_GRPC_URI!: string;

  @(joi.string().required())
  readonly GATEWAY_TCP_URI!: string;

  @(joi.string().required())
  readonly PROXY_TCP_URI!: string;

  @(joi.string().required())
  readonly SENTRY_DSN!: string;

  @(joi.string().required())
  readonly SERVICE_MODE!: string;

  @(joi.string().required())
  readonly FLOWS_PATH!: string;

  @(joi.string().required())
  readonly PROTOS_PATH!: string;

  @(joi.string().required())
  readonly PWD!: string;

  @(joi.boolean().required())
  readonly PROVIDER_TCP_ENABLED!: boolean;

  @(joi.boolean().required())
  readonly PROVIDER_GRPC_ENABLED!: boolean;

  @joi.string()
  readonly SERVICE_NAME!: string;

  @joi.string()
  readonly PROTO_IMPORT_PATH!: string;

  @joi.boolean()
  readonly REPORTER_LOG_SPAN!: boolean;

  @(joi.string().required())
  readonly KAFKA_CLIENT_ID!: string;

  @(joi.number().required())
  readonly KAFKA_INITIATE_RETRY_TIME!: number;

  @(joi.number().required())
  readonly KAFKA_RETIRIES!: number;

  @(joi.number().required())
  readonly KAFKA_MAX_RETRY_TIME!: number;

  // TODO: add kafka related configs to flow kafka configs
  @(joi.boolean().required())
  readonly KAFKA_CONSUMER_ENABLED!: boolean;

  @(joi.string().required())
  readonly KAFKA_CONSUMER_BROKERS!: string;

  @(joi.number().required())
  readonly KAFKA_CONSUMER_RETRIES!: number;

  @(joi.number().required())
  readonly KAFKA_CONSUMER_MULTIPLIER!: number;

  @(joi.number().required())
  readonly KAFKA_CONSUMER_FACTOR!: number;

  @(joi.number().required())
  readonly KAFKA_CONSUMER_MAX_RETRY_TIME!: number;

  @(joi.number().required())
  readonly KAFKA_CONSUMER_SESSION_TIMEOUT!: number;

  @(joi.number().required())
  readonly KAFKA_CONSUMER_MAX_WAIT_TIME_IN_MS!: number;

  @(joi.boolean().required())
  readonly KAFKA_CONSUMER_READ_UNCOMMITTED!: boolean;

  @(joi.string().required())
  readonly KAFKA_CONSUMER_GROUP_ID!: string;

  @(joi.boolean().required())
  readonly KAFKA_CONSUMER_EACH_BATCH_AUTO_RESOLVE!: boolean;

  @(joi.number().required())
  readonly KAFKA_CONSUMER_PARTITIONS_CONSUMED_CONCURRENTLY!: number;

  @(joi.boolean().required())
  readonly KAFKA_PRODUCER_ENABLED!: boolean;

  @(joi.string().required())
  readonly KAFKA_PRODUCER_BROKERS!: string;

  @(joi.number().required())
  readonly KAFKA_PRODUCER_MAX_RETRY_TIME!: number;

  @(joi.number().required())
  readonly KAFKA_PRODUCER_INITIATE_RETRY_TIME!: number;

  @(joi.number().required())
  readonly KAFKA_PRODUCER_FACTOR!: number;

  @(joi.number().required())
  readonly KAFKA_PRODUCER_MULTIPLIER!: number;

  @(joi.number().required())
  readonly KAFKA_PRODUCER_RETRIES!: number;

  @joi.boolean()
  readonly HTTP_LOG_ALL = false;

  @(joi.string().required())
  get FLOWS_DIR(): string {
    return this.PWD! + '/' + this.FLOWS_PATH!;
  }

  set FLOWS_DIR(value: string) {}
}
