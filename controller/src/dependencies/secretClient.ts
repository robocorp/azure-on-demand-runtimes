import { SecretClient } from '@azure/keyvault-secrets';
import { credentials } from './azureCredentials';

export const secretClient = new SecretClient(
  process.env.VAULT_URI!,
  credentials
);
