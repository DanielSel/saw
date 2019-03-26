package net.dsos.sawclient

import android.app.*
import android.content.Intent
import android.graphics.BitmapFactory
import android.os.IBinder
import android.os.Build
import android.util.Log
import java.util.*
import kotlin.concurrent.schedule


class PopService : Service() {

    companion object {
        const val ACTION_START_FOREGROUND_SERVICE = "ACTION_START_FOREGROUND_SERVICE"
        const val ACTION_STOP_FOREGROUND_SERVICE = "ACTION_STOP_FOREGROUND_SERVICE"
    }

    private val TAG_POP_SERVICE = "POP_SERVICE"
    private val sawClient: SawGrpcClient
    private var timer: Timer? = null

    init {
        sawClient = SawGrpcClient()
    }

    override fun onBind(intent: Intent?): IBinder? {
        return null;
    }

    override fun onStartCommand(intent: Intent, flags: Int, startId: Int): Int {
        val action = intent.action

        when (action) {
            ACTION_START_FOREGROUND_SERVICE -> {
                startForegroundService()
                startPopCycle()
            }
            ACTION_STOP_FOREGROUND_SERVICE -> {
                stopForegroundService()
                stopPopCycle()
            }
        }
        return super.onStartCommand(intent, flags, startId)
    }

    override fun onCreate() {
        super.onCreate()
    }

    private fun startForegroundService() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val pendingIntent: PendingIntent =
                Intent(this, MainActivity::class.java).let { notificationIntent ->
                    PendingIntent.getActivity(this, 0, notificationIntent, 0)
                }

            val CHANNEL_ID: String = "POP_SERVICE_CHANNEL"
            val notificationChannel = NotificationChannel(CHANNEL_ID,
                getString(R.string.pop_notification_channel_name),
                NotificationManager.IMPORTANCE_LOW);
            val notificationManager = getSystemService(NOTIFICATION_SERVICE) as NotificationManager
            notificationManager.createNotificationChannel(notificationChannel)


            val ONGOING_NOTIFICATION_ID: Int = ((Math.random() * (128 - 1)) + 1).toInt()
            val notification: Notification = Notification.Builder(this, CHANNEL_ID)
                .setContentTitle(getText(R.string.pop_notification_title))
                .setContentText(getText(R.string.pop_notification_message))
                .setSmallIcon(R.mipmap.ic_launcher)
                .setLargeIcon(
                    BitmapFactory.decodeResource(
                        resources,
                        R.mipmap.ic_launcher))
                .setContentIntent(pendingIntent)
                .setTicker(getText(R.string.pop_notification_ticker_text))
                .build()

            startForeground(ONGOING_NOTIFICATION_ID, notification)
        }
    }

    private fun stopForegroundService() {
        stopForeground(true)
        stopSelf()
    }

    private fun startPopCycle() {
        sawClient.newSession()


        timer = Timer("pop_cycle", true)
        timer!!.schedule(10000, 10000) {
            sawClient.sendPop()
        }
    }

    private fun stopPopCycle() {
        timer?.cancel()
    }
}
