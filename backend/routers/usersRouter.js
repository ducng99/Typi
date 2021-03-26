import express from 'express'
import SessionsHandler from '../handlers/SessionsHandler'
import UsersHandler from "../handlers/UsersHandler"

const COOKIE_SESSION_ID = "Typi_Session_ID";
const router = express.Router();

router.get("/get", function (req, res)
{
    SessionsHandler.GetSession(req.cookies[COOKIE_SESSION_ID], data =>
    {
        res.send({ status: data.status, user: data.user });
    });
});

router.get("/getFriends", function (req, res)
{
    SessionsHandler.GetSession(req.cookies[COOKIE_SESSION_ID], data =>
    {
        if (data.status)
        {
            UsersHandler.GetFriends(data.user.UserID, data2 =>
            {
                if (data2.status)
                {
                    res.send({ status: true, friends: data2.friends });
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

router.post("/addFriend", function (req, res)
{
    SessionsHandler.GetSession(req.cookies[COOKIE_SESSION_ID], data =>
    {
        if (data.status)
        {
            UsersHandler.AddFriend(data.user.UserID, req.body.targetUsername, data2 =>
            {
                res.send({ status: data2.status, msg: data2.msg });
            });
        }
        else
        {
            res.send({ status: false, msg: "Unable to verify your session." });
        }
    });
});

router.post("/updateRelationship", function (req, res)
{
    SessionsHandler.GetSession(req.cookies[COOKIE_SESSION_ID], data =>
    {
        if (data.status)
        {
            UsersHandler.UpdateRelationship(data.user.UserID, req.body.targetUserID, req.body.relationship, data2 =>
            {
                res.send({ status: data2.status });
            });
        }
        else
        {
            res.send({ status: false });
        }
    })
});

export default router;