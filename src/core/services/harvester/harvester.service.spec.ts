import {ClientProxy} from '@nestjs/microservices';
import {Test} from '@nestjs/testing';
import {MessageInterface} from 'src/core/interfaces/message.interface';

import {FlowInterface} from '../../interfaces/flow.interface';
import {LoaderService} from '../loader/loader.service';
import {HarvesterService} from './harvester.service';

class LoaderServiceMock {
  getFlow(key: string): FlowInterface {
    return {
      key: 'testFlow',
      collectors: ['flow1', 'flow12', 'flow123'],
      conditions: [],
      normalizer: {
        ziif: [],
      },
    };
  }
}

class ClientProxyMock {
  async send(pattern: string, data: any): Promise<any> {
    return await Promise.resolve({payload: 'payload'});
  }
}

const loaderServiceMock = {
  provide: LoaderService,
  useClass: LoaderServiceMock,
};

const clientProxyMock = {
  provide: 'ProviderServiceProxy',
  useClass: ClientProxyMock,
};

describe('HarvesterService', () => {
  let harvesterService: HarvesterService;
  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [loaderServiceMock, clientProxyMock, HarvesterService],
    }).compile();
    harvesterService = moduleRef.get<HarvesterService>(HarvesterService);
  });

  describe('harvest', () => {
    it('should be defined', () => {
      expect(harvesterService).toBeDefined();
    });
  });
});
