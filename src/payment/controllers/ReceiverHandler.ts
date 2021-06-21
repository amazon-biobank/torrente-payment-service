import sha256 from 'crypto-js/sha256';
import { CommitmentContent } from "../models/Commitment";

export class ReceiverHandler {
    loadedPayerPublicKey: string;
    payerIp: string;
    commitment: CommitmentContent;
    lastHash: string;
    lastHashIndex: number;
    lastHashRedeemed: string;
    lastHashRedeemedIndex: number;

    public constructor(
        payerIp: string, 
        payerPublicKey: string,
        commitment: CommitmentContent
        ){
        this.loadedPayerPublicKey = payerPublicKey;
        this.commitment = commitment;
        this.payerIp = payerIp;
        this.lastHash = commitment.hashRoot;
        this.lastHashIndex = 0;
    }

    public loadState = (
        lastHashReceived: string, 
        lastHashReceivedIndex: number, 
        lastHashRedeemed: string, 
        lastHashRedeemedIndex: number) => {
            this.lastHash = lastHashReceived;
            this.lastHashIndex = lastHashReceivedIndex,
            this.lastHashRedeemed = lastHashRedeemed,
            this.lastHashRedeemedIndex = lastHashRedeemedIndex
        }

    public verifyPayment (hashLink: string, hashLinkIndex: number) {
        var newHash = hashLink;
        for (let index = 0; index < hashLinkIndex - this.lastHashIndex; index++) {
            newHash = sha256(newHash).toString();
        }
        if (newHash === this.lastHash) {
            this.lastHash = hashLink;
            this.lastHashIndex = hashLinkIndex;
            return true;
        }
        else {
            return false;
        }

    }
}