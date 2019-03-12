package net.dsos.sawclient

import android.app.*
import android.content.Intent
import android.graphics.BitmapFactory
import android.os.IBinder
import android.os.Build



class PopService : Service() {

    override fun onBind(intent: Intent?): IBinder? {
        return null;
    }

    override fun onCreate() {
        super.onCreate()

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

    public fun startPopCycle() {

    }

    public fun stopPopCycle() {

    }

    private fun sendPop() {

    }
}