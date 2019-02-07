# Smart Autonomous Wifi
## Idea
Wifi Network spanned by autonomous routers providing service to everyone with payment secured by an Ethereum Smart Contract.


## Prototype
### Assumptions
* 1 ETH = ~100 EUR (at the time of development)
* 5 EUR per 24h of Connectivity (unlimited data)
TODO

## Future Work

### General
* Payment per used Data Valume instead of / in addition to Time
* Implement for IoT platforms
* Possibility to continue Sessions (instead of requesting new session on every connect)

### Smart Contract
* Pricing Policies configurable by providers
* Ability to link prices to EUR or USD (instead of ETH) --> reduce volatility

### SAW Router
* Implement Authentication as native FreeRADIUS module (instead of using exec module)
* On powerful routers: run Ethereum node ourselves (instead of using INFURA)
* Implement pop service in c/c++/go/rust/whatever is lightweight and fast

### Android App
* App could auto-react when the SAW Wifi is chosen