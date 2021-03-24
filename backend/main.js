import express from "express"
import cors from "cors"
import cookieParser from 'cookie-parser'

import SessionsHandler from './sessions'

import UsersRouter from './routers/usersRouter'
import SessionsRouter from './routers/sessionsRouter'
import ChatRouter from './routers/chatRouter'
import CredsRouter from './routers/credsRouter'

var app = express();
app.use(cors({
    origin: ["https://ducng.dev", "https://ducng.dev:2053", /\.ducng\.dev$/],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.listen(10000, () =>
{
    console.log("Started webchat backend on port 10000");
});

app.use("/users", UsersRouter);
app.use("/sessions", SessionsRouter);
app.use("/chat", ChatRouter);
app.use("/creds", CredsRouter);

setInterval(function ()
{
    SessionsHandler.ClearOldSessions();
}, 60000 * 10);

// ERROR HANDLING - START
//----------------------------------------------------------------------------------//
// Handle 404
app.use(function (req, res)
{
    res.status(404).send({ error: 404, msg: 'Page not Found' });
});
//-----------------------------------------------------------------------------------//
// ERROR HANDLING - END