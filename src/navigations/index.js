import {createAppContainer, createSwitchNavigator} from 'react-navigation';
import {createStackNavigator} from 'react-navigation-stack';
import { createBottomTabNavigator } from 'react-navigation-tabs';
import AudioRecorder from '../screens/audioRecoder'
import ApiList from '../screens/api'

const AuthNavigatorConfig = {
	initialRouteName: 'AudioRecorder',
	header: null,
	headerMode: 'none',
};

const RouteConfigs = {
	AudioRecorder,
	ApiList
};

const AuthNavigator = createBottomTabNavigator(RouteConfigs, AuthNavigatorConfig);
export default createAppContainer(AuthNavigator);
