import React from 'react'
import {
  View,
  Image,
  Animated,
  Vibration,
  PanResponder,
} from 'react-native'
import { connect } from 'react-redux'
import {
  gameOver,
  pauseGame,
  gameWon,
  gameTime,
  aboutToStart,
  updateShapesObject,
  updateShapesFound,
  updateShapesInfo,
} from 'App/Redux/modules/game';
import { getShapes } from '../../Helpers/Shapes'
import { style } from './GameScreen.style'
import { Matrix } from '../../Components/organisms/Matrix';
import { Selection } from '../../Components/organisms/Selection';
import { Status } from '../../Components/organisms/Status';
import ReactNativeHapticFeedback from "react-native-haptic-feedback";

console.disableYellowBox = true;
const options = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false
};

class GameScreen extends React.Component {

  point = new Animated.ValueXY();

  constructor() {
    super();
    this.state = {
      isGrabbing: false,
      grabbedShape: {},
      matrixBorder: 0,
      shapeBorder: 0,
      shapesInfo: [],
      frozen: false,
      isPowerOn: false,
      powerUpId: null,
      powerupTime: false,
      sectionColor: null,
      powerUp: {
        color: null,
        square: null,
      },
      wildcard: false,
      timeLeft: 0,
      yOffset: 0,
      score: 0,
      addTime: null,
      bonus: 0,
    };

    this.interval = setInterval(() => {
      this.handleLightUpPowerup();
    }, 5000);

    this.time = React.forwardRef();

    this._panResponder = PanResponder.create({
      // Ask to be the responder:
      onStartShouldSetPanResponder: (evt, gestureState) => true,
      onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => true,
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,

      onPanResponderGrant: (evt, gestureState) => {
        const { memoizedProps: { shape } } = evt._targetInst;
        const { height, width } = this.props.shapesInfo[0];
        const { y0, x0 } = gestureState;

        this.setState({
          grabbedShape: shape,
          isGrabbing: true,
        });

        Animated.event([{ x: this.point.x }])({ x: x0 - (width / 2) })
        Animated.event([{ y: this.point.y }])({ y: y0 - (height / 2) })
        // The gesture has started. Show visual feedback so the user knows
        // what is happening!
        // gestureState.d{x,y} will be set to zero now
      },
      onPanResponderMove: (evt, gestureState) => {
        const { height, width } = this.props.shapesInfo[0];
        const { moveX, moveY } = gestureState;

        Animated.event([{ y: this.point.y }])({ y: moveY - (height / 2) })
        Animated.event([{ x: this.point.x }])({ x: moveX - (width / 2) })
        // The most recent move distance is gestureState.move{X,Y}
        // The accumulated gesture distance since becoming responder is
        // gestureState.d{x,y}
      },
      onPanResponderTerminationRequest: (evt, gestureState) => false,
      onPanResponderRelease: (evt, gestureState) => {
        this.handleRelease(gestureState)
        // The user has released all touches while this view is the
        // responder. This typically means a gesture has succeeded
      },
      onPanResponderTerminate: (evt, gestureState) => {
        // this.setState({ isGrabbing: false });
        // Another component has become the responder, so this gesture
        // should be cancelled
      },
      onShouldBlockNativeResponder: (evt, gestureState) => {
        // Returns whether this component should block native components from becoming the JS
        // responder. Returns true by default. Is currently only supported on android.
        return true;
      },
    });
  }

  componentDidMount() {
    const { aboutToStart } = this.props;
    aboutToStart({ gameAboutToStart: true });
    this.handleGetShapes();
  }

  points = () => {
    const addOne = () => {
      let { score, timeLeft } = this.state;

      if (timeLeft === 0) {
        clearInterval(addPoints);
      } else {
        this.setState({ score: score + 1, timeLeft: timeLeft - 1 });
      }
    }
    const addPoints = setInterval(addOne, 100);
  }

  handleRelease = (gestureState) => {
    const { moveX, moveY } = gestureState;
    const {
      shapesInfo,
      shapesFound,
      updateShapesFound,
      shapesInMatrix,
    } = this.props;
    const {
      grabbedShape,
      matrixBorder,
      yOffset,
      wildcard,
    } = this.state;

    const handleShapeFound = shape => {
      const newShapesFound = [
        ...shapesFound,
        shape.id.toString(),
      ];
      ReactNativeHapticFeedback.trigger("impactLight", options);
      updateShapesFound(newShapesFound);

      //YOU WON!!
      if (shapesFound.length === 24) {
        const { bonus } = this.state;
        const { gameWon, level, score } = this.props;
        const { seconds } = this.time.current.getTimeLeft();
        const params = {
          score: shapesFound.length + bonus + score + seconds + 1,
          bonus,
          level: level + 1,
          timeLeft: seconds,
          won: true,
          gamePaused: true,
        }
        this.setState({ bonus: 0 });
        gameWon(params);
      }
    }

    shapesInfo.find(shape => {
      if (
        (moveX >= shape.x + matrixBorder) &&
        (moveY >= shape.y + yOffset + matrixBorder) &&
        (moveX <= shape.x + shape.width + matrixBorder) &&
        (moveY <= shape.y + shape.height + yOffset + matrixBorder)
      ) {
        if (wildcard) {
          handleShapeFound(grabbedShape);
        } else {
          if (shape.id === grabbedShape.id) {
            const { powerUp: { square, color } } = this.state;
            handleShapeFound(shape);

            if (square) {
              if (grabbedShape.id == square) {
                this.handlePowerUp(color, shape)
              }
            }
          } else {
            // Haptics types: 
            // "selection", "impactLight", "impactMedium", "impactHeavy", 
            // "notificationSuccess", "notificationWarning", "notificationError"
            ReactNativeHapticFeedback.trigger("notificationError", options);
          }
        }
      }
    })

    this.setState({ isGrabbing: false, grabbedShape: {} });
  }

