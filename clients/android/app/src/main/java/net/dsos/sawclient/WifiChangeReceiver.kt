package net.dsos.sawclient

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.net.wifi.WifiInfo
import android.net.wifi.WifiManager
import android.net.NetworkInfo
import android.util.Log


abstract class WifiChangeReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context?, intent: Intent?) {
        if (intent?.action == WifiManager.NETWORK_STATE_CHANGED_ACTION) {
            val info = intent.getParcelableExtra<NetworkInfo>(WifiManager.EXTRA_NETWORK_INFO)
            if(info.detailedState.equals(NetworkInfo.DetailedState.CONNECTED)) {
                val wifiInfo = intent.getParcelableExtra<WifiInfo>(WifiManager.EXTRA_WIFI_INFO);
                updateView(wifiInfo.ssid, wifiInfo.bssid);

                if(wifiInfo.ssid == "SAW") {

                }
            }
        } else if (intent?.action == WifiManager.WIFI_STATE_CHANGED_ACTION) {
            val wifiState = intent.getIntExtra(WifiManager.EXTRA_WIFI_STATE, -1);
            if(wifiState != WifiManager.WIFI_STATE_ENABLING
                && wifiState != WifiManager.WIFI_STATE_ENABLED) {
                updateView(context?.resources?.getString(R.string.text_disconnected),
                    context?.resources?.getString(R.string.text_disconnected));
            }
        }
    }

    protected abstract fun updateView(ssid: String?, bssid: String?)
}