import express from 'express'
import SessionsHandler from '../handlers/SessionsHandler'
import PublicKeysHandler from "../handlers/PublicKeysHandler"

const COOKIE_SESSION_ID = "Typi_Session_ID";
const router = express.Router();

router.post("/getPublicKey", (req, res) =>
{
    SessionsHandler.GetSession(req.cookies[COOKIE_SESSION_ID], data =>
    {
        if (data.status)
        {
            PublicKeysHandler.GetPublicKey(data.user.UserID, req.body.receiverID, (data2) =>
            {
                if (data2.status)
                {
                    res.send(data2);    // { status, publicKey }
                }
                else
                {
                    res.send({status: false});
                }
            });
        }
        else
        {
            res.send({ status: false });
        }
    });
});

router.post("/updatePublicKey", (req, res) =>
{
    SessionsHandler.GetSession(req.cookies[COOKIE_SESSION_ID], data =>
    {
        if (data.status)
        {
            PublicKeysHandler.SetPublicKey(data.user.UserID, req.body.receiverID, req.body.publicKey, (data2) =>
            {
                res.send(data2);    // { status }
            });
        }
        else
        {
            res.send({status: false});
        }
    });
});

export default router;