import assert from "assert";
import { PayfluxoServer } from "../../p2p/connections/PayfluxoServer";
import { ConnectionController } from "../../torrente/ConnectionController";
import { IAuthenticationMessageData } from "../../torrente/messages/models/AuthenticationMessage";
import { IDownloadIntentionMessageData } from "../../torrente/messages/models/DownloadIntentionMessage";
import { IntentionDeclaredNotification } from "../../torrente/notification/models/IntentionDeclaredNotification";
import { DownloadDeclarationIntentionStatusEnum } from "../../torrente/notification/NotificationHandler";
import { TorrenteInterfaceSimulator } from "../../torrente/tests/TorrenteInterfaceSimulator";
import { SessionController } from "../controllers/SessionController";
import { payfluxoMessagesHandler } from "../handlers/TorrenteMessagesHandler";


jest.setTimeout(40000);

describe("test DownloadDeclarationIntentionProtocol class", () => {
    var con = new ConnectionController;

    con.openConnection(payfluxoMessagesHandler)

    const identificationExample: IAuthenticationMessageData = {
        encrypted_content: "CfKPGdsqNPVzPp5/1G1y1Z+LAnzkiDAZwa5fE1BVZYnlKlSbsSXJTCj1Vmo1ybFLnO5YCog+rQMde/qvdfM19FNZ7WWqWyFxYQx6OFJSfekntqZJRWYn/EBuJW6ynkRqc8mF4oaL+RfM7BAyKwZriQqoOppD9sKQyOkcsWfsQ+8A00+OhWwJqaiHWSc3QkS0YvnB5+8XtSVzkcP9X0WPMlCkpiRSftru5Wp69uJ/7KG3WMviSPYIykcpwk+Q6xu2R7l28Cr4TI1TNNZgb58lasGSOdAng0ZS1gxyrqvZoQ++UI1y1LeJbi5nZlDEGo/ZiVG3j+e3gc53OlB4VwzSs7F9iP7l+DSFFUOXeqfT9Ds3L4dZOEteY+HXPsQbFfMK7ua41cj7dCTiD29T6usp+hWWpoNKz06fF58OIToRiCWdCczRgLpo1NF6vtfmoGXuYMVzvL3tLPrelnSfwcdjYO26mkwJFfyROKmh0e4buk8qNWA+Ej6QOAuhfs8sefUGbsPw2RBsDyPaK0u4FBCDbsbM/opQXW4w9dqc+DK21r7cszEMiGCrh204DLDrpOiY6JkRtLOzAb1Tk7JVDOVnqNcd9jrSOYLPWxHzEF4SfbalkQ2Z2t27c31Gnnvz0XboTkqemng5UVuVNYKMCbe6HcAvTV8jbhYPwKqbh59gkHO8IX0JLP0T/kH17sffcZg3ri3i+P8hSzyzH4LmMYxiWYBTn4S1GrHeizu9i/Pur21kjw+rdw/5v3F45gbOvniLqpbPNFflbqRwdGimk6LALJdsB5YkJkSKdxTLEhNH/w0qiafd+YQOkWO2XdTmWABR5wEFYJhu4q/MPXkmaNzLmWBPLvTcw6MPuGjO4Oekql3g2PCpxvOu04YMHIB76Y2LFX+pEth4nFuMr+dTkQbX4BFgIVoSGtrh/5wJqvWoRCFnHKqmRRjo6QT28STt6iacN4jPkYEq69f5Ag6XxU60jA2EgBifmdtEhWUNg6m9vszaWAsLXEFFbky23jN8kGwnWNFYzzZJ0TnozukJ/XcY/OusRjbeFTZCf1tvUrEoDkwosK/PpVbtG/vEpLmhNLP3/b5O/qGjyQdItG0cF1vEKr3SM9OGeS/dvHqpcu+F5I7Ja9okBYRWKyn2jHy9h5EW+GeyatxfeMpjbZqU+VHCKfMl9jm8gO++Ncon1uoW1CECCZF75i+RUmgWi8pwMbZmwODsVAotSrvMzyy8QtVtGa+oSvNCvt7PMu7kjuLqaLUBO3PklnOvtRRfx4piCg68dljgjz4/0J7b2MAHHoi5Iahzg3K5ThE57C/2ugAxA1DU2EWw6DdjadmbNQhr5RnNYdS9wZ6NMGsbLE1Ju6zrH82Hg3fq0jRjmjrCshlz7dwt5mksBAxjsloGzcwlfzAGAvDoO+f+XjXHFpdJFd73S3Gla6Zx0AjdtPbtpFON5ND21ed70wa4GOd+AW48y6nbPqRcOryFIWSzgNYaEFDtJhCH34ZNRbx4paK9lfJKE4DSkqQrCPQO8v/1HCFZENpAyoTn1Df0EOU4LqyQ6gOsCoh+hVqaIATDIQhe2fpecVFVbrhke3JEowr3wjfBFuTQzTwJ34phqQ4Df8oXc7JrMRdG/M9nVxT7p+O1FxlhiOCQIiA=",
        password: "teste",
        salt: "peJ0Sp76flRHS31H87dxEg=="
    }

    const downloadDataExample: IDownloadIntentionMessageData = {
        magneticLink: "TestmagneticLink",
        piecesNumber: 2,
        torrentId: "TorrentTestId"
    }

    var torrenteSimulator: TorrenteInterfaceSimulator;

    beforeEach(async (done) => {
        torrenteSimulator = new TorrenteInterfaceSimulator()
        await ConnectionController.waitUntillConnection();
        await torrenteSimulator.waitUntilOpen();
        done();
    })

    afterEach(async (done) => {
        torrenteSimulator.logout();
        torrenteSimulator.torrenteSocket.close();
        await torrenteSimulator.waitUntilClose();
        await SessionController.waitTillClosed();
        await PayfluxoServer.waitTillClosed();
        await ConnectionController.waitUntillDisconnection();
        done();
    })
    
    it("should test download declaration intention protocol.", async (done) => {
        torrenteSimulator.authenticate(identificationExample);
        await SessionController.waitTillInitialized();

        const sessionController = SessionController.getInstance();
        await sessionController.paymentService.waitTillInitialized();

        torrenteSimulator.downloadIntention(downloadDataExample);
        var endTest: (value?: unknown) => void;
        const testPromise = new Promise((resolve, _reject) => {endTest = resolve});
        const testPostNotification = async (message) => {
            const notificationObject: IntentionDeclaredNotification = JSON.parse(message.toString());
            assert(notificationObject.data.status === DownloadDeclarationIntentionStatusEnum.SUCCESS);
            const ddMap = sessionController.downloadDeclarationIntentions;
            assert(Object.values(ddMap).length != 0)
            const intentionPromises = Object.values(ddMap).map(async (ddid) => {
                const paymentIntention = await sessionController.paymentService.invokeReadPaymentIntention(ddid)
                console.log(paymentIntention);
            });
            await Promise.all(intentionPromises);
            endTest();
        }
        torrenteSimulator.torrenteSocket.on("message", testPostNotification)
        await testPromise;
        done();
    });
});

