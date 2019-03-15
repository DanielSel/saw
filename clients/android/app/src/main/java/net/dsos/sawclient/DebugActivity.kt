package net.dsos.sawclient

import android.support.v7.app.AppCompatActivity
import android.os.Bundle
import android.content.IntentFilter
import android.view.View
import kotlinx.android.synthetic.main.activity_debug.*


class DebugActivity() : AppCompatActivity() {

    private val popSvc: PopService = PopService();
    private val sawGrpcClient = SawGrpcClient();

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_debug)
    }

    public fun newSession(view: View) {
    }

    public fun sendPop(view: View) {

    }
}
