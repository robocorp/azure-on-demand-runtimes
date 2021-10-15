export enum HmacErrorType {
  MALFORMED_REQUEST = 'MALFORMED_REQUEST',
  NOT_AUTHENTICATED = 'NOT_AUTHENTICATED',
  INVALID_TIMESTAMP = 'INVALID_TIMESTAMP',
  EXPIRED_TIMESTAMP = 'EXPIRED_TIMESTAMP',
}

export class HmacError extends Error {
  constructor(message: string, public type: HmacErrorType) {
    super(message);
  }
}
