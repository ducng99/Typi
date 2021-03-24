import express from 'express'
import SessionsHandler from '../handlers/SessionsHandler'
import UsersHandler from "../handlers/UsersHandler"

const COOKIE_SESSION_ID = "Typi_Session_ID";
const router = express.Router();

router.post("/getMessages", function (req, res)
{
    SessionsHandler.GetSession(req.cookies[COOKIE_SESSION_ID], data =>
    {
        if (data.status)
        {
            UsersHandler.GetMessages(data.user.UserID, req.body.receiverID, data2 =>
            {
                if (data2.status)
                {
                    res.send({ status: true, messages: data2.messages });
                }
                else
                {
                    res.send({ status: false });
                }
            });
        }
        else
        {
            res.send({ status: false });
        }
    });
});

router.post("/sendMessage", function (req, res)
{
    SessionsHandler.GetSession(req.cookies[COOKIE_SESSION_ID], data =>
    {
        if (data.status)
        {
            UsersHandler.SendMessage(data.user.UserID, req.body.receiverID, req.body.encryptedMsg, data2 =>
            {
                res.send({ status: data2.status });
            });
        }
        else
        {
            res.send({ status: false });
        }
    });
});

export default router;