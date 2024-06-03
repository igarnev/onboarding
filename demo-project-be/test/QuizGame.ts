import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";

async function deployQuizGameFixture() {
  const ONE_GWEI = 1_000_000_000;
  const salt = "Salty sea sure";
  const question = "Whats 2 + 2";
  const answer = "4";

  // Contracts are deployed using the first signer/account by default
  const [owner, otherAccount] = await hre.ethers.getSigners();

  const QuizGame = await hre.ethers.getContractFactory("QuizGame");
  const quizGame = await QuizGame.deploy(question, answer, salt, {
    value: ONE_GWEI,
  });

  return { quizGame, owner, otherAccount, ONE_GWEI, answer };
}

async function deployNonPayableContractFixture() {
  const NonPayableContract = await hre.ethers.getContractFactory(
    "NonPayableMocked"
  );
  const nonPayableContract = await NonPayableContract.deploy();

  return { nonPayableContract };
}

describe("Deployment", function () {
  it("Should receive and store the funds to lock", async function () {
    const { quizGame, ONE_GWEI } = await loadFixture(deployQuizGameFixture);
    expect(await hre.ethers.provider.getBalance(quizGame.target)).to.equal(
      ONE_GWEI
    );
  });

  it("Should fail if answer is not right", async function () {
    const { quizGame } = await loadFixture(deployQuizGameFixture);
    await expect(quizGame.guessAnswer("5")).to.be.revertedWith(
      "Answer is not right"
    );
  });

  it("Should fail with no fund to transfer if sending value is 0", async function () {
    const QuizGame = await hre.ethers.getContractFactory("QuizGame");

    const salt = "Salty sea sure";
    const question = "Whats 2 + 2";
    const answer = "4";

    await expect(
      (
        await QuizGame.deploy(question, answer, salt, { value: 0 })
      ).guessAnswer(answer)
    ).to.be.revertedWith("No funds to transfer");
  });

  it("Should emit an event on answer guessed correctly and remove the QuizGame instance", async function () {
    const { quizGame, owner, answer } = await loadFixture(
      deployQuizGameFixture
    );

    await expect(quizGame.guessAnswer(answer))
      .to.emit(quizGame, "AnswerGuessedCorrectly")
      .withArgs(owner.address, answer, quizGame.getBalance());
  });

  it("Should transfer the funds to the owner", async function () {
    const { quizGame, owner, answer, ONE_GWEI } = await loadFixture(
      deployQuizGameFixture
    );

    const initialOwnerBalance = await owner.provider.getBalance(owner.address);
    const initialQuizGameBalance = await quizGame.getBalance();

    expect(initialQuizGameBalance).to.equal(ONE_GWEI);

    await expect(quizGame.guessAnswer(answer)).to.changeEtherBalances(
      [owner, quizGame],
      [ONE_GWEI, -ONE_GWEI]
    );
  });

  it("Not payable", async function () {
    const { quizGame, answer, owner, ONE_GWEI } = await loadFixture(
      deployQuizGameFixture
    );

    const { nonPayableContract } = await loadFixture(
      deployNonPayableContractFixture
    );

    // Call the callOtherContract function of the NonPayable contract
    await expect(
      nonPayableContract.callOtherContract(await quizGame.getAddress(), answer)
    ).to.be.revertedWith("Transfer can't be send");
  });
});
