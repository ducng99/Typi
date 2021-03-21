import React from 'react'
import axios from 'axios'
import { Alert, Text, View } from "react-native";
import User from './helpers/User'

export default function ChatApp(props) {
    const [currentUser, setCurrentUser] = React.useState(new User());
    
    React.useEffect(() => {
        global.SStorage.GetItem(global.SESSION_ID)
        .then(sessionID => {
            axios.post("https://chat-backend.ducng.dev/users/get", {sessionID: sessionID})
            .then(res => {
                if (res.data.status)
                {
                    setCurrentUser(new User(res.data.user));
                }
                else
                {
                    props.loginCheck();
                }
            });
        });
    }, []);
    
    return (
        <View>
            <Text>Hi {currentUser.GetUsername()}</Text>
        </View>
    );
}