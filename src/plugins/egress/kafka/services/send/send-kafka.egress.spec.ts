import {Test} from '@nestjs/testing';
import {CONFIG} from 'src/common/constants/constants';
import {Config} from 'src/common/interfaces/config.interface';
import {SendKafkaEgress} from './send-kafka.egress';

class ClientProxyMock {
  async send(): Promise<void> {
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
      KAFKA_PRODUCER_BROKERS: 'localhost:9092',
    });
    return config;
  },
};

describe('SendKafkaEgress', () => {
  let sendKafkaEgress: SendKafkaEgress;
  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [SendKafkaEgress, clientProxyMock, configFactory],
    }).compile();
    sendKafkaEgress = moduleRef.get<SendKafkaEgress>(SendKafkaEgress);
  });

  it('should to be defined', () => {
    expect(sendKafkaEgress).toBeDefined();
  });
});
