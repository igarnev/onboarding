import { ethers } from "hardhat";

export async function main() {
  const QuizFactory = await ethers.getContractFactory("QuizGameFactory");
  const quizFactory = await QuizFactory.deploy();

  await quizFactory.waitForDeployment();

  console.log("QuizFactory address:", await quizFactory.getAddress());
}
