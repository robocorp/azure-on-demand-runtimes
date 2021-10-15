import { NetworkManagementClient } from '@azure/arm-network';
import {
  NetworkInterface,
  PublicIPAddress,
} from '@azure/arm-network/esm/models';
import { CreateInterfaceParams, CreateInterfaceResponse } from '.';
import { ApplicationError } from '../../ApplicationError';
import { delay } from '../../delay';
import { Logger } from '../Logger';
import { NetworkService } from './types';

export interface DefaultNetworkServiceContext {
  networkClient: NetworkManagementClient;
  subnetId: string;
  resourceGroupName: string;
  location: string;
  logger: Logger;
}

export class DefaultNetworkService implements NetworkService {
  constructor(protected context: DefaultNetworkServiceContext) {}

  async destroyNetworkInterfaces(
    resources: CreateInterfaceResponse
  ): Promise<void> {
    const { networkClient, resourceGroupName, logger } = this.context;

    const nicDeleteOps = resources.interfaces.map((it) => {
      if (!it.name) {
        throw new ApplicationError({
          code: 'NIC_DELETION_FAILED',
          message: 'network interface name is missing',
        });
      }
      return networkClient.networkInterfaces.deleteMethod(
        resourceGroupName,
        it.name
      );
    });

    logger(`deleting ${nicDeleteOps.length} network interface cards`);
    await Promise.all(nicDeleteOps);
    await delay(500);
    logger('deleting network interfaces');

    const ipDeleteOps = resources.publicIps.map((it) => {
      logger(`deleting public ip ${it.id}`);
      return networkClient.publicIPAddresses.deleteMethod(
        resourceGroupName,
        it.name!
      );
    });

    logger(`deleting ${ipDeleteOps.length} ip addresses`);

    const res = await Promise.all(ipDeleteOps);
    logger(res);
  }

  async createNetworkInterfaces(
    params: CreateInterfaceParams
  ): Promise<CreateInterfaceResponse> {
    const { subnetId, networkClient, resourceGroupName, location } =
      this.context;

    const publicIPParameters: PublicIPAddress = {
      location: location,
      publicIPAllocationMethod: 'Dynamic',
      dnsSettings: {
        domainNameLabel: params.vmName,
      },
    };

    const publicIp = await networkClient.publicIPAddresses.createOrUpdate(
      resourceGroupName,
      params.vmName,
      publicIPParameters
    );

    const nicParameters: NetworkInterface = {
      location,
      ipConfigurations: [
        {
          subnet: {
            id: subnetId,
          },
          name: 'default',
          privateIPAllocationMethod: 'Dynamic',
          publicIPAddress: publicIp,
        },
      ],
    };

    const networkInterfaceName = `${params.vmName}-nic-public`;

    const nicRes = await networkClient.networkInterfaces.createOrUpdate(
      resourceGroupName,
      networkInterfaceName,
      nicParameters
    );

    if (nicRes._response.status !== 200) {
      throw new ApplicationError({
        code: 'NIC_CREATION_FAILED',
        message: 'could not create network interfaces for the virtual machine',
      });
    }

    return {
      interfaces: [nicRes],
      publicIps: [publicIp],
    };
  }
}
