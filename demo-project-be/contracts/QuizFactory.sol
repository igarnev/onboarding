// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.18;

import "./QuizGame.sol";

contract QuizGameFactory {
    QuizGame[] public quizGames;

    event QuizGameCreated(
        address indexed quizGameAddress,
        address indexed owner,
        string question
    );

    function createQuizGame(
        string memory _question,
        string memory _answer,
        string memory _salt
    ) public payable {
        require(msg.value > 0, "Must send some Ether to fund the quiz");

        // Deploy a new QuizGame contract
        QuizGame newQuizGame = (new QuizGame){value: msg.value}(
            _question,
            _answer,
            _salt
        );

        // Add the new QuizGame to the array
        quizGames.push(newQuizGame);

        // Emit event with the address of the new QuizGame contract
        emit QuizGameCreated(address(newQuizGame), msg.sender, _question);
    }

    function getQuizGames() public view returns (QuizGame[] memory) {
        return quizGames;
    }

    function removeQuizGame(address quizGameAddress) public {
        uint index = findQuizGameIndex(quizGameAddress);
        require(index < quizGames.length, "Invalid index");

        // Move the last element into the place to delete
        quizGames[index] = quizGames[quizGames.length - 1];
        quizGames.pop();
    }

    function findQuizGameIndex(
        address quizGameAddress
    ) internal view returns (uint) {
        for (uint i = 0; i < quizGames.length; i++) {
            if (address(quizGames[i]) == quizGameAddress) {
                return i;
            }
        }

        // Return an out of bounds index if not found
        return quizGames.length;
    }

    // Wrapper function for testing
    function testFindQuizGameIndex(
        address quizGameAddress
    ) public view returns (uint) {
        return findQuizGameIndex(quizGameAddress);
    }
}
