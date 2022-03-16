const { deployProxy } = require('@openzeppelin/truffle-upgrades');
const EDAINToken = artifacts.require('EDAINToken');

var chai = require("chai");
const BN = web3.utils.BN;
const chaiBN = require('chai-bn')(BN);
chai.use(chaiBN);

var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);

const expect = chai.expect;

contract('EDAINToken', accounts => {

  const _owner = accounts[0]
  const _name = 'EDAIN';
  const _symbol = 'EAI';
  const _decimals = new BN("18");
  const _initialSupply = new BN("200000000000000000000000000"); // we pass 200 million as argument for tests
  const _cap = new BN("470000000000000000000000000"); // 470 million
  const _mintSafe = new BN("260000000000000000000000000");
  const _mintUnsafe = new BN("360000000000000000000000000");
  const _newMint = new BN("5381");
  const _ownerRole = '0x0000000000000000000000000000000000000000000000000000000000000000';
  const _snapshotRole = web3.utils.soliditySha3('SNAPSHOT_ROLE');
  const _pauseRole = web3.utils.soliditySha3('PAUSER_ROLE');
  const _mintRole = web3.utils.soliditySha3('MINTER_ROLE');


  before(async () => {
    this.token = await deployProxy(EDAINToken, [initialMint = 200000000]);
  });


  describe('Token attributes', () => {
    it('has the correct name', async () => {
      expect(await this.token.name()).to.be.equal(_name)
    })

    it('has the correct symbol', async () => {
      expect(await this.token.symbol()).to.be.equal(_symbol)
    })

    it('has the correct decimals', async () => {
      expect(await this.token.decimals()).to.be.a.bignumber.equal(_decimals)
    })

    it('has minted initial supply', async () => {
      expect(await this.token.totalSupply()).to.be.a.bignumber.equal(_initialSupply)
    })
  })

  describe('Owner roles and supply', async () => {
    it('has default admin role', async () => {
      expect(await this.token.hasRole(_ownerRole, _owner)).to.be.true
    })

    it('has role for snapshots', async () => {
      expect(await this.token.hasRole(_snapshotRole, _owner)).to.be.true
    })

    it('has role to (un)pause the contract', async () => {
      expect(await this.token.hasRole(_pauseRole, _owner)).to.be.true
    })

    it('has role to mint and burn new tokens', async () => {
      expect(await this.token.hasRole(_mintRole, _owner)).to.be.true
    })

    it('has the total supply minted', async () => {
      expect(await this.token.balanceOf(_owner)).to.be.a.bignumber.equal(_initialSupply)
    })
  })

  describe('Total supply capped', () => {
    it('starts with the correct cap', async () => {
      expect(await this.token.cap()).to.be.a.bignumber.equal(_cap);
    });

    it('can mint new tokens under the cap', async () => {
      await expect(this.token.mint(_owner, _mintSafe)).to.eventually.be.fulfilled
      expect(await this.token.balanceOf(_owner)).to.be.a.bignumber.equal(_initialSupply.add(_mintSafe))
    });

    it('cannot mint because cap reached', async () => {
      await expect(this.token.mint(_owner, _mintUnsafe)).to.eventually.be.rejectedWith('VM Exception while processing transaction: revert ERC20Capped: cap exceeded -- Reason given: ERC20Capped: cap exceeded.')
    })
  })


  describe('Mint/Burn/Pause', async () => {
    it('can mint new tokens', async () => {
      await this.token.mint(accounts[1], _newMint)
      expect(await this.token.balanceOf(accounts[1])).to.be.a.bignumber.equal(_newMint);
    })

    it('can burn tokens', async () => {
      await this.token.burn(_newMint)
      expect(await this.token.balanceOf(_owner)).to.be.a.bignumber.equal(_initialSupply.add(_mintSafe).sub(_newMint));
    })

    it('can not transfer when paused', async () => {
      await this.token.pause()
      await expect(this.token.transfer(accounts[4], accounts[1], 1000)).to.eventually.be.rejected;
    })
  })
});