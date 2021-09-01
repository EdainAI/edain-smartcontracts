const EDAINToken = artifacts.require("EDAINToken");
const EDAINStaking = artifacts.require("EDAINStaking");

module.exports = function (deployer) {
  deployer.deploy(EDAINToken);
  deployer.deploy(EDAINStaking);
};
