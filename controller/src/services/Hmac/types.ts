export interface HmacRequest {
  headers: Record<string, string | undefined>;
  method: string;
  rawBody: Buffer;
  queryString: string;
  uri: string;
}
