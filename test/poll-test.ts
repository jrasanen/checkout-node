import * as Chai from 'chai';

import { open, poll } from '../src';
import { PollPayload } from '../src/poll';

/* tslint:disable-next-line:no-var-requires no-require-imports */
Chai.use(require('chai-as-promised'));
Chai.should();

describe('Poll', () => {
  it('should return an incomplete status', () => {
    const stamp: string = (new Date()).getTime().toString();
    const payload: {} = {
      VERSION: '0001',
      MERCHANT: '375917',
      CURRENCY: 'EUR',
      FORMAT: '1',
      ALGORITHM: '3',
      SECRET_KEY: 'SAIPPUAKAUPPIAS',
      STAMP: stamp,
      REFERENCE: '123555',
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

    return open(payload)
      .then(() => poll((payload as PollPayload)))
      .then((response) => {
        response.should.eq(1);
      });
  });

  it('should return an error if trade not found', () => {
    const payload: {} = {
      VERSION: '0001',
      MERCHANT: '3175917',
      CURRENCY: 'EUR',
      FORMAT: '1',
      ALGORITHM: '3',
      SECRET_KEY: 'SAIPPUAKAUPPIAS',
      STAMP: '0',
      REFERENCE: '0',
      MESSAGE: 'Food',
      RETURN: 'http://example.com/return',
      CANCEL: 'http://example.com/return',
      AMOUNT: '19',
      DELIVERY_DATE: '20170518',
      FIRSTNAME: 'Meh',
      LASTNAME: 'Blem',
      ADDRESS: 'Fakestreet 1234',
      POSTCODE: '33720',
      POSTOFFICE: 'Tampere',
      EMAIL: 'support@checkout.fi',
      PHONE: '0800 552 010'
    };

    return poll((payload as PollPayload))
      .catch((response) => {
        response.should.eq('error');
      });
  });
});
