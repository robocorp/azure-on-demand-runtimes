import { NetworkManagementClient } from '@azure/arm-network';
import { credentials } from './azureCredentials';

export const networkManagementClient = new NetworkManagementClient(
  credentials,
  process.env.SUBSCRIPTION_ID!
);
