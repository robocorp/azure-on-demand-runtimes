import { PasswordService } from '.';
import { randomBytes } from 'crypto';

const CAPITAL_LETTERS = [
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'K',
  'L',
  'M',
  'N',
  'O',
  'P',
  'Q',
  'R',
  'S',
  'T',
  'U',
  'W',
  'V',
  'X',
  'Y',
  'Z',
];

const SPECIAL_CHARATERS = ['*', '!', '#', '%', '&'];

function randomInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function insertIntoRandomLocation(into: string, toInsert: string) {
  const position = randomInteger(0, into.length);
  return into.substr(0, position) + toInsert + into.substr(position);
}

export const buildDefaultPasswordService = (): PasswordService => ({
  generatePassword: async function () {
    let password = randomBytes(30).toString('hex');
    for (let i = 0; i < 3; ++i) {
      password = insertIntoRandomLocation(
        password,
        SPECIAL_CHARATERS[randomInteger(0, SPECIAL_CHARATERS.length)]
      );

      password = insertIntoRandomLocation(
        password,
        randomInteger(0, 9).toString()
      );

      password = insertIntoRandomLocation(
        password,
        CAPITAL_LETTERS[randomInteger(0, CAPITAL_LETTERS.length)]
      );
    }
    return password;
  },
});
