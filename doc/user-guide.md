# User Guide
To try out the PoC (Proof of Concept) for the Autonomous IoT Wifi, you need a OpenWRT 18.06 capable device (as SAW provider) and an Android Phone with Android 5.0 (Lollipop) or higher (as SAW client).

This guide is based on a Turris Omnia as router, but it should work similarly on any other OpenWRT device.

## Pre-Requisits
### Router
1. Install Turris OS 4.x
    * Download the latest release from [here](https://repo.turris.cz/hbs/medkit/)
    * Rename the file to `omnia-medkit-4.0.tar.gz` and put it on the root of an `ext4` formatted USB drive (if you're on windows, you can use [MiniTool Partition Wizard](https://www.partitionwizard.com/free-partition-manager.html) to format and [ext2fsd](https://sourceforge.net/projects/ext2fsd/) to copy the files)
    * Plug the USB drive into your Turris Omnia
    * Press and hold reset button on the back till 4 LEDs including power one are lit, then release
2. Setup WAN (Internet Access)\
If you are at home and have a wired LAN connection available, just connect the WAN port from Turris Omnia to a LAN port on your router and you should be done. If you need to use a WiFi Network as upstream Internet connection (e.g. eduroam):
    * Login to the LuCi webinterface
    * Go to the `Network` Tab and click on `Wireless`
    * At the `radio 1` row, click on `Scan`
    * Choose the respective Wifi you want to connect to (e.g. `eduroam`) and enter your credentials
    * Make sure the selected Firewall Zone is `wan`
    * Click `Save & Apply`
3. Setup the `SAW` WiFi Network on the Router
    * Login to the LuCi webinterface
    * Go to the `Network` Tab and click on `Wireless`
    * At the `radio 0` row, click on `Add`
    * Make sure mode is set to `Access Point`
    * Make sure the selected Firewall Zone is `lan`
    * In the `SSID` field type `SAW`
    * Change to the `Wireless Security` tab and select `WPA2 EAP`
    * Enter `127.0.0.1` in both RADIUS server fields (Authorization and Accounting)
    * Enter `testing123` in both RADIUS secret fields
    * Click `Save & Apply`
4. (Optional) Add a 'normal' Wifi Network (WPA2 PSK) to comfortably administrate the router


## Installation
### Router
1. Add the SAW Repository to the OpenWRT Package Lists
    * Login to the LuCi webinterface
    * Go to the `System` tab and click on `Software`
    * In the Configuration tab, comment out (hashtag) the last line of the general configuration field by changing it from `option check_signature` to `#option check_signature` and click `Submit` (currently BinTrays signing process is flawed, so we have to disable signature verification for this repo)
    * In the `Custom Feeds` field, add `src/gz saw https://dl.bintray.com/danielsel/saw-dev-openwrt` to the end of the list and click `Submit`
    * Go back to the `Actions` tab and click `Update lists`. You should see a line that reads `Downloading https://dl.bintray.com/danielsel/saw-dev-openwrt/Packages.gz` and another one with `Updated list of available packages in /var/opkg-lists/saw` in the resulting output
2. Find the package `saw` and install it.\
The installation process will automatically install all dependencies (including nodejs, grpc, and freeradius3 + modules) and configure them accordingly.
*Important Note: Make sure that freeradius is either not installed or in its default configuration before installing SAW*
3. Configure SAW\
    * Log in to the router using SSH with `root@<router-ip-address` and the LuCi password
    * Open the config file in your favourite editor, eg. `vi /etc/config/saw`
    * Enter your Ethereum Wallet Secret as *Mnemonic* OR *Private Key* in `option contract_wallet_mnemonic` or `option contract_wallet_privatekey` respectively. If you don't know what this means, check out [this guide](https://kb.myetherwallet.com/en/getting-started/how-to-create-a-wallet/) and follow the Instructions under `Mnemonic Phrase`.
4. Reboot the Router

### Android Phone
1. Open the [public CI Build Install Page](https://install.appcenter.ms/users/daniel.sel/apps/racoon/distribution_groups/public) from an Android Phone
2. Click on `Download`
3. Tap `Open` in the Chrome Notification after successful download
4. If the "allow untrusted sources" setting has not been enabled yet, Android will ask you if you want to allow App installs from Chrome. In this case, move the `Allow from this source` slider to the right (enabled)
5. Click `Install`
6. Play Protect will warn you that it doesn't recognize the developer (me). Click `Install Anyway`
7. The App will be installed on your phone under the name `SAW Client`

## Usage
Nice, now we got it all installed and set up, but how to use it?

### Racoon (Android App)
1. Open the Racoon App and it will probably tell you that you are not connected to `SAW` Network
2. Connect to the SAW Network. The username is the public key of your Ethereum Wallet and the password is the signature data of the public key (signed by your private key). In the current PoC state, the Wallet is hardcoded into the Android App with the following resulting values:
    * Username: `0x9C850041C6F6A7430dF01A6c246f60bDa4313571`
    * Password: `0x4de9a340fe26683a0ba5071355ac952d2ed815238ebbe96a31a9ed7db1eae28b719dd485911d1c692f7479c885e8d0eb41`
Additionally you will need the following settings:
    * EAP Method: `TTLS`
    * Phase 2 Authentication: `PAP`
    * Don't validate CA certificate
3. The router should now give you ~ 10s of time to send the first POP message, which (if everything is setup correctly) will be automatically done by the Racoon app periodically until you disconnect from the `SAW` wifi.