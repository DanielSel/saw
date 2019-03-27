package net.dsos.sawclient

import android.content.Intent
import android.support.v7.app.AppCompatActivity
import android.os.Bundle
import android.content.IntentFilter
import android.text.method.ScrollingMovementMethod
import android.view.View
import kotlinx.android.synthetic.main.activity_main.*
import android.graphics.drawable.AnimationDrawable


class MainActivity() : AppCompatActivity() {

    private val wifiChangeFilter: IntentFilter = IntentFilter();
    private val wifiChangeReceiver: WifiChangeReceiver;

    init {
        this.wifiChangeFilter.addAction("android.net.wifi.STATE_CHANGE")
        this.wifiChangeFilter.addAction("android.net.wifi.WIFI_STATE_CHANGED")
        this.wifiChangeReceiver = object : WifiChangeReceiver() {
            override fun addStatusLogEntry(text: String?) {
                status_text.append("\n$text")
            }

            override fun setStatusAnimation(running: Boolean) {
                if(running) {
                    val statusCircleAnimation = status_circle_img.drawable as AnimationDrawable
                    statusCircleAnimation.start()
                } else {
                    val statusCircleAnimation = status_circle_img.drawable as AnimationDrawable
                    statusCircleAnimation.stop()
                }
            }
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        registerReceiver(this.wifiChangeReceiver, this.wifiChangeFilter)

        status_text.movementMethod = ScrollingMovementMethod()
        status_text.text = "RACOON is ready."

        if(resources.getBoolean(R.bool.DEBUG)){
            main_btn_debugview.visibility = View.VISIBLE;
        }
    }

    public fun openDebugView(view: View) {
        startActivity(Intent(this, DebugActivity::class.java));
    }
}
