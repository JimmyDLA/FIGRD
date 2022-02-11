import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import CountDown from 'react-native-countdown-component';
import pauseImg from 'App/Assets/Images/pause.png'
import { style, colorObj } from 'App/Screens/Game/GameScreen.style';

export const Status = React.forwardRef((props, ref) => {
  const {
    time,
    score,
    level,
    timeID,
    gamePaused,
    handlePause,
    handleGameOver,
    isFrozen,
    isAddTime,
    showPowerupTime,
    saveOffsetY,
  } = props;
  
  return(
    <View style={style.statsContainer} onLayout={saveOffsetY}>

      <View style={style.column0}>
        <View style={style.subContainer}>
          <Text style={style.time}>Level: {level}</Text>
        </View>

        <View style={style.subContainer}>
          <Text style={style.time}>Score:</Text>
          <Text style={style.score}>{score}</Text>
        </View>
      </View>

      <View style={style.column1}>
        <CountDown
          id={timeID}
          ref={ref}
          until={time}
          onFinish={handleGameOver}
          size={25}
          digitStyle={{backgroundColor: 'transparent', width: 40}}
          digitTxtStyle={{ color: isFrozen ? colorObj.blue : 'rgb(0,0,0)' }}
          separatorStyle={{ color: isFrozen ? colorObj.blue : 'rgb(0,0,0)' }}
          timeToShow={['M','S']}
          timeLabels={{}}
          showSeparator
          running={!gamePaused && !isFrozen }
        />
        {showPowerupTime && (
          <Text style={[style.timeIndicator, {color: isAddTime ? colorObj.green : colorObj.red }]}>
            {isAddTime ? '+5' : '-5'}
          </Text>
        )}
      </View>

      <View style={style.column2}> 
        <View style={[style.subContainer, style.subContainer2] }>
          <TouchableOpacity style={style.pauseContainer} onPress={handlePause}>
            <Image resizeMode="contain" style={style.pause} source={pauseImg} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
})
