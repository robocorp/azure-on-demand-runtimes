import { HmacRequest } from './types';
import crypto from 'crypto';
import { HmacError, HmacErrorType } from './HmacError';
import { Logger } from '../Logger';

const TIMESTAMP_EXPIRATION_TIME = 60 * 15;

const validateTimestamp = (timestamp: string) => {
  const unixTime = Math.floor(Date.now() / 1000);
  const clientTime = Number(timestamp);
  const timeDiff = Math.abs(unixTime - clientTime);
  if (Number.isNaN(timeDiff)) {
    throw new HmacError('invalid timestamp', HmacErrorType.INVALID_TIMESTAMP);
  }
  if (timeDiff > TIMESTAMP_EXPIRATION_TIME) {
    throw new HmacError(
      'hmac request expired, given timestamp differs too much from server time',
      HmacErrorType.EXPIRED_TIMESTAMP
    );
  }
};

export const validateHmac = (req: HmacRequest, secret: string) => {
  const getHeader = (key: string) => {
    const value = req.headers[key];
    if (!value) {
      throw new HmacError(
        `header ${key} was missing`,
        HmacErrorType.MALFORMED_REQUEST
      );
    }
    return value;
  };

  const signatureFromHeader = getHeader('x-rc-signature');
  const timestamp = getHeader('x-rc-timestamp');
  const signedHeaders = getHeader('x-rc-signed-headers');

  // variables
  const algorithm = 'sha256';
  const method = req.method.toUpperCase();
  const querystring = ''; // TODO currently assumes is empty

  const bodyHash = crypto
    .createHash(algorithm)
    .update(Buffer.from(req.rawBody))
    .digest('base64');

  const headersToSign = signedHeaders.split(';');

  const headers = headersToSign
    .map((header) => `${header}:${getHeader(header)}`)
    .join('\n');

  const request = [
    method,
    req.uri,
    querystring,
    headers,
    signedHeaders,
    bodyHash,
  ].join('\n');

  const stringToSign = [
    algorithm,
    timestamp,
    crypto.createHash(algorithm).update(request).digest('base64'),
  ].join('\n');

  const signature = crypto
    .createHmac(algorithm, secret)
    .update(stringToSign)
    .digest('hex');

  validateTimestamp(timestamp);

  if (signature !== signatureFromHeader) {
    throw new HmacError(
      'signature did not match',
      HmacErrorType.NOT_AUTHENTICATED
    );
  }
};
