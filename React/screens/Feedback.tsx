import React from 'react';
import { Linking } from 'react-native';
import { RootDrawerParamList } from '../App';
import { DrawerScreenProps } from '@react-navigation/drawer';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Props = DrawerScreenProps<RootDrawerParamList, 'Ingest'>;

const Feedback: React.FC<Props> = ({ route, navigation }) => {
    return (
        <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ textAlign: 'center', fontSize: 20 }}>
                Thanks for joining the Gem beta!
            </Text>
            <Text
                style={{ textAlign: 'center', fontSize: 20, color: 'blue' }}
                onPress={() => Linking.openURL('https://tally.so/r/nGlxl2')}
            >
                Feedback Form
            </Text>
        </SafeAreaView>
    );
};

export default Feedback;
