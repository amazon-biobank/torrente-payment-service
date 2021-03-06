import bodyParser from 'body-parser';
import express from 'express';
import http from 'http';
import { PAYFLUXO_LISTENING_PORT } from '../../config';
import { NotificationHandler } from '../../torrente/notification/NotificationHandler';
import { SessionController } from '../controllers/SessionController';
import { CommitmentMessage } from '../models/Commitment';
import { MicropaymentRequest } from '../models/MicropaymentRequest';

export const startPayfluxoServer = (privateKey: string, certificate: string, msp: string, notificationHandler: NotificationHandler): SessionController => {
    const app = express();
    const server = http.createServer(app);
    const sessionController = new SessionController(privateKey, certificate, msp, server);
    const jsonParser = bodyParser.json();

    app.use(jsonParser);

    server.listen( PAYFLUXO_LISTENING_PORT, () => {
        console.log(`[INFO] Payfluxo started on port: ${PAYFLUXO_LISTENING_PORT}`);
    }) 

    app.post('/pay', (req, res) => {
        //handle hash payment
        
        const micropaymentRequest: MicropaymentRequest = req.body;
        var requesterIp: string = req.ip;
        if (requesterIp.substr(0, 7) == "::ffff:") {
            requesterIp = requesterIp.substr(7)
        }
       
        console.log(`[INFO] ip ${requesterIp} accessed /pay endpoint`);

        const handleReturn = sessionController.handleReceive(micropaymentRequest, requesterIp);
        const response = handleReturn.payerResponse;
        res.status(response['status']).send(response['content']);
        if(response['status'] === 200)
        {
            if (handleReturn.torrenteNotification){
                notificationHandler.notifyPayment(handleReturn.torrenteNotification)
                console.log(`[INFO] ip ${requesterIp} payment is valid`);
            }
            else{
                console.log(`[INFO] Received out of order payment from ${requesterIp}`);
            }
        }
        else {
            console.log(`[ERROR] ip ${requesterIp} payment is invalid`)
        }
    })

    app.post('/commit', async (req, res) => {
        const commitmentMessage: CommitmentMessage = req.body;
        var requesterIp: string = req.ip;
        if (requesterIp.substr(0, 7) == "::ffff:") {
            requesterIp = requesterIp.substr(7)
        }

        console.log(`[INFO] ip ${requesterIp} accessed /commit endpoint`);

        const response = await sessionController.handleCommit(commitmentMessage, requesterIp);

        res.status(response['status']).send(response['content']);

        if(response['status'] === 200)
        {
            console.log(`[INFO] ip ${requesterIp} commitment is valid`);
        }
        else {
            console.log(`[ERROR] ip ${requesterIp} commitment is invalid`)
        }
    })

    app.get('/certificate', (req, res) => {
        const certificateResponse = {
            certificate: sessionController.loadedUserCertificate
        }
        res.send(certificateResponse);
    })

    app.get('/', (req, res) => {
        res.send("I'm listening");
    })

    return sessionController;
}