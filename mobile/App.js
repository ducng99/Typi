import { StatusBar } from 'expo-status-bar'
import React, { useEffect, useState } from 'react';
import { Image, Platform, StatusBar as ReactStatusBar, StyleSheet, View } from 'react-native';
import { Provider as PaperProvider, DefaultTheme } from "react-native-paper";
import Login from './src/Login'
import ChatApp from './src/ChatApp'
import axios from 'axios'
import * as SecureStore from 'expo-secure-store'

global.SStorage = {
    SetItem: async (key, value) => {
        await SecureStore.setItemAsync(key, value);
    },
    GetItem: async (key) => {
        return await SecureStore.getItemAsync(key);
    },
    DeleteItem: async (key) => {
        return await SecureStore.deleteItemAsync(key);
    }
}

global.SESSION_ID = 'TYPI_SESSION_ID';
global.SStorage.SetItem(global.SESSION_ID, '');

export default function App() {
    const [loggedIn, setLoggedIn] = useState(false);
    
    const CheckSession = () =>
    {
        global.SStorage.GetItem(global.SESSION_ID)
        .then(sessionID => {
            axios.post("https://chat-backend.ducng.dev/verifySession", {sessionID: sessionID})
            .then(res => {
                if (res.data.status)
                {
                    setLoggedIn(true);
                }
                else
                {
                    global.SStorage.DeleteItem(global.SESSION_ID);
                    setLoggedIn(false);
                }
            });
        });
    }
    
    useEffect(() => {
        CheckSession();
    }, []);
    
    return (
        <PaperProvider theme={DefaultTheme}>
            <StatusBar style='auto' />
            <View style={{paddingTop: Platform.OS == 'android' ? ReactStatusBar.currentHeight : 10}}>
            {
                !loggedIn ?
                // logged in
                (<View>
                    <View style={{alignItems: 'center', marginVertical: 10}}>
                        <Image source={require('./assets/typi-logo.png')} style={styles.logoImg}/>
                    </View>
                    <Login loginCheck={CheckSession}/>
                </View>) :
                // not logged in
                (<ChatApp loginCheck={CheckSession}/>)
            }
            </View>
        </PaperProvider>
    );
}

const styles = StyleSheet.create({
    logoImg: {
        width: 100,
        height: 100
    }
});