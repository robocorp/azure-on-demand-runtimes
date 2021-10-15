import { VMService } from '.';
import { computeClient } from '../../dependencies/computeManagementClient';
import { Logger } from '../Logger';

export const buildVmService = (logger: Logger) => {
  return new VMService({
    logger,
    computeClient,
    customImageId: process.env.CUSTOM_IMAGE_ID!,
    customImageResourceGroupName: process.env.CUSTOM_IMAGE_RESOURCE_GROUP_NAME!,
    region: process.env.REGION!,
    vmResourceGroupName: process.env.VM_RESOURCE_GROUP_NAME!,
  });
};
