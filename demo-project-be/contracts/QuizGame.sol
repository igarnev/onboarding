// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.18;

import "./QuizFactory.sol";

contract QuizGame {
    bytes32 private hashedAnswer;
    string public question;
    string private salt;
    address public factory;

    event AnswerGuessedCorrectly(
        address indexed winner,
        string answer,
        uint256 winnedPrize
    );

    constructor(
        string memory _question,
        string memory _answer,
        string memory _salt
    ) payable {
        question = _question;
        hashedAnswer = keccak256(abi.encodePacked(_answer, _salt));
        salt = _salt;
        factory = msg.sender;
    }

    function guessAnswer(string calldata guessedAnswer) public payable {
        require(
            (hashedAnswer == keccak256(abi.encodePacked(guessedAnswer, salt))),
            "Answer is not right"
        );
        require(address(this).balance > 0, "No funds to transfer");

        uint256 balance = address(this).balance;
        (bool success, ) = msg.sender.call{value: balance}("");

        require(success, "Transfer can't be send");

        emit AnswerGuessedCorrectly(msg.sender, guessedAnswer, balance);

        QuizGameFactory(factory).removeQuizGame(address(this));
    }

    receive() external payable {}

    fallback() external payable {}

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }
}
