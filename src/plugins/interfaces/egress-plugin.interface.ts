import {
  EgressPluginInputInterface,
  EgressPluginResultInterface,
} from 'src/core/interfaces/egress.interface';

export interface EgressPluginInterface {
  operate(
    message: EgressPluginInputInterface
  ): Promise<EgressPluginResultInterface>;
}
