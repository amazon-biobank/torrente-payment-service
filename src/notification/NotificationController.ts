import express from 'express';
import http from 'http';
import WebSocket from 'ws';
import { ConnectionNotification } from './models/ConnectionNotification';
import { PaymentNotification } from './models/PaymentNotification';

export class NotificationController {
    torrenteConnection: WebSocket;

    public getConnection(){
        console.log(this.torrenteConnection);
        return this.torrenteConnection;
    }

    openConnection(){ 
        const app = express();
        const server = http.createServer(app);
        const wss = new WebSocket.Server({ clientTracking: true, server});
        
        return new Promise((resolve, reject) => {
            try{
                server.listen(7933, () => {
                    console.log("Notification port open on: 7933");
                });
                wss.on('connection', (ws: WebSocket) => {
                    this.torrenteConnection = ws;
                    console.log("connected to Torrente")

                    ws.on("close", ()=>{
                        console.log("disconnected from Torrente");
                    });

                    this.notifyConnection();
                });

                resolve("success");
               
            }
            catch(e) {
                console.log('Error:', e);
                reject("failed")
            }
        });
    }

    notifyConnection() {
        const notificationObject = new ConnectionNotification({
            status: "connected"
        });

        const jsonNotification = JSON.stringify(notificationObject.getNotificationObject())             
        this.torrenteConnection.send(jsonNotification)
    }

    notifyPayment(ip: string, torrentId: string){
        const notificationObject = new PaymentNotification({
            UserIp: ip,
            torrentId: torrentId
        });

        const jsonNotification = JSON.stringify(notificationObject.getNotificationObject())             
        this.torrenteConnection.send(jsonNotification)
    }

}

