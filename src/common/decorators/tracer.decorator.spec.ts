import {Test} from '@nestjs/testing';

import {CONFIG} from '../constants/constants';
import {Config} from '../interfaces/config.interface';
import {initJaegerTracer, Trace, tracer} from './tracer.decorator';

const testAction = async ({
  message,
  ctx,
}: {
  message: string;
  ctx: object;
}): Promise<string> => {
  return `here is your message: ${message}`;
};

const configFactory = {
  provide: CONFIG,
  useFactory: async () => {
    const config = new Config({
      SERVICE_NAME: 'venom_for_test',
    });
    return config;
  },
};

describe('Trace Decorator', () => {
  let configs: Config;
  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [configFactory],
    }).compile();
    configs = moduleRef.get<Config>(CONFIG);
    process.env = {...process.env, JAEGER_SERVICE_NAME: 'service'};
  });
  describe('initJeagerTracer function', () => {
    it('initJeagerTracer should be defined', async () => {
      expect(initJaegerTracer).toBeDefined();
    });
  });
  describe('Trace function', () => {
    it('trace should be defined', async () => {
      expect(Trace).toBeDefined();
    });

    it('trace decorator should return function result ?', async () => {
      initJaegerTracer();
      const descriptor = Trace()({}, 'testAction', {
        value: testAction,
        enumerable: false,
        configurable: true,
        writable: true,
      });
      const result = await descriptor.value({message: 'test message'});
      tracer.close();
      expect(result).toEqual('here is your message: test message');
    });

    it('trace decorator should return function result with context argument ?', async () => {
      initJaegerTracer();
      const descriptor = Trace()({}, 'testAction', {
        value: testAction,
        enumerable: false,
        configurable: true,
        writable: true,
      });
      const span = tracer.startSpan('testAction');
      const result = await descriptor.value({
        message: 'test message',
        ctx: {
          spancontext: span.context(),
        },
      });
      tracer.close();
      expect(result).toEqual('here is your message: test message');
    });
  });
});
