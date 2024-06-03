import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";

async function deployQuizFactoryFixture() {
  const salt = "Salty sea sure";
  const question = "Whats 2 + 2";
  const answer = "4";

  // Contracts are deployed using the first signer/account by default
  const [owner, otherAccount] = await hre.ethers.getSigners();

  const QuizGameFactory = await hre.ethers.getContractFactory(
    "QuizGameFactory"
  );
  const quizGameFactory = await QuizGameFactory.deploy();

  return { quizGameFactory, owner, answer, salt, question };
}

describe("Deployment", function () {
  it("Should create a QuizGame game", async function () {
    const { quizGameFactory, owner } = await loadFixture(
      deployQuizFactoryFixture
    );
    const question = "What is the capital of France?";
    const answer = "Paris";
    const salt = "random_salt";

    expect(
      quizGameFactory.createQuizGame(question, answer, salt, {
        value: hre.ethers.parseEther("10"),
      })
    )
      .to.emit(quizGameFactory, "QuizGameCreated")
      .withArgs(await quizGameFactory.getAddress(), owner.address, question);
  });

  it("Should throw revert create a QuizGame contract", async function () {
    const { quizGameFactory, owner } = await loadFixture(
      deployQuizFactoryFixture
    );
    const question = "What is the capital of France?";
    const answer = "Paris";
    const salt = "random_salt";

    await expect(
      quizGameFactory.createQuizGame(question, answer, salt, {
        value: hre.ethers.parseEther("0"),
      })
    ).to.be.revertedWith("Must send some Ether to fund the quiz");
  });

  it("Should get exact quiz games", async function () {
    const { quizGameFactory } = await loadFixture(deployQuizFactoryFixture);

    const question = "What is the capital of France?";
    const answer = "Paris";
    const salt = "random_salt";

    await quizGameFactory.createQuizGame(question, answer, salt, {
      value: hre.ethers.parseEther("10"),
    });

    expect((await quizGameFactory.getQuizGames()).length).to.equal(1);
  });

  describe("QuizGameFactory", function () {
    describe("Deployment", function () {
      it("Should get exact quiz games", async function () {
        const { quizGameFactory } = await loadFixture(deployQuizFactoryFixture);

        const question = "What is the capital of France?";
        const answer = "Paris";
        const salt = "random_salt";

        const tx = await quizGameFactory.createQuizGame(
          question,
          answer,
          salt,
          {
            value: hre.ethers.parseEther("10"),
          }
        );
        await tx.wait(); // Ensure the transaction is mined

        const quizGames = await quizGameFactory.getQuizGames();
        expect(quizGames.length).to.equal(1);
      });
    });

    describe("removeQuizGame", function () {
      it("Should remove a quiz game", async function () {
        const { quizGameFactory, owner } = await loadFixture(
          deployQuizFactoryFixture
        );

        const question1 = "What is the capital of France?";
        const answer1 = "Paris";
        const salt1 = "random_salt";

        const tx = await quizGameFactory.createQuizGame(
          question1,
          answer1,
          salt1,
          {
            value: hre.ethers.parseEther("10"),
          }
        );
        await tx.wait(); // Ensure the transaction is mined

        const quizGamesBefore: any = await quizGameFactory.getQuizGames();
        expect(quizGamesBefore.length).to.equal(1);

        const quizGameAddress = quizGamesBefore[0];
        await quizGameFactory.removeQuizGame(quizGameAddress);

        const quizGamesAfter = await quizGameFactory.getQuizGames();
        expect(quizGamesAfter.length).to.equal(0);
      });

      it("Should revert if trying to remove a non-existing quiz game", async function () {
        const { quizGameFactory } = await loadFixture(deployQuizFactoryFixture);

        await expect(
          quizGameFactory.removeQuizGame(
            "0x0000000000000000000000000000000000000001"
          )
        ).to.be.revertedWith("Invalid index");
      });
    });

    describe("testFindQuizGameIndex", function () {
      it("Should return the correct index of a quiz game", async function () {
        const { quizGameFactory } = await loadFixture(deployQuizFactoryFixture);

        const question1 = "What is the capital of France?";
        const answer1 = "Paris";
        const salt1 = "random_salt";

        const tx = await quizGameFactory.createQuizGame(
          question1,
          answer1,
          salt1,
          {
            value: hre.ethers.parseEther("10"),
          }
        );
        await tx.wait(); // Ensure the transaction is mined

        const quizGames: any = await quizGameFactory.getQuizGames();

        const index = await quizGameFactory.testFindQuizGameIndex(quizGames[0]);
        expect(index).to.equal(0);
      });

      it("Should return an out-of-bounds index for a non-existing quiz game", async function () {
        const { quizGameFactory } = await loadFixture(deployQuizFactoryFixture);

        const index = await quizGameFactory.testFindQuizGameIndex(
          "0x0000000000000000000000000000000000000001"
        );
        const quizGames = await quizGameFactory.getQuizGames();
        expect(index).to.equal(quizGames.length);
      });
    });
  });
});
