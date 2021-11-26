import {NotImplementedException} from '@nestjs/common';
import {Test} from '@nestjs/testing';
import axios from 'axios';
import {Config} from 'src/common/interfaces/config.interface';
import {LoggerService} from 'src/common/utils/logger.util';
import {HTTPAction} from 'src/core/interfaces/egress-action.interface';
import {EgressPluginInputInterface} from 'src/core/interfaces/egress.interface';
import {HTTPEgress} from './http.egress';

const configFactory = {
  provide: 'Config',
  useFactory: async () => {
    const config = new Config({
      FLOWS_PATH: 'src/flows',
      PWD: process.env['PWD'],
    });
    return config;
  },
};

const axiosFactory = {
  provide: 'Axios',
  useFactory: async () => {
    return axios;
  },
};

const logger = {
  provide: LoggerService,
  useClass: jest.fn().mockImplementation(() => {
    return {
      log: jest.fn(),
    };
  }),
};

describe('HTTPPostOperator', () => {
  let httpPostOperator: HTTPEgress;
  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [HTTPEgress, configFactory, axiosFactory, logger],
    }).compile();
    httpPostOperator = moduleRef.get<HTTPEgress>(HTTPEgress);
  });

  it('should to be defined', () => {
    expect(httpPostOperator).toBeDefined();
  });

  describe('operate', () => {
    it('should not throw not implemented', async () => {
      const message: EgressPluginInputInterface = {
        action: {
          bodyTemplate: 'notfound.mustache',
          headerTemplate: 'testFlow.http.header.mustache',
          urlTemplate: 'testFlow.http.url.mustache',
          parseAs: 'JSON',
          generateAs: 'JSON',
          requestMethod: 'GET',
          logRawResponse: false,
        } as HTTPAction,
        message: {
          flowKey: 'test',
          payload: {},
        },
      };
      expect(async () => {
        await httpPostOperator.operate(message);
      }).rejects.not.toThrowError(NotImplementedException);
    });
  });
});
