import { validateHmac } from '../services/Hmac';
import { HmacRequest } from '../services/Hmac/types';
import { Logger } from '../services/Logger';
import { SecretService } from '../services/SecretsService/types';

interface Dependencies {
  secretService: SecretService;
  logger: Logger;
}

export const buildValidateRequest =
  (deps: Dependencies) => async (request: HmacRequest) => {
    const { logger, secretService } = deps;
    const secretName = process.env.CONTROLROOM_SECRET_NAME!;
    logger('fetching secret');
    const secret = await secretService.getSecret(secretName);
    logger('secret found, calculating hmac');
    logger('request', request);
    logger('secret', secret);
    validateHmac(request, secret);
    logger('request validated succesfully');
  };
