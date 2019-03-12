package net.dsos.sawclient

import android.support.v7.app.AppCompatActivity
import android.os.Bundle
import android.content.IntentFilter
import kotlinx.android.synthetic.main.activity_main.*


class MainActivity() : AppCompatActivity() {

    private val wifiChangeFilter: IntentFilter = IntentFilter();
    private val wifiChangeReceiver: WifiChangeReceiver;

    init {
        this.wifiChangeFilter.addAction("android.net.wifi.STATE_CHANGE")
        this.wifiChangeFilter.addAction("android.net.wifi.WIFI_STATE_CHANGED")
        this.wifiChangeReceiver = object : WifiChangeReceiver() {
            override fun updateView(ssid: String?, bssid: String?) {
                text_ssid.text = ssid;
                text_bssid.text = bssid;
            }
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        registerReceiver(this.wifiChangeReceiver, this.wifiChangeFilter);
    }
}
