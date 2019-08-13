# TODOs
Things that will be done by me when I can find the time. Or by anyone else, feel free to knock yourself out...
Kinda sorted by priority.

## General
* Document Build Process
* More detailed explanation of Code

## Racoon (Android App)
* Configurable Settings
* Store Wallet info encrypted (Key backed by HWE Module)
* Either auto-configure SAW Wifi Network or show username + password to user for quick copy & paste
* Fix Name & Icon
* Become verified Google Play Store developer
* Publish App in Play Store (as soon as production-ready)

## CI/CD
Improvements to the Continuous Integration/Delivery Pipelines

### General
* Define workflow for collaboration (will do latest when first collaborator shows interest)
* Unit Tests & E2E Tests (!!!)
* Temporary CI Environments for Pull Requests (running all tests for regression testing)

### SAW Service (Router)
* Detect if Smart Contract has changed and automatically deploy to ropsten. Then extract the Smart Contract address and update the value in the SAW Service default config (`router/openwrt_pkgs/saw/files/etc/config/saw`)
* Set up custom-built OPKG repository with correct signatures (maybe Google Cloud using Serverless Functions?). Then send PR to OpenWRT/Turris Projects with signing keys
* Add Staging and Production Environments
