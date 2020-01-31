import React, {Component} from 'react';

import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  TouchableHighlight,
  TouchableOpacity,
  Platform,
  PermissionsAndroid,
  FlatList,
  AsyncStorage
} from 'react-native';
import Sound from 'react-native-sound';
import {AudioRecorder, AudioUtils} from 'react-native-audio';
import * as RNFS from 'react-native-fs';


class AudioRecoder extends Component {

    state = {
      currentTime: 0.0,
      recording: false,
      paused: false,
      stoppedRecording: false,
      finished: false,
      audioPath: AudioUtils.DownloadsDirectoryPath + '/creazionapp/',
      hasPermission: undefined,
      files:[
      ],
      number: 0,
      name:'',
    };

    prepareRecordingPath(audioPath){
      AudioRecorder.prepareRecordingAtPath(audioPath + this.generateName(), {
        SampleRate: 22050,
        Channels: 1,
        AudioQuality: "Low",
        AudioEncoding: "aac",
        AudioEncodingBitRate: 32000
      });
    }
    generateName(){
        var date = new Date().getDate().toString();
        var month = (new Date().getMonth() + 1).toString();
        var hours = new Date().getHours().toString(); 
        var min = new Date().getMinutes().toString();
        var sec = new Date().getSeconds().toString(); 
        var completeDate = month + date +  hours + min + sec
        const baseName = 'audio'
        const extension = '.aac'
        return baseName + completeDate + extension
    }

    componentWillMount(){

        // this.prepareRecordingPath(this.state.audioPath);
    }
    componentDidMount() {
        // console.warn();
      AudioRecorder.requestAuthorization().then((isAuthorised) => {
        this.setState({ hasPermission: isAuthorised });

        if (!isAuthorised) return;

        

        AudioRecorder.onProgress = (data) => {
          this.setState({currentTime: Math.floor(data.currentTime)});
        };

        AudioRecorder.onFinished = (data) => {
          // Android callback comes in the form of a promise instead.
          if (Platform.OS === 'ios') {
            this._finishRecording(data.status === "OK", data.audioFileURL, data.audioFileSize);
          }
        };
      });

      RNFS.readDir(this.state.audioPath).then(files => {
        this.setState({
            files: files,
            bandera:!this.state.bandera

        })
          
      })
      
    }

    _renderButton(title, onPress, active) {
      var style = (active) ? styles.activeButtonText : styles.buttonText;

      return (
        <TouchableHighlight style={styles.button} onPress={onPress}>
          <Text style={style}>
            {title}
          </Text>
        </TouchableHighlight>
      );
    }

    _renderPauseButton(onPress, active) {
      var style = (active) ? styles.activeButtonText : styles.buttonText;
      var title = this.state.paused ? "RESUME" : "PAUSE";
      return (
        <TouchableHighlight style={styles.button} onPress={onPress}>
          <Text style={style}>
            {title}
          </Text>
        </TouchableHighlight>
      );
    }

    async _pause() {
      if (!this.state.recording) {
        console.warn('Can\'t pause, not recording!');
        return;
      }

      try {
        const filePath = await AudioRecorder.pauseRecording();
        this.setState({paused: true});
      } catch (error) {
        console.error(error);
      }
    }

    async _resume() {
      if (!this.state.paused) {
        console.warn('Can\'t resume, not paused!');
        return;
      }

      try {
        await AudioRecorder.resumeRecording();
        this.setState({paused: false});
      } catch (error) {
        console.error(error);
      }
    }

    async _stop() {
      if (!this.state.recording) {
        console.log('Can\'t stop, not recording!');
        return;
      }

      this.setState({stoppedRecording: true, recording: false, paused: false});

      try {
        const filePath = await AudioRecorder.stopRecording();

        if (Platform.OS === 'android') {
          this._finishRecording(true, filePath);
        }
        return filePath;
      } catch (error) {
        console.error(error);
      }
    }

