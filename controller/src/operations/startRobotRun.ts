import { Logger } from '../services/Logger';
import { NetworkService } from '../services/NetworkService';
import { VMService } from '../services/VmService';
import { DynamicResources, StartRobotRunParams } from '../types';

interface Deps {
  vmService: VMService;
  networkService: NetworkService;
  logger: Logger;
}

export const buildStartRobotRun =
  (dependencies: Deps) =>
  async (params: StartRobotRunParams): Promise<DynamicResources> => {
    const { networkService, vmService } = dependencies;

    const networkResources = await networkService.createNetworkInterfaces({
      vmName: params.domain,
    });

    const virtualMachine = await vmService.startVM({
      domain: params.domain,
      linkToken: params.linkToken,
      networkInterfaces: networkResources.interfaces,
      password: params.password,
      username: params.username,
    });

    return {
      virtualMachine,
      networkResources,
    };
  };
