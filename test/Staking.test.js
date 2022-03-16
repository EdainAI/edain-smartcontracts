const { deployProxy } = require('@openzeppelin/truffle-upgrades');
const { assert } = require('chai');
const EDAINToken = artifacts.require('EDAINToken');

var chai = require("chai");
const BN = web3.utils.BN;
const chaiBN = require('chai-bn')(BN);
chai.use(chaiBN);

var chaiAsPromised = require("chai-as-promised");
const truffleAssert = require('truffle-assertions');
const helper = require("./helpers/timeTravel");

chai.use(chaiAsPromised);

const expect = chai.expect;

contract('EDAINToken', accounts => {

    const _owner = accounts[0]
    const _stakeAmount = web3.utils.toWei('1000', 'ether');
    const _invalidStakeAmount = new BN("300000000000000000000000000");
    const _withdrawStakeAmount = web3.utils.toWei('500', 'ether');

    describe('Staking EAI tokens', async () => {
        before(async () => {
            this.token = await deployProxy(EDAINToken, [initialMint = 200000000]);
        });

        it('should fail because balance is lower than staked amount', async () => {
            await expect(this.token.stake(_invalidStakeAmount, { from: _owner })).to.eventually.be.rejectedWith('VM Exception while processing transaction: revert ERC20: Balance of the sender is lower than the staked amount -- Reason given: ERC20: Balance of the sender is lower than the staked amount.')
        })

        it('can place a stake and the reward is 10% APY', async () => {
            let stakeTx = await this.token.stake(_stakeAmount, { from: _owner })
            truffleAssert.eventEmitted(
                stakeTx,
                "Staked",
                (ev) => {
                    assert.equal(ev.amount, _stakeAmount, "Stake amount in event was not correct");
                    assert.equal(ev.index, 1, "Stake index was not correct");
                    return true;
                },
                "Stake event should have triggered");

            // time travel 1 year in advance
            await helper.advanceTimeAndBlock(3600 * 24 * 365);
            let stakeSummary = await this.token.hasStake(_owner);
            let stake = stakeSummary.stakes[0]

            assert(stakeSummary.total_amount == _stakeAmount, "Amount of stake should be 1000 EAI")
            assert(stake.claimable == web3.utils.toWei('100', 'ether'), "We should get in one year 100 EAI, 10% APY")
        })

        it('can withdraw half the stake', async () => {
            await expect(this.token.withdrawStake(_withdrawStakeAmount, 0, { from: _owner })).to.eventually.be.fulfilled
        })

        it('can withdraw the other half', async () => {
            await expect(this.token.withdrawStake(_withdrawStakeAmount, 0, { from: _owner })).to.eventually.be.fulfilled
        })

        it('should fail to withdaw since there is no more stake', async () => {
            await expect(this.token.withdrawStake(_withdrawStakeAmount, 0, { from: _owner })).to.eventually.be.rejectedWith('VM Exception while processing transaction: revert Staking: Cannot withdraw more than you have staked -- Reason given: Staking: Cannot withdraw more than you have staked.')
        })
    })

})