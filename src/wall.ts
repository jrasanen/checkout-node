import * as R from 'ramda';
import * as request from 'superagent';

import { parseString as parse } from 'xml2js';

import { buildDemoParams, getPayload } from './utils';

const PSP_URL: string = process.env.PSP_URL || 'https://payment.checkout.fi';

interface Assoc { readonly [key: string]: string; }

/*
 * Get Payment button wall
 * @param {object} Post data, uses test data if no data provided
 * @returns {Promise<XML>} Payment wall object
 */
export const open: (d?: Assoc | undefined) => PromiseLike<Assoc[]> = (openWallData) =>
  new Promise((ok, no) => {
    return request.post(PSP_URL).type('form')
      .send(getPayload(openWallData ? openWallData : buildDemoParams()))
      .then((resp) =>
        parse(resp.text, (err, res) => {
          if (err != null) {
            no(err);
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

