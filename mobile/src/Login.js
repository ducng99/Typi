import React from 'react';
import { View, StyleSheet, Text, Alert } from 'react-native';
import { Button, TextInput } from 'react-native-paper';
import axios from 'axios'

export default function Login(props) {
    const [login_username, setUsername] = React.useState('');
    const [login_password, setPassword] = React.useState('');
    const [responseContent, setResponse] = React.useState('');
    const [showResponse, setShowResponse] = React.useState(false);
    const [loggingIn, setIsLoggingIn] = React.useState(false);
    
    const OnLogin = () =>
    {
        setIsLoggingIn(true);
        
        axios.post("https://chat-backend.ducng.dev/login", {username: login_username, password: login_password})
        .then(res => {
            if (res.data.status)
            {
                global.SESSION_ID = res.data.sessionID;
                props.loginCheck();
            }
            else
            {
                setShowResponse(true);
                setResponse(res.data.msg);
            }
            
            setIsLoggingIn(false);
        });
    };
    
    return (
        <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Login</Text>
            <Text style={[{display: showResponse ? 'flex' : 'none'}, styles.responseText]}>{responseContent}</Text>
            <TextInput label="Username" style={{marginBottom: 5}} onChangeText={username => setUsername(username)}></TextInput>
            <TextInput secureTextEntry={true} label="Password" onChangeText={password => setPassword(password)}></TextInput>
            <Button mode="contained" style={{marginTop: 10}} contentStyle={{height: 50}} onPress={OnLogin} loading={loggingIn}>Login</Button>
        </View>
    );
}

const styles = StyleSheet.create({
    loginContainer: {
        margin: 10,
    },
    loginText: {
        fontSize: 24,
        marginBottom: 20,
        marginTop: 50,
        textAlign: 'center'
    },
    responseText: {
        color: 'red',
        paddingBottom: 10
    }
});