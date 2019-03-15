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

val DEFAULT_MNEMONIC = ""
class SawGrpcClient(mnemonic: String = DEFAULT_MNEMONIC) {


    private val popClient: SawPopBlockingStub;
    private val accountEKey: ExtendedKey;
    private lateinit var sessionId: String;

    init {

        popClient = SawPopGrpc.newBlockingStub(ManagedChannelBuilder
            .forAddress("172.16.0.1", 6666)
            .usePlaintext(true)
            .build())

        val mnemonicWords = dirtyPhraseToMnemonicWords(mnemonic)
        accountEKey = mnemonicWords.toKey("m/44'/60'/0'/0/0");
    }

    fun newSession() {
    }

    fun sendPop() {

    }

    private fun getAddress(): String {
        return accountEKey.keyPair.toAddress().toString()
    }

    private fun getSignedAddress(): String {
        val address = getAddress()
        return signMessage(address)
    }

    private fun signMessage(number: Int): String {
        var hexString = Integer.toHexString(number)

        // Pad the hex string until required size (16)
        hexString = "0".repeat(16 - hexString.length) + hexString
        hexString = "0x$hexString"

        return signMessage(hexString)
    }

    private fun signMessage(hexString: String): String {
        return "0x" + signMessageHash(hexString.keccak(), accountEKey.keyPair, false).toHex()
    }

}