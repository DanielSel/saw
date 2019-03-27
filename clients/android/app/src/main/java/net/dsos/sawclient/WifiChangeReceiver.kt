package net.dsos.sawclient

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.net.wifi.WifiInfo
import android.net.wifi.WifiManager
import android.net.NetworkInfo


abstract class WifiChangeReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context?, intent: Intent?) {
        if (intent?.action == WifiManager.NETWORK_STATE_CHANGED_ACTION) {
            val info = intent.getParcelableExtra<NetworkInfo>(WifiManager.EXTRA_NETWORK_INFO)
            if(info.detailedState.equals(NetworkInfo.DetailedState.CONNECTED)) {
                val wifiInfo = intent.getParcelableExtra<WifiInfo>(WifiManager.EXTRA_WIFI_INFO);
                addStatusLogEntry("Connected to Wifi ${wifiInfo.ssid} at Access Point ${wifiInfo.bssid}. ");

                if(wifiInfo.ssid == "\"SAW\"") {
                    val startIntent = Intent(context, PopService::class.java)
                    startIntent.action = PopService.ACTION_START_FOREGROUND_SERVICE
                    context!!.startService(startIntent)
                    addStatusLogEntry("SAW Network detected!")
                    addStatusLogEntry("RACOON is getting to work...")
                    setStatusAnimation(true)
                } else {
                    val stopIntent = Intent(context, PopService::class.java)
                    stopIntent.action = PopService.ACTION_STOP_FOREGROUND_SERVICE
                    context!!.startService(stopIntent)
                    addStatusLogEntry("Disconnected from SAW Network!")
                    addStatusLogEntry("RACOON is resting...")
                    setStatusAnimation(false)
                }
            }
        } else if (intent?.action == WifiManager.WIFI_STATE_CHANGED_ACTION) {
            val wifiState = intent.getIntExtra(WifiManager.EXTRA_WIFI_STATE, -1);
            if(wifiState != WifiManager.WIFI_STATE_ENABLING
                && wifiState != WifiManager.WIFI_STATE_ENABLED) {
                //addStatusLogEntry(context?.resources?.getString(R.string.text_disconnected));
                addStatusLogEntry("Disconnected from Wifi.");
            }
        }
    }

    protected abstract fun addStatusLogEntry(text: String?)
    protected abstract fun setStatusAnimation(running: Boolean)
}