    async _play() {
      if (this.state.recording) {
        await this._stop();
      }

      // These timeouts are a hacky workaround for some issues with react-native-sound.
      // See https://github.com/zmxv/react-native-sound/issues/89.
      setTimeout(() => {
        var sound = new Sound(this.state.audioPath + this.generateName(), '', (error) => {
          if (error) {
            console.log('failed to load the sound', error);
          }
        });

        setTimeout(() => {
          sound.play((success) => {
            if (success) {
              console.log('successfully finished playing');
            } else {
              console.log('playback failed due to audio decoding errors');
            }
          });
        }, 100);
      }, 100);
    }

    async _record() {
      if (this.state.recording) {
        console.warn('Already recording!');
        return;
      }

      if (!this.state.hasPermission) {
        console.warn('Can\'t record, no permission granted!');
        return;
      }

      if(this.state.stoppedRecording){
        this.prepareRecordingPath(this.state.audioPath);
      }

      this.setState({recording: true, paused: false});

      try {
        this.prepareRecordingPath(this.state.audioPath);
        const filePath = await AudioRecorder.startRecording();
      } catch (error) {
        console.error(error);
      }
    }

    _finishRecording(didSucceed, filePath, fileSize) {
      this.setState({ finished: didSucceed });
      console.warn(`Finished recording of duration ${this.state.currentTime} seconds at path: ${filePath} and size of ${fileSize || 0} bytes`);
    }

    reproduce() {
        alert('pressed')
    }
        
        

    Item({ item }){
        return (
          <View style={styles.listItem}>
                <TouchableOpacity 
                style={styles.listText}
                onPress={() => {
                    setTimeout(() => {
                        var sound = new Sound(item.path, '', (error) => {
                          if (error) {
                            console.log('failed to load the sound', error);
                          }
                        });
                
                        setTimeout(() => {
                          sound.play((success) => {
                            if (success) {
                              console.log('successfully finished playing');
                            } else {
                              console.log('playback failed due to audio decoding errors');
                            }
                          });
                        }, 100);
                    }, 100);
                }}>
                    <Text style={styles.listText}>{item.name}</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                onPress={ ()=> {
                    RNFS.unlink(item.path)
                    .then(() => {
                        console.warn('FILE DELETED');
                    })
                    // `unlink` will throw an error, if the item to unlink does not exist
                    .catch((err) => {
                        console.warn(err.message);
                    });
                
                }}
                >
                    <Text style={styles.listText}>X</Text>
                </TouchableOpacity>
          </View>
        );
      }

    render() {

      return (
        <View style={styles.container}>
          <View style={styles.controls}>
            
                
            {this._renderButton("RECORD", () => {this._record()}, this.state.recording )}
            {this._renderButton("PLAY", () => {this._play()} )}
            {this._renderButton("STOP", () => {this._stop()} )}
            {this._renderPauseButton(() => {this.state.paused ? this._resume() : this._pause()})}
            <Text style={styles.progressText}>{this.state.currentTime}s</Text>
            <FlatList
            style={{width:'100%'}}
            data={this.state.files}
            renderItem={this.Item}
            />
            <View>

            </View>
          </View>
        </View>
      );
    }
  }


export default AudioRecoder

var styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#FF573F",
    },
    controls: {
      justifyContent: 'center',
      alignItems: 'center',
      flex: 1,
    },
    progressText: {
      paddingTop: 50,
      fontSize: 50,
      color: "#fff"
    },
    button: {
      padding: 20
    },
    disabledButtonText: {
      color: '#eee'
    },
    buttonText: {
      fontSize: 20,
      color: "#fff"
    },
    activeButtonText: {
      fontSize: 20,
      color: "#B81F00"
    },
    listItem:{
        alignItems:'center',
        justifyContent:'space-around',
        width: '100%',
        height: 50,
        flexDirection: 'row',
    },
    listText:{
        color:'#fff',
        fontSize: 20,
    }
    
  });