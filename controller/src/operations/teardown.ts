import { VirtualMachine } from '@azure/arm-compute/esm/models';
import { ApplicationError } from '../ApplicationError';
import { Logger } from '../services/Logger';
import { NetworkService } from '../services/NetworkService';
import { VMService } from '../services/VmService';
import { DynamicResources } from '../types';

interface Dependencies {
  vmService: VMService;
  networkService: NetworkService;
  logger: Logger;
}

export const buildTeardown =
  (deps: Dependencies) => async (dynamicResoures: DynamicResources) => {
    const { networkService, vmService, logger } = deps;
    logger(
      'teardown request for dynamic resources',
      JSON.stringify(dynamicResoures)
    );
    logger('destroying VM');
    await vmService.destroyVM(dynamicResoures.virtualMachine);
    logger('destoying network interfaces');
    await networkService.destroyNetworkInterfaces(
      dynamicResoures.networkResources
    );
    logger('destroyed network interfaces');
  };
