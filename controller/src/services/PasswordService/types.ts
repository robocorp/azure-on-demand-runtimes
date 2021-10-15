export interface PasswordService {
  generatePassword(): Promise<string>;
}
