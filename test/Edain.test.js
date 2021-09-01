const { deployProxy } = require('@openzeppelin/truffle-upgrades');
const EDAINToken = artifacts.require('EDAINToken');

const BigNumber = web3.BigNumber

require('chai')
  .use(require('chai-bignumber')(BigNumber))
  .should();

contract('EDAINToken', accounts => {
  const _name = 'EDAIN';
  const _symbol = 'EAI';
  const _decimals = new BigNumber(18);
  const _totalSupply = 47000000;

  beforeEach(async function () {
    this.token = await deployProxy(EDAINToken);
  });

  describe('token attributes', function() {
    it('has the correct name', async function() {
      const name = await this.token.name();
      name.should.equal(_name);
    });

    it('has the correct symbol', async function() {
      const symbol = await this.token.symbol();
      symbol.should.equal(_symbol);
    });

    it('has the correct decimals', async function() {
      const decimals = await this.token.decimals();
      decimals.should.be.bignumber.equal(_decimals);
    });

    it('total supply', async function(){
        const totalSupply = await this.token.totalSupply();
        totalSupply.should.be.bignumber.equal(_totalSupply);
    });
  });
});