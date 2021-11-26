import {
  IngressPluginInputInterface,
  IngressPluginResultInterface,
} from 'src/core/interfaces/ingress.interface';

export interface IngressPluginInterface {
  listen(
    message: IngressPluginInputInterface
  ): Promise<IngressPluginResultInterface>;
}
