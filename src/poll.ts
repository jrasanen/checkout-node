import * as R from 'ramda';
import * as request from 'superagent';
import { parseString as parse } from 'xml2js';

import * as utils from '../src/utils';

const POLL_URL: string = 'https://rpcapi.checkout.fi/poll';

export interface PollPayload {
  readonly VERSION: string;
  readonly STAMP: string;
  readonly AMOUNT: string;
  readonly REFERENCE: string;
  readonly CURRENCY: string;
  readonly ALGORITHM: string;
  readonly MERCHANT: number;
  readonly SECRET_KEY: string;
  readonly FORMAT: number;
}

export const poll: (params: PollPayload) => Promise<number> =
  (params) => {
    const data: PollPayload = {
      VERSION: params.VERSION,
      STAMP: params.STAMP,
      REFERENCE: params.REFERENCE,
      MERCHANT: params.MERCHANT,
      AMOUNT: params.AMOUNT,
      CURRENCY: params.CURRENCY,
      FORMAT: 1,
      ALGORITHM: '3',
      SECRET_KEY: params.SECRET_KEY
    };

    return new Promise((ok, no) => {
      request
        .post(POLL_URL)
        .type('form')
        .send(utils.mac(R.keys(data), data))
        .then((response) => {
          if (response.text.indexOf('error') > -1) {
            no(response.text.trim());
          } else {
            parse(response.text, (err, res) =>
              (err) ? no(err) : ok(parseInt(res.trade.status.pop(), 10))
            );
          }
        })
        .catch(no);
    });
  };
