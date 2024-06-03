// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.18;

interface CallInterface {
    function guessAnswer(string memory guessedAnswer) external;
}

contract NonPayableMocked {
    function callOtherContract(
        address _target,
        string memory _guessedAnswer
    ) public {
        CallInterface(_target).guessAnswer(_guessedAnswer);
    }

    receive() external payable {
        revert("Fallback revert");
    }

    fallback() external payable {
        revert("Fallback revert");
    }
}