  handleGetShapes = () => {
    const { updateShapesObject } = this.props;
    const objectShapes = {
      shapesInMatrix: getShapes(),
      shapesInSelection: getShapes(),
    }
    updateShapesObject(objectShapes);
  }

  handlePause = () => {
    const { pauseGame } = this.props;
    clearInterval(this.interval);
    pauseGame(true);
  }

  handleGameOver = () => {
    const { gameOver } = this.props;
    Vibration.vibrate([0, 1], true)
    clearInterval(this.interval);
    this.setState({ score: 0, isGrabbing: false, bonus: 0 });
    gameOver(true);

    setTimeout(() => {
      Vibration.cancel();
    }, 5000);
  }

  handlePowerUp = (color, shape) => {
    setTimeout(() => {
      this.setState({ powerUp: { color: null, square: null } });
    }, 300);
    clearInterval(this.interval);
    this.interval = null;

    const { bonus } = this.state;

    this.setState({ bonus: bonus + 1 })

    if (color === 'rgb(220,20,60)') {
      this.setState({ addTime: false, powerupTime: true });
      setTimeout(() => {
        this.setState({ addTime: null, powerupTime: false });
      }, 2000);
      const { seconds } = this.time.current.getTimeLeft();
      this.time.current.updateTimer(seconds - 5);
    }

    if (color === 'rgb(0,100,0)') {
      this.setState({ addTime: true, powerupTime: true });
      setTimeout(() => {
        this.setState({ addTime: null, powerupTime: false });
      }, 2000);
      const time = this.time.current.state.until;
      this.time.current.updateTimer(time + 5);
    }

    if (color === 'rgb(65,105,225)') {
      this.setState({ isPowerOn: true, frozen: true, sectionColor: 'rgb(65,105,225)' });
      setTimeout(() => {
        this.setState({ isPowerOn: false, frozen: false, sectionColor: null });
      }, 5000);
    }

    if (color === 'rgb(102,51,153)') {

      const { shapesFound, shapesInMatrix, updateShapesFound } = this.props;
      const allIdShapes = shapesInMatrix.map(shape => shape.id.toString());
      const availableShapes = allIdShapes.filter(id => !shapesFound.includes(id));
      // take out current shape grabbed
      availableShapes.forEach((element, i) => {
        if (element === shape.id) {
          availableShapes.splice(i, 1);
        }
      })
      const n = Math.floor(Math.random() * availableShapes.length);

      const newShapesFound = [
        ...shapesFound,
        shape.id.toString(),
        availableShapes[n].toString(),
      ];
      updateShapesFound(newShapesFound);
    }

    if (color === 'rgb(255,215,0)') {
      this.setState({ wildcard: true, sectionColor: 'rgb(255,215,0)' });
      setTimeout(() => {
        this.setState({ wildcard: false, sectionColor: null });
      }, 5000);
    }
  }

  handleLightUpPowerup = () => {
    const { powerUp } = this.state;
    const { availablePowerupSquares, shapesFound } = this.props;
    const allIdShapes = availablePowerupSquares.map(shape => shape.id);
    const availableShapes = allIdShapes.filter(id => !shapesFound.includes(id.toString()));

    if (shapesFound.length >= 20) {
      clearInterval(this.interval);
      this.interval = false;
      const newPowerUp = {
        square: null,
        color: null,
      };
      this.setState({ powerUp: newPowerUp });
    } else if (powerUp.square === null) {
      const colors = [
        'rgb(220,20,60)',
        'rgb(65,105,225)',
        'rgb(0,100,0)',
        'rgb(102,51,153)',
        'rgb(255,215,0)',
      ];

      const colorIdx = Math.floor(Math.random() * 5);
      const id = Math.floor(Math.random() * availableShapes.length);
      const timer = (Math.floor(Math.random() * 5) + 1) * 1000;
      const newPowerUp = {
        square: availableShapes[id].toString(),
        color: colors[colorIdx],
      };

      this.setState({ powerUp: newPowerUp })

      setTimeout(() => {
        const newPowerUp = {
          square: null,
          color: null,
        };

        this.setState({ powerUp: newPowerUp });
      }, timer);
    } else {
      const newPowerUp = {
        square: null,
        color: null,
      };
      this.setState({ powerUp: newPowerUp });
    }
  }

