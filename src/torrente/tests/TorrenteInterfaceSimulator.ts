import WebSocket from 'ws';
import { TORRENTE_NOTIFICATION_PORT } from '../../config';
import { UserIdentification } from '../../payment/models/UserIdentification';
import { IAuthenticationMessageData } from '../messages/models/AuthenticationMessage';
import { IClosingMessageData } from '../messages/models/ClosingMessage';
import { IDownloadedBlockMessageData } from '../messages/models/DownloadedBlockMessage';
import { IDownloadIntentionMessageData } from '../messages/models/DownloadIntentionMessage';
import { ILogoutMessageData } from '../messages/models/LogoutMessage';
import { IMessagesModel, MessagesTypesEnum } from '../messages/models/MessageModel';
import { IRedeemValuesMessageData } from '../messages/models/RedeemValuesMessage';
import { IRefreshWalletMessageData } from '../messages/models/RefreshWalletMessage';

export class TorrenteInterfaceSimulator {
    torrenteSocket: WebSocket

    private endResolver: (value?: unknown) => void = () => {};

    public constructor() { 
        this.initConnection();
        this.torrenteSocket.onopen = this.onOpen;
        this.torrenteSocket.onmessage = this.onMessage;
        this.torrenteSocket.onclose = this.onClose;
        this.torrenteSocket.onerror = this.onError;
    }

    private initConnection = () => {
        this.torrenteSocket = new WebSocket(`ws://127.0.0.1:${TORRENTE_NOTIFICATION_PORT}`);
    }

    public close = () => {
        const closeMessage: IMessagesModel<IClosingMessageData> = {
            data: {
                message: "closing"
            },
            type: MessagesTypesEnum.Closing
        }
        const closeString = JSON.stringify(closeMessage)
        this.torrenteSocket.send(closeString);
    }

    public logout = () => {
        const logoutMessage: IMessagesModel<ILogoutMessageData> = {
            data: {
                message: "Logging out"
            },
            type: MessagesTypesEnum.Logout
        }
        const logoutString = JSON.stringify(logoutMessage)
        this.torrenteSocket.send(logoutString)
    }

    public redeem = () => {
        const redeemMessage: IMessagesModel<IRedeemValuesMessageData> = {
            data: {
                message: "Redeem"
            },
            type: MessagesTypesEnum.RedeemValues
        }
        const redeemString = JSON.stringify(redeemMessage);
        this.torrenteSocket.send(redeemString)
    }

    public downloadIntention = (downloadData: IDownloadIntentionMessageData) => {
        const downloadIntentionMessage: IMessagesModel<IDownloadIntentionMessageData> = {
            data: downloadData,
            type: MessagesTypesEnum.DownloadIntention
        }
        const downloadIntentionString = JSON.stringify(downloadIntentionMessage);
        this.torrenteSocket.send(downloadIntentionString)
    }

    public refreshWallet = () => {
        const refreshWalletMessage: IMessagesModel<IRefreshWalletMessageData> = {
            data: {
                message: "Refresh wallet"
            },
            type: MessagesTypesEnum.RefreshWallet
        }
        const refreshWalletString = JSON.stringify(refreshWalletMessage)
        this.torrenteSocket.send(refreshWalletString)
    }

    public authenticate = (credentials: IAuthenticationMessageData) => {
        const authData: IMessagesModel<IAuthenticationMessageData> = {
            data: {
                encrypted_content: credentials.encrypted_content,
                password: credentials.password,
                salt: credentials.salt
            },
            type: MessagesTypesEnum.Authentication
        }
        const authString = JSON.stringify(authData)
        this.torrenteSocket.send(authString);
    }

    public downloadBlock = (uploaderIp: string, magneticLink: string, fileSize: number) => {
        const downloadBlockData: IMessagesModel<IDownloadedBlockMessageData> = {
            data: {
                fileSize: fileSize,
                magneticLink: magneticLink,
                uploaderIp: uploaderIp
            },
            type: MessagesTypesEnum.DownloadedBlock
        }
        const downloadBlockString = JSON.stringify(downloadBlockData);
        this.torrenteSocket.send(downloadBlockString)
    }

    private onOpen = (event) => {
        console.log("[INFO] Connected to Payfluxo");
    }

    private onMessage = (event: WebSocket.MessageEvent) => {
        console.log(event.data)
    }

    private onClose = (event) => {
        console.log("Disconnected from Payfluxo")
        this.torrenteSocket.close();
        this.endResolver();
    }

    private onError = (event) => {
        console.log(event)
    }

    public waitUntilClose = async (): Promise<void> => {
        if (!this.torrenteSocket){
            return new Promise((resolve, _reject) => {
                resolve(null);
            })
        }
        else{
            const endPromise = new Promise((resolve: (value: void) => void, _reject) => {
                this.endResolver = resolve;
            })
            return endPromise;
        }
    }

    public waitUntilOpen = async(): Promise<void> => {
        if (this.torrenteSocket.readyState === WebSocket.OPEN){
            return new Promise((resolve, _reject) => {
                resolve(null);
            })
        }
        else{
            const conPromise = new Promise((resolve: (value: void) => void, _reject) => {
                this.torrenteSocket.on("open", () => {
                    return new Promise((_resolve, _reject) => {
                        resolve(null);
                    })
                })
            })
            return conPromise;
        }
    }
}

