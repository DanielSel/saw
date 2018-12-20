# Security and Performance Analysis

## Possible Attacks

### Large-Scale Network Grieving
#### Scenario
* Attacker deploys same private key on a high number of IoT devices, say 100 000
* Attacker deposits moderate amount in smart contract
    * --> SAW Routers believe the risk is low
* Attacker then lets all devices connect at the same time (geographically distributed)

#### Effects
* Attacker gets more wifi than they can afford
* Attacker requires large number of physical devices to execute attack
* Devices have to be geographically distributed
* Mid-term evolution of Ethereum allows cheap, immediate claiming of fees by Routers --> nobody risks more than *max_interval* unpaid time per client

#### Conclusion
Possible in short-term future but highly unlikely, no serious damage to network, no real incentive