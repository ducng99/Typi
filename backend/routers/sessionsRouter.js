import express from 'express'
import SessionsHandler from '../sessions'

const COOKIE_SESSION_ID = "Typi_Session_ID";
const router = express.Router();

router.get("/verifySession", function (req, res)
{
    SessionsHandler.GetSession(req.cookies[COOKIE_SESSION_ID], data =>
    {
        res.send({ status: data.status });
    });
});

router.get("/keepAlive", function (req, res)
{
    SessionsHandler.KeepAlive(req.cookies[COOKIE_SESSION_ID], data =>
    {
        res.send({ status: data.status });
    });
});

export default router;