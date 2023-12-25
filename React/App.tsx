import 'react-native-gesture-handler';
import { StyleSheet, Text, View, Button } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import 'react-native-get-random-values';
import Thread from './screens/Thread';
import Ingest from './screens/Ingest';

export type RootDrawerParamList = {
  Thread: { location: string };
  Ingest: { location: string };
};

const Drawer = createDrawerNavigator<RootDrawerParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Drawer.Navigator>
        <Drawer.Screen
          name="Ingest"
          component={Ingest}
          initialParams={{ location: "Mumbai" }}
          options={{
            title: "Ingest",
            drawerLabelStyle: { color: "blue", fontWeight: "bold"},
          }}
        />
        <Drawer.Screen
          name="Thread"
          component={Thread}
          initialParams={{ location: "Mumbai" }}
          options={({ route }) => ({
            title: route.params?.location || "Location",
          })}
        />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
