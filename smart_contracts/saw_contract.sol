pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;


contract SawWallet {

    mapping(address => uint) balances;
    mapping(address => OpenWithdrawal[]) openUserWithdrawals;

    // You can withdraw the money after 1 day
    uint constant WITHDRAW_DELAY = 60 * 60 * 24;

    struct OpenWithdrawal {
        uint timestamp;
        uint amount;
    }

    function deposit() public payable {
        balances[msg.sender] += msg.value;
    }

    function withdraw(uint amount) public {
        require(balances[msg.sender] > amount, "Insufficient funds.");

        OpenWithdrawal memory newWithdrawal = OpenWithdrawal(now + WITHDRAW_DELAY, amount);

        balances[msg.sender] -= amount;
        openUserWithdrawals[msg.sender].push(newWithdrawal);
    }

    function cashout() public {
        uint payout = 0;
        OpenWithdrawal[] memory openWithdrawals = openUserWithdrawals[msg.sender];

        for (uint i = 0; i < openWithdrawals.length; i++) {
            if (openWithdrawals[i].timestamp >= now) {
                payout += openWithdrawals[i].amount;
                delete openWithdrawals[i];
            }
        }

        msg.sender.transfer(payout);

    }

    function getBalance(address user) public view returns (uint balance) {
        OpenWithdrawal[] memory openWithdrawals = openUserWithdrawals[user];

        uint outstandingBalance = 0;
        for (uint i = 0; i < openWithdrawals.length; i++) {
            outstandingBalance += openWithdrawals[i].amount;
        }
        uint userBalance = balances[user];

        return userBalance - outstandingBalance;
    }

    function getWithdrawals() public view returns (OpenWithdrawal[] memory openWithdrawals) {
        return openUserWithdrawals[msg.sender];
    }
}