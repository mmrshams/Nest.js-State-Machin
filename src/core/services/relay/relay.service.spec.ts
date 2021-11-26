import {Test} from '@nestjs/testing';
import {
  utilities as nestWinstonModuleUtilities,
  WinstonModule,
} from 'nest-winston';
import {CommonModule} from 'src/common/common.module';
import {ConditionEngine} from 'src/common/utils/condition-engine.util';
import {LoggerService} from 'src/common/utils/logger.util';
import {FlowInterface} from 'src/core/interfaces/flow.interface';
import * as winston from 'winston';

import {LoaderService} from '../loader/loader.service';
import {RelayService} from './relay.service';

class LoaderServiceMock {
  getFlow(key: string): FlowInterface {
    return {
      key: 'testFlow',
      transformers: ['convertToString', 'randomObject', 'randomArray'],
      normalizer: {
        ziif: [],
      },
      conditions: [
        {
          nextFlowKey: 'foo',
          terminal: false,
          logs: {
            success: {
              tag: 'tag A_1@',
              description: 'here is success description',
              selectors: [],
            },
            fail: {
              tag: 'tag A_20@',
              description: 'here is fail description',
              selectors: [],
            },
          },
          expression: {
            $lt: [
              {
                key: 'Inputs.a',
              },
              {
                key: 'Inputs.b',
              },
            ],
          },
        },
      ],
    };
  }
}

const loaderServiceMock = {
  provide: LoaderService,
  useClass: LoaderServiceMock,
};

const logService = {
  provide: LoggerService,
  useClass: jest.fn().mockImplementation(() => {
    return {
      log: jest.fn(),
    };
  }),
};

describe('RelayService', () => {
  let relayService: RelayService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [CommonModule.register()],
      providers: [logService, loaderServiceMock, ConditionEngine, RelayService],
    }).compile();
    relayService = moduleRef.get<RelayService>(RelayService);
  });

  describe('flowController service', () => {
    it('logger service should be define', async () => {
      expect(relayService).toBeDefined();
    });
  });

  describe('evaluate function', () => {
    it('should be return success when condition passed', async () => {
      const message = {
        flowKey: 'testFlows-12345',
        payload: {
          Inputs: {
            a: 123,
            b: 321,
          },
        },
      };
      expect(() => relayService.relay(message)).rejects.not.toThrowError(Error);
    });
  });
});
