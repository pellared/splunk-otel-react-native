/*
Copyright 2022 Splunk Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import { AppRegistry } from 'react-native';
import App from './src/App';
import { name as appName } from './app.json';
// import { SplunkRum } from '@splunk/otel-react-native';

// export const Rum = SplunkRum.init({
//   // realm: 'us0',
//   beaconEndpoint: 'http://192.168.1.136:53820/zipkindump',
//   applicationName: 'appStartTestAndroid',
//   rumAccessToken: 'tests',
//   debug: true,
// });

AppRegistry.registerComponent(appName, () => App);
