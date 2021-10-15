import { secretClient } from '../../dependencies/secretClient';
import { Logger } from '../Logger';
import { DefaultSecretService } from './DefaultSecretService';

export const buildDefaultSecretService = (logger: Logger) =>
  new DefaultSecretService({
    logger,
    secretClient,
  });
