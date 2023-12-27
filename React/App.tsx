import 'react-native-gesture-handler';
import { StyleSheet, Text, View, Button } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import 'react-native-get-random-values';
import LocationInput from './components/LocationInput';
import Thread from './screens/Thread';
import Ingest from './screens/Ingest';
import Feedback from './screens/Feedback';

export type RootDrawerParamList = {
  Thread: { location: string };
  Ingest: { location: string };
  Feedback: undefined;
  LocationInput: { process: 'ingest' | 'query' };
};

const Drawer = createDrawerNavigator<RootDrawerParamList>();
const Stack = createStackNavigator();

function IngestStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="LocationIngest"
        component={LocationInput}
        options={{headerShown: false}}
        initialParams={{ process: "ingest" }}
      />
      <Stack.Screen
        name="IngestThread"
        component={Ingest} 
        options={
          ({route}: { route: { params?: { location?: string } } }) => ({
            title: route.params?.location,
            headerBackTitleVisible: false,
          })
        }
      />
    </Stack.Navigator>
  );
}

function QueryStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="LocationQuery"
        component={LocationInput}
        options={{headerShown: false}}
        initialParams={{ process: "query" }}
      />
      <Stack.Screen
          name="QueryThread"
          component={Thread}
          options={
            ({route}: { route: { params?: { location?: string } } }) => ({
              title: route.params?.location,
              headerBackTitleVisible: false,
            })
          }
      />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Drawer.Navigator>
        <Drawer.Screen
          name="Ingest"
          component={IngestStack}
          options={{
            title: "Ingest",
          }}
        />
        <Drawer.Screen
          name="Thread"
          component={QueryStack}
          options={{
            title: "Query",
          }}
        />
      <Drawer.Screen
        name="Feedback"
        component={Feedback}
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
