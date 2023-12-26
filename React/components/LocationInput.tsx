import React, { useEffect, useRef, useState } from 'react';
import { Alert, Modal, StyleSheet, Text, Pressable, View, TextInput, TouchableWithoutFeedback } from 'react-native';
import type { DrawerScreenProps } from '@react-navigation/drawer';
import { RootDrawerParamList } from '../App';
import { useIsFocused } from '@react-navigation/native';

type Props = DrawerScreenProps<RootDrawerParamList, 'LocationInput'>;

const LocationInput: React.FC<Props> = ({ route, navigation }) => {
    const isFocused = useIsFocused();
    const [text, setText] = useState('');
    const process = useRef(route.params.process);

    const onSubmit = () => {
        if (process.current === 'query') {
            navigation.navigate("QueryThread", { location: text });
        }
        else if (process.current === 'ingest') {
            navigation.navigate("IngestThread", { location: text });
        }
    };

    useEffect(() => {
        if (isFocused){
            setText('');
        }
    }, [route, navigation, isFocused]);
    return (
        <View style={styles.centeredView}>
                <TouchableWithoutFeedback>
                    <View style={styles.centeredView}>
                        <View style={styles.modalView}>
                            <Text style={styles.modalText}>Enter your location</Text>
                            <TextInput
                                onChangeText={setText}
                                value={text}
                                placeholder="e.g., Mumbai"
                                placeholderTextColor="lightgray"
                                style={styles.textInput} // Added style for the TextInput
                            />

                            <View style={{ marginBottom: 40 }}></View>

                            <Pressable
                                style={[styles.button, styles.buttonClose, { transform: [{ scale: 1.2 }] }]}
                                onPress={onSubmit}
                            >
                                <Text style={styles.textStyle}>Submit</Text>
                            </Pressable>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
        </View>
    );
};

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: "25%",
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    button: {
        borderRadius: 20,
        padding: 10,
        elevation: 2,
    },
    buttonOpen: {
        backgroundColor: '#F194FF',
    },
    buttonClose: {
        backgroundColor: '#2196F3',
    },
    textStyle: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    modalText: {
        marginBottom: 15,
        textAlign: 'center',
        fontWeight: 'bold',
    },
    textInput: {
        height: 50, // Adjust the height as per your requirement
        width: '100%',
        marginTop: 5,
        marginBottom: 5,
        padding: 5,
    },
});

export default LocationInput;