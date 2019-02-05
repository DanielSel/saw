# Specification: Proof of Presence Protocol

## General
* SAW Router and Client negotiate interval (e.g. pop every 20s, limits configurable for router and client)
* Client sends pop's with max. the agreed interval between distinct messages
* SAW Router collects pop's and kicks client if it exceeds interval + threshold (configurable)
* Client devices do not need to interact with smart contract ever


## pop Datastructure
```
struct pop {
    session_id: uint
    acc_time: uint // Accumulated time
    ap_pubkey: pubkey // do we need this?
    mac_address: bytes // do we need this?  --> + security - cannot use same wallet for multiple devices
    signature: [v, r, s] // research
}
```

## Properties
* Small packets, low bandwitdth requirement
* Can be pre-computed 
    * --> Free tradeoff between CPU power and storage space (for very small devices, e.g. IoT)
    * Can be deployed on devices without secure element (limited risk by not deploying private key)


## SAW Router Service
* Node.js
* Background Service
* OpenWRT Package
* Listen on single TCP Port

## Android Client Service
* Use AlarmManager to schedule interval wakeups
* Store Private Key in secure element

