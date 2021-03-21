import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Provider as PaperProvider, DefaultTheme } from "react-native-paper";
import Login from './src/Login'
import ChatApp from './src/ChatApp'
import axios from 'axios'

global.SESSION_ID = ''

const theme = {
    ...DefaultTheme,
};

export default function App() {
    const [loggedIn, setLoggedIn] = useState(false);
    
    const CheckSession = () =>
    {
        if (global.SESSION_ID)
        {
            axios.post("https://chat-backend.ducng.dev/verifySession", {sessionID: global.SESSION_ID})
            .then(res => {
                if (res.data.status)
                {
                    setLoggedIn(true);
                }
                else
                {
                    global.SESSION_ID = '';
                }
            });
        }
    }
    
    return (
        <PaperProvider theme={theme}>
            <StatusBar style='auto' />
            { !loggedIn ? <Login loginCheck={CheckSession}></Login> : <ChatApp/> }
        </PaperProvider>
    );
}