  handleLightUpInterval = () => {
    const { gamePaused, gameEnded, won, shapesFound } = this.props;
    const isMostShapesFound = shapesFound.length >= 20;

    if (isMostShapesFound || gamePaused || gameEnded || won) {
      clearInterval(this.interval);
      this.interval = null;
    } else if (this.interval === null) {
      this.interval = setInterval(() => {
        this.handleLightUpPowerup();
      }, 5000);
    }
  }

  saveShapeLocation = e => {
    const { updateShapesInfo, shapesInMatrix } = this.props;
    const { layout: { x, y, width, height } } = e.nativeEvent;
    const { style: { borderWidth } } = e._targetInst.memoizedProps
    this.setState({ shapeBorder: borderWidth });

    let counter = -1

    const newShapesInfo = shapesInMatrix.map((shape, i) => {
      const column = i % 5
      if (column === 0) {
        counter += 1
      }

      return (
        {
          x: x + (column * width),
          y: y + (counter * height),
          height,
          width,
          ...shape,
        }
      );
    });
    updateShapesInfo(newShapesInfo);
  }

  saveMatrixBorder = e => {
    const { layout: { y } } = e.nativeEvent;
    const { style: { borderWidth } } = e._targetInst.memoizedProps
    this.setState({ matrixBorder: borderWidth, yOffset: y });
  }

  handleUpdatePowerId = e => {
    this.setState({ powerUpId: e })
  }

  renderShape = (shape, i, isHidden = false) => {
    const { shapesFound } = this.props;
    const isFound = shapesFound.find(id => id == shape.id);
    if (!isFound && !isHidden) {
      return (
        <View
          {...this._panResponder.panHandlers}
          shape={shape}
          style={style.slopHit}
        >
          <Image
            key={`${shape.name}${i}`}
            style={style.shapeImg}
            source={!isHidden ? shape.activeImg : shape.inactiveImg}
            shape={shape}
            resizeMode="contain"
          />
        </View>
      )
    }
    if (isHidden) {
      return (
        <Image
          key={`${shape.name}${i}`}
          style={[style.shapeImg]}
          source={!isHidden || isFound ? shape.activeImg : shape.inactiveImg}
          shape={shape}
          resizeMode="contain"
        />
      )
    }
    if (isFound) {
      return null;
    }
  }

  render() {
    const {
      shapesInSelection,
      shapesInMatrix,
      gamePaused,
      timeID,
      level,
      score,
      time,
      won,
    } = this.props;

    const {
      grabbedShape,
      sectionColor,
      powerupTime,
      isGrabbing,
      addTime,
      powerUp,
      frozen,
    } = this.state;

    this.handleLightUpInterval();

    return (
      <View style={style.container}>
        {isGrabbing && (
          <Animated.View
            style={[
              {
                ...style.shapeContainer,
                position: 'absolute',
                zIndex: 2,
                top: this.point.y,
                left: this.point.x,
                borderWidth: 0,
              }
            ]}
          >
            {this.renderShape(grabbedShape, grabbedShape.id)}
          </Animated.View>
        )}

        <Status
          won={won}
          time={time}
          score={score}
          level={level}
          timeID={timeID}
          isFrozen={frozen}
          isAddTime={addTime}
          gamePaused={gamePaused}
          showPowerupTime={powerupTime}
          handlePause={this.handlePause}
          handleGameOver={this.handleGameOver}
          ref={this.time}
        />

        <Matrix
          square={powerUp.square}
          shapes={shapesInMatrix}
          backgroundColor={powerUp.color}
          renderShape={this.renderShape}
          saveBorder={this.saveMatrixBorder}
          saveLocation={this.saveShapeLocation}
          onUpdateId={this.handleUpdatePowerId}
        />

        <Selection
          shapes={shapesInSelection}
          renderShape={this.renderShape}
          grabbedShape={grabbedShape}
          sectionColor={sectionColor}
        />
      </View>
    )
  }
}

const mapStateToProps = ({
  game: {
    availablePowerupSquares,
    shapesInSelection,
    shapesInMatrix,
    shapesFound,
    gamePaused,
    gameEnded,
    shapesInfo,
    timeID,
    level,
    score,
    time,
    won,
  },
}) => ({
  availablePowerupSquares,
  shapesInSelection,
  shapesInMatrix,
  shapesFound,
  gamePaused,
  shapesInfo,
  gameEnded,
  timeID,
  level,
  score,
  time,
  won,
})

const mapDispatchToProps = {
  updateShapesObject,
  updateShapesFound,
  updateShapesInfo,
  aboutToStart,
  pauseGame,
  gameTime,
  gameOver,
  gameWon,
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(GameScreen)
