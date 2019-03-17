package net.dsos.sawclient

import io.grpc.ManagedChannelBuilder
import net.dsos.sawclient.SawPopGrpc.SawPopBlockingStub
import net.dsos.sawclient.SawPopOuterClass.SessionIdRequest
import org.kethereum.bip32.model.ExtendedKey
import org.kethereum.bip39.dirtyPhraseToMnemonicWords
import org.kethereum.bip39.toKey

import android.util.Log
import org.kethereum.crypto.*
import org.kethereum.keccakshortcut.keccak

val DEFAULT_MNEMONIC = "bulb ask truly venue battle plunge sad ostrich fan piano battle notable"
class SawGrpcClient(mnemonic: String = DEFAULT_MNEMONIC) {


    private val popClient: SawPopBlockingStub
    private val accountEKey: ExtendedKey

    private var sessionId: Long? = null
    private var prevPopTime: Long? = null
    private var accTime: Long? = null

    init {

        popClient = SawPopGrpc.newBlockingStub(ManagedChannelBuilder
            .forAddress("172.16.0.1", 6666)
            .usePlaintext(true)
            .build())

        val mnemonicWords = dirtyPhraseToMnemonicWords(mnemonic)
        accountEKey = mnemonicWords.toKey("m/44'/60'/0'/0/0");
    }

    fun test() {
        // Call this every 10s
        Log.d("SawGrpcClient", "Called at: " + System.currentTimeMillis())
    }

    fun newSession() {
        val request = SessionIdRequest.newBuilder()
            .setEthAddress(getAddress())
            .setSignature(getSignedAddress())
            .build()

        prevPopTime = System.currentTimeMillis()
        accTime = 0
        sessionId = popClient.newSession(request).sessionHash
    }

    fun sendPop() {
        if (sessionId == null || prevPopTime == null) {
            throw Exception("Trying to send POP without active Session. Request newSession() first.")
        }

        val now = System.currentTimeMillis()
        accTime = accTime!! + now - prevPopTime!!
        prevPopTime = now

        val signature = signMessage(sessionId!! + accTime!!)
        val request = SawPopOuterClass.Pop.newBuilder()
            .setSessionHash(sessionId!!)
            .setAccTime(accTime!!.toInt())
            .setSignature(signature)
            .build()

        val status = popClient.submitPop(request)
    }

    private fun getAddress(): String {
        return accountEKey.keyPair.toAddress().toString()
    }

    private fun getSignedAddress(): String {
        val address = getAddress()
        return signMessage(address)
    }

    private fun signMessage(number: Long): String {
        var hexString = java.lang.Long.toHexString(number)

        // Pad the hex string until required size (16)
        hexString = "0".repeat(16 - hexString.length) + hexString
        hexString = "0x$hexString"

        return signMessage(hexString)
    }

    private fun signMessage(hexString: String): String {
        return "0x" + signMessageHash(hexString.keccak(), accountEKey.keyPair, false).toHex()
    }

}