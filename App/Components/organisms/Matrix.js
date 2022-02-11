import React from 'react';
import { View } from 'react-native';
import { Shape } from './Shape';
import { style } from 'App/Screens/Game/GameScreen.style';

export const Matrix = ({
  shapes, renderShape, saveLocation, saveOutterMatrix, backgroundColor, squareId, saveInnerMatrix,
}) => {
  return (
    <View style={style.matrixContainer} onLayout={saveOutterMatrix}>
      <View style={style.innerMatrix} onLayout={saveInnerMatrix}>
        {shapes.map((shape, i) => (
          <Shape
            i={i}
            shape={shape}
            isPowerup={shape.id == parseInt(squareId)}
            renderShape={renderShape}
            saveLocation={saveLocation}
            backgroundColor={backgroundColor}
            key={`${shape.name}${shape.id}`}
          />
        ))}
      </View>
    </View>
  );
}

