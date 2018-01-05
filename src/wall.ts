import * as R from 'ramda';
import * as request from 'superagent';

import { parseString as parse } from 'xml2js';

import * as utils from './utils';

const PSP_URL: string = process.env.PSP_URL || 'https://payment.checkout.fi';

interface Assoc { readonly [key: string]: string; }

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
 * Get parameters for payload. Merges defaults with provided data.
 */
export const payloadParams: (d: {}) => {} = R.merge(defaults);

/*
 * Get payload required for psp's payment wall
 * @param {object} input Post data
 * @returns {string} SHA256 mac
 */
export const getPayload: (data: {}) => {} = R.pipe(payloadParams, R.curry(utils.mac)(macFields));

/*
 * Get Payment button wall
 * @param {object} Post data, uses test data if no data provided
 * @returns {Promise<XML>} Payment wall object
 */
export const open: (postdata?: Assoc | undefined) => Promise<Assoc[]> = (openWallData) =>
  new Promise((ok, no) => {
    return request
      .post(PSP_URL)
      .type('form') // Needs to be form post
      .send(getPayload(openWallData ? openWallData : buildDemoParams()))
      .then((resp) =>
        // The legacy XML is kinda ugly, but this does the job parsing it
        parse(resp.text, (err, res) => {
          if (err != null || res.p) {
            (err) ? no(err) : no(res.p);
          } else {
            const buttons: {} = res.trade.payments.pop().payment.pop().banks.pop();
            // tslint:disable-next-line:no-any
            const paymentMethods: {} = R.mapObjIndexed((element: any, service: string) => {

              const data: {
                readonly $: {
                  readonly url: string,
                  readonly icon: string,
                  readonly name: string }} = element.pop();

              const params: Assoc = R.mapObjIndexed((d: Assoc) => d[0], R.dissoc('$', data));

              return {
                ...data.$,
                service,
                params
              };
            }, buttons);

            ok(R.values(paymentMethods));
          }
        }));
  });

