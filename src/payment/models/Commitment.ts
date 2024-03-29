import crypto from 'crypto';
import sha256 from 'crypto-js/sha256';
import { CommitmentMessage, CommitmentContent } from '../../p2p/models/CommitmentMessage';
import { getAddress } from '../utils/userAddress';


export const ALGORITHM = "SHA256";
export const SIGNATURE_ALGORITHM = "ECDSA";
export const HASHING_ALG_NAME = "SHA-256";
export const SIGNATURE_FORMAT = "hex";

export class Commitment {
    commitmentMessage: CommitmentMessage;

    public loadCommitment = (commitmentMessage: CommitmentMessage) => {
        this.commitmentMessage = commitmentMessage;
    }

    public initCommitment = (
        magneticLink: string, 
        receiverCertificate: string,
        hashRoot: string, 
        userPrivateKey: string,
        userCertificate: string,
        downloadIntentionId: string
    ) => {
        const sign = crypto.createSign(ALGORITHM);

        const commitmentContent: CommitmentContent = {
            data_id: magneticLink,
            payer_address: getAddress(userCertificate),
            receiver_address: getAddress(receiverCertificate),
            hash_root: hashRoot,
            payment_intention_id: downloadIntentionId
        };

        const commitmentContentString = JSON.stringify(commitmentContent)
        
        sign.update(commitmentContentString);
        const contentSignature = sign.sign(userPrivateKey, SIGNATURE_FORMAT);
        this.commitmentMessage = {
            data: commitmentContent,
            commitment_hash: sha256(commitmentContentString).toString(),
            hashing_alg: HASHING_ALG_NAME,
            signature_alg: SIGNATURE_ALGORITHM,
            signature: contentSignature
        };
    }

    public getReceiver() {
        return this.commitmentMessage.data.receiver_address;
    }

    public getTorrent() {
        return this.commitmentMessage.data.data_id;
    }

    public getPayer() {
        return this.commitmentMessage.data.payer_address;
    }

    public static validateSignature(commitmentToValidate: CommitmentMessage, certificate: string): boolean{
        const verify = crypto.createVerify(ALGORITHM);
        const bufferCommitment = Buffer.from(JSON.stringify(commitmentToValidate.data));
        
        verify.update(bufferCommitment)
        
        const verification = verify.verify(certificate, commitmentToValidate.signature, SIGNATURE_FORMAT);

        return verification;
    }
}