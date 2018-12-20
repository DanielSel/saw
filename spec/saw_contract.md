# Specification: SAW Smart Contract
* Basically "online-wallet" for users
* Users deposit, funds available immediately
* Withdrawal period before funds are available again (not long, just so routers have fair chance of claiming their price)
* Payout whenever Router commits collection of (valid) pops to smart contract
    * TODO: Determine if we have to tie pops to routers (using router's pubkey in message)