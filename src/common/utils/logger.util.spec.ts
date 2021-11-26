import {Test} from '@nestjs/testing';
import {Logger} from '@nestjs/common';

import {LoggerService} from './logger.util';

describe('LoggerService', () => {
  let logger: LoggerService;
  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [],
      providers: [Logger, LoggerService],
    }).compile();
    logger = moduleRef.get<LoggerService>(LoggerService);
  });
  describe('Logger service', () => {
    it('logger service should be define', async () => {
      expect(LoggerService).toBeDefined();
    });
    it('log function should not return error with keys', async () => {
      const command: any = {
        meta: {
          data: {
            name: 'alex',
          },
          evaluateResult: true,
          logs: {
            success: {
              elastic: {
                tag: 'test',
                description: 'there is discription',
                level: 'level test',
                keys: ['a', 'b'],
              },
            },
          },
        },
        message: 'there is some message',
      };
      expect(() => logger.log(command)).not.toThrowError(Error);
    });

    it('log function should not return error with keys', async () => {
      const command: any = {
        meta: {
          data: {
            name: 'alex',
          },
          evaluateResult: true,
          logs: {
            success: {
              elastic: {
                tag: 'test',
                description: 'there is discription',
                level: 'level test',
                keys: ['a', 'b'],
              },
            },
          },
        },
        message: 'there is some message',
      };
      expect(() => logger.log(command)).not.toThrowError(Error);
    });
    it('log function should not return error with keys on fail scenario', async () => {
      const command: any = {
        meta: {
          data: {
            name: 'alex',
          },
          evaluateResult: false,
          logs: {
            fail: {
              elastic: {
                tag: 'test',
                description: 'there is discription',
                level: 'level test',
                keys: ['a', 'b'],
              },
            },
          },
        },
        message: 'there is some message',
      };
      expect(() => logger.log(command)).not.toThrowError(Error);
    });
    it('log function should not return error with keys on fail scenario', async () => {
      const command: any = {
        meta: {
          data: {
            name: 'alex',
          },
          evaluateResult: false,
          logs: {},
        },
        message: 'there is some message',
      };
      expect(() => logger.log(command)).not.toThrowError(Error);
    });
  });
});
