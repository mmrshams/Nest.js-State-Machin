import {Test} from '@nestjs/testing';
import {CONFIG} from 'src/common/constants/constants';
import {Config} from 'src/common/interfaces/config.interface';
import {ListenKafkaIngress} from './listen-kafka.ingress';

class ClientProxyMock {
  async send(): Promise<unknown> {
    return Promise.resolve();
  }
}

const clientProxyMock = {
  provide: 'VenomProxy',
  useClass: ClientProxyMock,
};

const configFactory = {
  provide: CONFIG,
  useFactory: async () => {
    const config = new Config({
      KAFKA_CLIENT_ID: 'TEST-CLEINT',
      KAFKA_CONSUMER_BROKERS: 'locahost:9092',
    });
    return config;
  },
};

describe('ListenKafkaIngress', () => {
  let listenKafkaIngress: ListenKafkaIngress;
  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [ListenKafkaIngress, clientProxyMock, configFactory],
    }).compile();
    listenKafkaIngress = moduleRef.get<ListenKafkaIngress>(ListenKafkaIngress);
  });

  it('should to be defined', () => {
    expect(listenKafkaIngress).toBeDefined();
  });
});
