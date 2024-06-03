import { HardhatUserConfig, task } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.18",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
  networks: {
    sepolia: {
      url: `https://sepolia.infura.io/v3/381d7045948046f5931b8da7d1066201`,
      accounts: [
        `0x4f5ad0359ca6891a51231bc3ccd3c152f801ec421ab9560fe2dec13eb888e271`,
      ],
    },
    polygon: {
      url: `https://polygon-amoy.infura.io/v3/381d7045948046f5931b8da7d1066201`,
      accounts: [
        `0x4f5ad0359ca6891a51231bc3ccd3c152f801ec421ab9560fe2dec13eb888e271`,
      ],
    },
  },
  etherscan: {
    apiKey: "MJE47EWDVR69T661WJWV52TMRVSNEIF1XY",
  },
};

const lazyImport = async (module: any) => {
  return await import(module);
};

task("deploy", "Deploys the Factory Contract").setAction(async () => {
  const { main } = await lazyImport("./scripts/deploy-quiz-factory");
  await main();
});

export default config;
