import {Test} from '@nestjs/testing';
import {CONFIG} from 'src/common/constants/constants';
import {Config} from 'src/common/interfaces/config.interface';
import {FlowInterface} from 'src/core/interfaces/flow.interface';

import {LoaderService} from './loader.service';

const configFactory = {
  provide: CONFIG,
  useFactory: async () => {
    const config = new Config({
      FLOWS_PATH: 'src/flows',
      PROTOS_PATH: 'protos',
      PWD: process.env['PWD'],
    });
    return config;
  },
};

describe('LoaderService', () => {
  let loaderService: LoaderService;
  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [LoaderService, configFactory],
    }).compile();
    loaderService = moduleRef.get<LoaderService>(LoaderService);
  });

  describe('loadFlows', () => {
    it('should not throw error ', async () => {
      expect(async () => await loaderService.loadFlows()).not.toThrowError(
        Error
      );
    });
    it('should contain  testFlow_1234 flow', async () => {
      await loaderService.loadFlows();
      const flow = loaderService.getFlow('main_flow');
      expect(flow).toBeInstanceOf(FlowInterface);
    });

    it('should throw error when flow not exists', async () => {
      await loaderService.loadFlows();
      expect(() => loaderService.getFlow('no')).toThrowError(Error);
    });

    it('should contain testFlow_sample_name transformer', async () => {
      await loaderService.loadFlows();
      const transformer = loaderService.getTransformer('testFlow_sample_name');
      expect(transformer).toBeInstanceOf(Function);
    });

    it('should throw error when transformer not exists', async () => {
      await loaderService.loadFlows();
      expect(() =>
        loaderService.getTransformer('testFlow_sample_no')
      ).toThrowError(Error);
    });
  });
});
