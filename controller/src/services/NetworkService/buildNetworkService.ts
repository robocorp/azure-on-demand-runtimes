import { networkManagementClient } from '../../dependencies/networkManagementClient';
import { Logger } from '../Logger';
import { DefaultNetworkService } from './DefaultNetworkService';
import { NetworkService } from './types';

export const buildNetworkService = (logger: Logger): NetworkService =>
  new DefaultNetworkService({
    networkClient: networkManagementClient,
    location: process.env.REGION!,
    resourceGroupName: process.env.VM_RESOURCE_GROUP_NAME!,
    subnetId: process.env.SUBNET_ID!,
    logger,
  });
