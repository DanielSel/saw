package net.dsos.sawclient

import android.support.v7.app.AppCompatActivity
import android.os.Bundle
import android.content.IntentFilter
import android.view.View
import kotlinx.android.synthetic.main.activity_debug.*
import android.content.Intent




class DebugActivity() : AppCompatActivity() {

    private val sawGrpcClient = SawGrpcClient();

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_debug)
    }

    public fun newSession(view: View) {
        sawGrpcClient.newSession()
    }

    public fun sendPop(view: View) {
        sawGrpcClient.sendPop()
    }

    public fun startPopSvc(view: View) {
        val startIntent = Intent(this, PopService::class.java)
        startIntent.action = PopService.ACTION_START_FOREGROUND_SERVICE
        startService(startIntent)
    }

    public fun stopPopSvc(view: View) {
        val stopIntent = Intent(this, PopService::class.java)
        stopIntent.action = PopService.ACTION_STOP_FOREGROUND_SERVICE
        startService(stopIntent)
    }
}
