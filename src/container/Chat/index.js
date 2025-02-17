import React, {Fragment, useLayoutEffect} from 'react';
import {View, Text, SafeAreaView, FlatList, KeyboardAvoidingView, TouchableWithoutFeedback, Platform, Keyboard, Alert} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import styles from './styles'
import { appStyle, color, globalStyle } from '../../utility';
import { ChatBox, ChatInput } from '../../component';
import { useState } from 'react';
import { useEffect } from 'react';
import firebase from '../../firebase/config';
import { launchImageLibrary } from 'react-native-image-picker';
import { recieverMsg, senderMsg, showNotification } from '../../network';
import { deviceHeight } from '../../utility/styleHelper/appStyle';
import { smallDeviceHeight } from '../../utility/constants';


const Chat = ({route, navigation}) => {
    const {params} = route;
    const {name, img, imgText, guestUserId, currentUserId} = params;
    const [msgValue, setMsgValue] = useState('');
    const [messages, setMessages] = useState([]);
    useLayoutEffect(()=>{
        navigation.setOptions({
            headerTitle: <Text>{name}</Text>,
        })
    }, [navigation]);


    


    useEffect(()=>{
        try{
            firebase.database()
            .ref('messages')
            .child(currentUserId)
            .child(guestUserId)
            .on('value', (dataSnapshot)=>{
                let msgs = [];

                dataSnapshot.forEach((child)=>{
                    console.log(child)
                    msgs.push({
                        sendBy: child.val().message.sender,
                        recievedBy: child.val().message.reciever,
                        msg: child.val().message.msg,
                        img : child.val().message.img,
                    });
                    
                });
                setMessages(msgs.reverse());
                
            });
        }catch (error){
            alert(error)
        }
    },[]);

    const handleSend = () => {
        setMsgValue('');
        if(msgValue){
            senderMsg(msgValue, currentUserId, guestUserId, '')
            .then(()=>{
                showNotification('New Message', msgValue);
            })
            .catch((err)=>alert(err));


            recieverMsg(msgValue, currentUserId, guestUserId, '')
            .then(()=>{
                showNotification('New Message', msgValue);
            })
            .catch((err)=>alert(err));
        }

        
    }



    const handleCamera = ()=>{
        launchImageLibrary(option, (response)=>{
            console.log("Response = ", response);
        if(response.didCancel){
            console.log('User cancelled image picker')
          }else if(response.error){
            console.log('image picker error', response.error)
          }
          else{
            let source = 'data:image/jpeg;base64,'+response.data;
            senderMsg(msgValue, currentUserId, guestUserId,source)
            .then(()=>{})
            .catch((err)=>alert(err));


            recieverMsg(msgValue, currentUserId, guestUserId, source)
            .then(()=>{})
            .catch((err)=>alert(err));
    }
});
}

    const handleOnChange = (text) => {
        setMsgValue(text);
      };

    const imgTap = (chatImg) => {
        navigation.navigate("ShowFullImg", { name, img: chatImg });
      };

    return (
        <SafeAreaView style={[globalStyle.flex1, {backgroundColor: color.WHITE}]}>
            <KeyboardAvoidingView keyboardVerticalOffset={deviceHeight >smallDeviceHeight ?100
            :70}
            behavior={Platform.OS ==='ios'?'padding' : 'height'}
            style={[globalStyle.flex1, {backgroundColor: '#FAFAFA'}]}
            >
                <TouchableWithoutFeedback style={[globalStyle.flex1]} onPress={Keyboard.dismiss}>
                    <Fragment>

                    
            
            <FlatList
                inverted
                data={messages}
                keyExtractor={(_, index) => index.toString()}
                renderItem={({item})=>(
                <ChatBox
                msg={item.msg}
                userId={item.sendBy}
                img={item.img}
                onImgTap={()=>imgTap(item.img)}
                
                />
                )}
            />

            {/*Send Message*/}

                <View style={styles.sendMessageContainer}>
                <MaterialCommunityIcons
                        name="camera"
                        color={color.DARK_GRAY}
                        size={35}
                        onPress={()=> handleCamera()}
                        />
                    <ChatInput
                    placeholder="Type Here . . ."
                    numberOfLines={10}
                    InputField={styles.input}
                    value={msgValue}
                    onChangeText={(text)=>handleOnChange(text)}
                    />
                    <MaterialCommunityIcons
                        name="send-circle"
                        color={color.DARK_GRAY}
                        size={appStyle.fieldHeight}
                        onPress={()=>{
                            
                            handleSend()
                            Alert.alert('Counter ='+ counter)
                        }}
                        />
                </View>
                </Fragment>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default Chat;