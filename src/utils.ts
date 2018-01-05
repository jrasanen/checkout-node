import * as crypto from 'crypto';
import * as R from 'ramda';

const TEST_MERCHANT_ID: number = 375917;

export interface PaymentPayload {
  readonly VERSION?: string;
  readonly STAMP?: string;
  readonly AMOUNT?: string;
  readonly REFERENCE?: string;
  readonly MESSAGE?: string;
  readonly LANGUAGE?: 'FI';
  readonly RETURN?: string;
  readonly CANCEL?: string;
  readonly REJECT?: string;
  readonly DELAYED?: string;
  readonly COUNTRY?: 'FIN';
  readonly CURRENCY?: string;
  readonly DEVICE?: 10;
  readonly CONTENT?: string;
  readonly TYPE?: string;
  readonly ALGORITHM?: string;
  readonly DELIVERY_DATE?: string;
  readonly FIRSTNAME?: string;
  readonly FAMILYNAME?: string;
  readonly ADDRESS?: string;
  readonly POSTCODE?: string;
  readonly POSTOFFICE?: string;
  readonly MAC?: string;
  readonly EMAIL?: string;
  readonly PHONE?: string;
  readonly MERCHANT?: number;
  readonly SECURITY_KEY?: string;
}

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
const defaults: PaymentPayload = {
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
  DEVICE: 10,
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
  MERCHANT: TEST_MERCHANT_ID,
  SECURITY_KEY: 'SAIPPUAKAUPPIAS'
};

// Get demo parameters
export const buildDemoParams: () => PaymentPayload = () => {
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
 * Return list of values of given fields of an object
 * @param {fields} fields to get from the object
 * @param {payload} object to get values from
 * @returns {array} string array of selected values
 */
export const valuesFromPayload: (fields: string[]) => Function =
   (fields) => R.compose(R.values, R.pick(fields));

/*
 * Get payload's MAC string
 * @param {object} values Payload to get mac from
 * @param {array} fields Fields required for mac
 * @returns {string} md5 mac
 */
export const mac: (v: PaymentPayload) => PaymentPayload =
  (values) =>
    R.merge(values, { MAC: digest(valuesFromPayload(macFields)(values)) });

/*
 * Get parameters for payload. Merges defaults with provided data.
 */
export const params: (d: PaymentPayload) => PaymentPayload =
  R.merge(defaults);

/*
 * Get payload required for psp's payment wall
 * @param {object} input Post data
 * @returns {string} md5 mac
 */
export const getPayload: (data: PaymentPayload) => PaymentPayload =  R.pipe(params, mac);
