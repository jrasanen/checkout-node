import * as Chai from 'chai';

import * as utils from '../src/utils';
import { open } from '../src/wall';

/* tslint:disable-next-line:no-var-requires no-require-imports */
Chai.use(require('chai-as-promised'));
Chai.should();

describe('Payment Wall', () => {
  it('opens payment methods', async() =>
    open().should.eventually.have.lengthOf.at.least(19));
});

describe('Utilities', () => {
  it('digest returns a proper hash', async() =>
    // tslint:disable-next-line:max-line-length
    utils.digest(['mehehehe', 'nyaha'])
      .should
      .equal('087642B2FED79B8BB74B3BC5FD6F413440A484D47BE37986D01ECC9F4C71CA8A'));

  it('mac should return an md5', async() =>
    utils.mac({ stamp: 'my cat is just big boned' }).should.have.property('MAC'));

  it('params should have default values', async() => {
    const result: utils.Assoc = utils.params({ STAMP: 'pew says laser' });
    result.should.have.property('EMAIL');
    result.should.have.property('STAMP', 'pew says laser');
  });

  it('payload should have required values', async() => {
    const result: utils.Assoc = utils.getPayload({ STAMP: 'pew says laser' });
    result.should.have.property('EMAIL');
    result.should.have.property('STAMP', 'pew says laser');
    result.should.have.property('MAC', '6C846B234ED394CB40C50B6797F1382FD39A3E4DCC0BF2A985572FA9013CA56C');
  });
});
