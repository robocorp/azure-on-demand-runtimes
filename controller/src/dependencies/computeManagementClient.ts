import { ComputeManagementClient } from '@azure/arm-compute';
import { credentials } from './azureCredentials';

export const computeClient = new ComputeManagementClient(
  credentials,
  process.env.SUBSCRIPTION_ID!
);
