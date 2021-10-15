export interface SecretService {
  getSecret(name: string): Promise<string>;
}
