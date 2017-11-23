import * as crypto from 'crypto';
import * as R from 'ramda';

export interface Assoc { readonly [key: string]: string; }

const ALGO: string = 'sha256';

// Fields used required in mac calculation
const macFields: string[] = [
  'VERSION',
  'STAMP',
  'AMOUNT',
  'REFERENCE',
  'MESSAGE',
  'LANGUAGE',
  'MERCHANT',
  'RETURN',
  'CANCEL',
  'REJECT',
  'DELAYED',
  'COUNTRY',
  'CURRENCY',
  'DEVICE',
  'CONTENT',
  'TYPE',
  'ALGORITHM',
  'DELIVERY_DATE',
  'FIRSTNAME',
  'FAMILYNAME',
  'ADDRESS',
  'POSTCODE',
  'POSTOFFICE',
  'SECURITY_KEY'
];

// Default values if none provided
const defaults: { readonly [key: string]: string|number } = {
  VERSION: '0001',
  STAMP: '',
  AMOUNT: '',
  REFERENCE: '',
  MESSAGE: '',
  LANGUAGE: 'FI',
  RETURN: '',
  CANCEL: '',
  REJECT: '',
  DELAYED: '',
  COUNTRY: 'FIN',
  CURRENCY: 'EUR',
  DEVICE: '10',
  CONTENT: '1',
  TYPE: '0',
  ALGORITHM: '3',
  DELIVERY_DATE: '',
  FIRSTNAME: '',
  FAMILYNAME: '',
  ADDRESS: '',
  POSTCODE: '',
  POSTOFFICE: '',
  MAC: '',
  EMAIL: '',
  PHONE: '',
  MERCHANT: '375917',
  SECURITY_KEY: 'SAIPPUAKAUPPIAS'
};

// Get demo parameters
export const buildDemoParams: () => Assoc = () => {
  return {
    STAMP: (new Date()).getTime().toString(),
    REFERENCE: '0',
    MESSAGE: 'Food',
    RETURN: 'http://example.com/return',
    CANCEL: 'http://example.com/return',
    AMOUNT: '1234',
    DELIVERY_DATE: '20170518',
    FIRSTNAME: 'Meh',
    LASTNAME: 'Blem',
    ADDRESS: 'Fakestreet 1234',
    POSTCODE: '33720',
    POSTOFFICE: 'Tampere',
    EMAIL: 'support@checkout.fi',
    PHONE: '0800 552 010'
  };
};

/*
 * MD5 digest string from an array of values
 * @param {array} array of values to calculate the md5 hash from.
 * @returns {string} Uppercase MD5 hash
 */
export const digest: (a: string[]) => string =
  (values) =>
    crypto.createHash(ALGO).update(values.join('+')).digest('hex').toUpperCase();

/*
 * Get payload's MAC string
 * @param {object} values Payload to get mac from
 * @param {array} fields Fields required for mac
 * @returns {string} md5 mac
 */
export const mac: (v: Assoc) => Assoc =
  (values) =>
    R.merge(values, { MAC: digest(macFields.map((e) => values[e])) });

/*
 * Get parameters for payload. Merges defaults with provided data.
 */
export const params: (d: Assoc) => Assoc =
  (data) => R.merge(defaults, data);

/*
 * Get payload required for psp's payment wall
 * @param {object} input Post data
 * @returns {string} md5 mac
 */
export const getPayload: (d: {}) => Assoc =
  (data) => R.pipe(params, mac)(data);
