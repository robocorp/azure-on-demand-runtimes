import { buildDefaultPasswordService } from './buildDefaultPasswordService';

it('should generate a password with a set of requirements', async () => {
  const passwordService = buildDefaultPasswordService();
  const password = await passwordService.generatePassword();
  const tests = [/[*!#%&/, /[A-Z]+/, /[1-9]+/];
  console.log(password);
  for (const regex of tests) {
    const result = regex.test(password);
    if (!result) console.log('failed on', regex);
    expect(result).toBeTruthy();
  }
});
