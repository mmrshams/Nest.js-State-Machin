import {NestMicroserviceOptions} from '@nestjs/common/interfaces/microservices/nest-microservice-options.interface';
import {NestFactory} from '@nestjs/core';

import {CommonModule} from './common/common.module';
import {CONFIG} from './common/constants/constants';
import {initJaegerTracer} from './common/decorators/tracer.decorator';
import {Config} from './common/interfaces/config.interface';
import {
  MicroserviceModule,
  ServiceOptions,
} from './common/interfaces/module.interface';
import {CoreModule} from './core/core.module';

// TODO: ~/.yarn/bin/sentry-cli releases deploys venom...
const modules: {[key: string]: Array<MicroserviceModule>} = {
  PROVIDER: [CoreModule],
  // PROXY: [Proxy],
  ALL: [CoreModule],
};

async function bootstrap() {
  const commonApp = await NestFactory.create(CommonModule.register());
  const config = commonApp.get<Config>(CONFIG);
  initJaegerTracer();
  for (const module of modules[config.SERVICE_MODE]) {
    const {moduleInstance, options} = module.register(config);
    if ((options as ServiceOptions).uri) {
      const app = await NestFactory.create(moduleInstance);
      app.enableShutdownHooks();
      app.listen((options as ServiceOptions).uri.split(':')[1]);
      continue;
    }
    await Promise.all(
      options.map(async (option: NestMicroserviceOptions) => {
        const app = await NestFactory.createMicroservice(
          moduleInstance,
          option
        );
        app.enableShutdownHooks();
        return await app.listen(() => {});
      })
    );
  }
  setTimeout(() => {
    // eslint-disable-next-line no-process-exit
    process.exit(0);
  }, 2000);
}
bootstrap();
