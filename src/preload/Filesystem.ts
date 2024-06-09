import * as t from 'io-ts';

const filePathRegex = /^(\w:\/|\/|\/\/|\w+)[\s\w$./]+[\s\w$.]$/;
const directoryPathRegex = /^(\d|\w:\/|\/\/|\w+\/\/|\/)[\w $./]+[\w$.]+\/$/;

interface FilepathBrand {
  readonly filePath: unique symbol;
}

interface DirectoryPathBrand {
  readonly directoryPath: unique symbol;
}

export const filePath = t.brand(
  t.string,
  (inputToValidate): inputToValidate is t.Branded<string, FilepathBrand> => {
    if (typeof inputToValidate !== 'string') return false;
    if (!filePathRegex.test(inputToValidate)) return false;

    return true;
  },
  'filePath',
);

export const directoryPath = t.brand(
  t.string,
  (inputToValidate): inputToValidate is t.Branded<string, DirectoryPathBrand> => {
    if (typeof inputToValidate !== 'string') return false;
    if (!directoryPathRegex.test(inputToValidate)) return false;

    return true;
  },
  'directoryPath',
);

export type DirectoryPath = t.TypeOf<typeof directoryPath>;

export type FilePath = t.TypeOf<typeof filePath>;
