# Smart Autonomous Wifi
## CI/CD Pipelines
SAW Service: [![Build Status](https://dev.azure.com/danielsel/saw/_apis/build/status/saw-service?branchName=develop)](https://dev.azure.com/danielsel/saw/_build/latest?definitionId=11&branchName=develop)

Racoon (Android App): [![Build Status](https://dev.azure.com/danielsel/saw/_apis/build/status/saw-client-racoon?branchName=develop)](https://dev.azure.com/danielsel/saw/_build/latest?definitionId=12&branchName=develop)

Tools: [![Build Status](https://dev.azure.com/danielsel/saw/_apis/build/status/tools-docker?branchName=develop)](https://dev.azure.com/danielsel/saw/_build/latest?definitionId=4&branchName=develop)

## User Guide
See doc/user-guide.md

## Developer Guide
See doc/dev-guide.md


## Idea
Wifi Network spanned by autonomous routers providing service to everyone and everything with payment secured by an Ethereum Smart Contract.
**TODO**

### Architecture
Using a Proof of Presence (POP) protocol, the network usage of a client can be tracked through a smart contract safely, effeciently, and inexpensive. The protocol works by having clients generate POP messages in short intervals, sign them and send them to the access point while they are connected. These POP messages represent a single session and contain an accumulator to track the entire usage time in a session. 

After a session has ended, the access point has 24h to cashout ETH (Ethereum Money), deposited by the client before starting the session, by transmitting only the last POP of a session. Since the deposited amount for a specific client is public record, the Access Point can base his decision on weather to accept a connection and how much to limit it on the balance of the client. 

This way client devices never interact with the smart contract directly and therefore are not required to run an Ethereum client, allowing for low ressource requirements.

Users on both, provider and client side, use the Smart Contract to manage their balance. Providers submit valid session POPs (session id did not exist in the last 24h) to cashout their earnings into their wallets while clients can deposit money or withdraw (with a delay) money from the smart contract.

### Analysis
A quick analysis of the theoretical perspectives and threats for the concept can be found in doc/analysis.md


## Prototype
### Assumptions
* 1 ETH = ~100 EUR (at the time of development)
* 5 EUR per 24h of Connectivity (unlimited data)

### Design
* FreeRADIUS with `exec` script for authentication --> Roaming between routers, as long as same SSID and authentication is successful
* `exec` script triggers RPC call in SAW service
* SAW service evaluates client's balance in smart contract, creates session and expects a POP in `<short amount of time> (eg. 10s)`, otherwise it will disconnect and blacklist the client for `<short amount of time> (eg. 60s)`
* After a session ends (client disconnected), the SAW service sends the last POP to the smart contract using INFURA to cashout
* POPs contain accumulated time --> only last pop of a session required for checkout --> transaction efficiency

### TODO
* Limitations?


## Future Work
### General
* Payment per used Data Valume instead of / in addition to Time
* Implement for IoT platforms
* Possibility to continue Sessions (instead of requesting new session on every connect)

### Smart Contract
* Pricing Policies configurable by providers
* Ability to link prices to EUR or USD (instead of ETH) --> reduce volatility

### SAW Router
#### General
* Implement Authentication as native FreeRADIUS module (instead of using exec module)
* On powerful routers: run Ethereum node ourselves (instead of using INFURA)
* Implement pop service in c/c++/go/rust/whatever is lightweight and fast
#### Cashout
* Manual Cashout Mode: Store pre-computed, unsigned transactions from POPs for later manual cashout using a wallet
* Secure(-er) Automatic Cashout Mode (aka. Paranoia Mode): Protocol for Remote Signing Server --> Wallet can be stored in a single secure server and routers only send unsigned transactions and receive signed transactions 

### Android App
* App could auto-react when the SAW Wifi is chosen

### Technical Improvements
* Safer Session ID Generation: Check Session IDs submitted to Smart Contract in last 24h (free)