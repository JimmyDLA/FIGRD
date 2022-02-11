import React, { useState } from 'react';
import { View } from 'react-native';
import { style } from 'App/Screens/Game/GameScreen.style';

export const Shape = ({ 
  shape ,renderShape, i, isPowerup, backgroundColor, saveLocation
}) => {
  return (
    <View
      onLayout={e => saveLocation(e)}
      key={`${shape.name}${shape.id}`} 
      style={[
        style.shapeContainer, 
        isPowerup ? { backgroundColor: backgroundColor } : {},
      ]}
    >
      {renderShape(shape, shape.id, true)}
    </View>
  );
}

