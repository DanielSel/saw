# Specification: User Authentication

## Policy Decisions
* *Number of Connections per Identity*: SAW Router decides how many physical devices per same identity (Ethereum PubKey) it allows
* *Minimum Required Balance*: The necessary remaining balance for Ethereum PubKey in the SAW Smart Contract

## Protocol (RADIUS)
* Client sends RADIUS request with user=pubkey, pw=signature(pubkey) to SAW Router
* FreeRADIUS Server on SAW Router executes Node.js auth script
* Auth script checks signature and balance in smart contract
* Auth script decides on request by applying *Policies*

## Roaming
* Should work out-of-the-box without any changes? --> evaluate