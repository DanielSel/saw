pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;


contract SawWallet {

    mapping(address => uint) balances;
    mapping(address => OpenWithdrawal[]) openUserWithdrawals;

    mapping(uint64 => uint) usedSessionIds;

    // You can withdraw the money after 24h
    uint constant WITHDRAW_DELAY = 86400;

    // After 24h Session IDs can be reused
    uint constant SESSION_ID_REUSE_TIMEOUT = 86400;

    // To be configurable and externalized (Every Provider can set up their own policies)
    // FW: Add Payment per Data Volume
    // WEI_PER_SECOND ~ 5 EUR / 24h at 100 EUR / ETH
    uint constant WEI_PER_MILLISECOND = 578703703;

    struct OpenWithdrawal {
        uint timestamp;
        uint amount;
    }

    struct Pop {
        uint64 sessionId;
        uint64 accTime;
        // Signature
        uint8 v;
        bytes32 r; 
        bytes32 s;
    }

    event PopPaymentResult(
       uint[] successfulPops
    );

    // Deposit money to spend on SAW Services (Helper if sending directly to Contract Address, e.g. Wallet UI)
    function() external payable {
        balances[msg.sender] += msg.value;
    }

    // Deposit money to spend on SAW Services
    function deposit() external payable {
        balances[msg.sender] += msg.value;
    }

    // Open a Withdrawal (Ready for Cashout after WITHDRAW_DELAY)
    function withdraw(uint amount) external {
        require(balances[msg.sender] > amount, "Insufficient funds.");

        OpenWithdrawal memory newWithdrawal = OpenWithdrawal(now + WITHDRAW_DELAY, amount);

        balances[msg.sender] -= amount;
        openUserWithdrawals[msg.sender].push(newWithdrawal);
    }

    // Cashout the available open withdrawals
    function cashout() external {
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

    // Get Balance of specific User
    function getBalance(address user) external view returns (uint balance) {
        return balances[user];
    }

    // Get your own balance
    function getOwnBalance() external view returns (uint balance) {
        return balances[msg.sender];
    }

    // Get your own withdrawals
    function getWithdrawals() external view returns (OpenWithdrawal[] memory openWithdrawals) {
        return openUserWithdrawals[msg.sender];
    }

    // Payout a single POP
    function payoutSinglePop(uint64 sessionId, uint64 accTime, uint8 v, bytes32 r, bytes32 s) external {
        address client = ecrecover(keccak256(abi.encodePacked(sessionId + accTime)), v, r, s);
        uint payment = accTime * WEI_PER_MILLISECOND;
        require(balances[client] >= payment, "Insufficient funds in client account. Invalid Signature?");

        // This works because usedSessionIds is a mapping in storage with all unset entries defaulting to 0, which is always smaller then a set timestamp
        require(usedSessionIds[sessionId] < now - SESSION_ID_REUSE_TIMEOUT, "A session with the same ID has been cashed out during the last 24h");

        usedSessionIds[sessionId] = now;
        balances[client] -= payment;
        balances[msg.sender] += payment;
    }

    // EXPERIMENTAL: Payout a list of POPs (more efficient for a lot of pops)
    function payoutPopList(Pop[] memory pops) public {
        uint[] memory successfulPops = new uint[](pops.length);
        for (uint i = 0; i < pops.length; i++) {
            address client = ecrecover(keccak256(abi.encodePacked(pops[i].sessionId + pops[i].accTime)), pops[i].v, pops[i].r, pops[i].s);
            uint payment = pops[i].accTime * WEI_PER_MILLISECOND;
            if (balances[client] >= payment) {
                balances[client] -= payment;
                balances[msg.sender] += payment;
                successfulPops[i] = pops[i].sessionId;
            }
        }
        emit PopPaymentResult(successfulPops);
    }
}