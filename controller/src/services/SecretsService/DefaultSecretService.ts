import { SecretClient } from '@azure/keyvault-secrets';
import { Logger } from '../Logger';
import { SecretService } from './types';

export interface DefaultSecretServiceConfig {
  secretClient: SecretClient;
  logger: Logger;
}

export class DefaultSecretService implements SecretService {
  constructor(protected config: DefaultSecretServiceConfig) {}
  async getSecret(name: string): Promise<string> {
    const { logger, secretClient } = this.config;
    logger(`getting secret with name ${name}`);
    const result = await secretClient.getSecret(name);
    if (!result.value) throw new Error('secret had no value');
    logger('secret found');
    return result.value;
  }
}
