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
import { style, colorObj } from './GameScreen.style'
import { Matrix } from '../../Components/organisms/Matrix';
import { Selection } from '../../Components/organisms/Selection';
import { Status } from '../../Components/organisms/Status';
import Sound from 'react-native-sound';
import ReactNativeHapticFeedback from "react-native-haptic-feedback";

console.ignoredYellowBox = ['Warning: Each', 'Warning: Failed'];
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
      border: 0,
      shapeBorder: 0,
      shapesInfo: [],
      frozen: true,
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
      offsetX: 0,
      offsetY: 0,
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
      onPanResponderMove: (_, gestureState) => {
        const { height, width } = this.props.shapesInfo[0];
        const { moveX, moveY } = gestureState;
        console.log({ moveX, moveY })

        Animated.event([{ y: this.point.y }])({ y: moveY - (height / 2) })
        Animated.event([{ x: this.point.x }])({ x: moveX - (width / 2) })
        // The most recent move distance is gestureState.move{X,Y}
        // The accumulated gesture distance since becoming responder is
        // gestureState.d{x,y}
      },
      onPanResponderTerminationRequest: (_, gestureState) => false,
      onPanResponderRelease: (_, gestureState) => {
        this.handleRelease(gestureState)
        // The user has released all touches while this view is the
        // responder. This typically means a gesture has succeeded
      },
      onPanResponderTerminate: (_, gestureState) => {
        // this.setState({ isGrabbing: false });
        // Another component has become the responder, so this gesture
        // should be cancelled
      },
      onShouldBlockNativeResponder: (_, gestureState) => {
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
      border,
      offsetX,
      offsetY,
      wildcard,
      score,
    } = this.state;

    const handleShapeFound = shape => {
      const newShapesFound = [
        ...shapesFound,
        shape.id.toString(),
      ];
      ReactNativeHapticFeedback.trigger("impactLight", options);
      this.setState({ score: score + 1 })
      updateShapesFound(newShapesFound);

      //YOU WON!!
      if (shapesFound.length === 24) {
        const { bonus, score } = this.state;
        const { gameWon, level } = this.props;
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
    debugger
    shapesInfo.find(shape => {
      debugger
      if (
        (moveX >= shape.x + border) &&
        (moveY >= shape.y + offsetY + border) &&
        (moveX <= shape.x + shape.width + border + offsetX) &&
        (moveY <= shape.y + shape.height + offsetY + border)
      ) {
        debugger
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
      shapesInMatrix: getShapes(9),
      shapesInSelection: getShapes(9),
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

    if (color === colorObj.red) {
      this.setState({ addTime: false, powerupTime: true });
      setTimeout(() => {
        this.setState({ addTime: null, powerupTime: false });
      }, 2000);
      const { seconds } = this.time.current.getTimeLeft();
      this.time.current.updateTimer(seconds - 5);
    }

    if (color === colorObj.green) {
      this.setState({ addTime: true, powerupTime: true });
      setTimeout(() => {
        this.setState({ addTime: null, powerupTime: false });
      }, 2000);
      const time = this.time.current.state.until;
      this.time.current.updateTimer(time + 5);
    }

    if (color === colorObj.blue) {
      this.setState({ isPowerOn: true, frozen: true, sectionColor: colorObj.blue });
      setTimeout(() => {
        this.setState({ isPowerOn: false, frozen: false, sectionColor: null });
      }, 5000);
    }

    if (color === colorObj.purple) {

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

    if (color === colorObj.gold) {
      this.setState({ wildcard: true, sectionColor: colorObj.gold });
      setTimeout(() => {
        this.setState({ wildcard: false, sectionColor: null });
      }, 5000);
    }

    if (color === colorObj.orange) {
      this.setState({ selectionColor: colorObj.orange, bonus: bonus + 5 })
    }
  }

  handleLightUpPowerup = () => {
    const { powerUp } = this.state;
    const { availablePowerupSquares, shapesFound } = this.props;
    const allIdShapes = availablePowerupSquares.map(shape => shape.id);
    const availableShapes = allIdShapes.filter(id => !shapesFound.includes(id.toString()));

    if (shapesFound.length >= 20) {
      clearInterval(this.interval);
      this.interval = null;
      const newPowerUp = {
        square: null,
        color: null,
      };
      this.setState({ powerUp: newPowerUp });
    } else if (powerUp.square === null) {
      const colors = [
        colorObj.red,
        colorObj.blue,
        colorObj.green,
        colorObj.orange,
        colorObj.purple,
        colorObj.gold,
      ];

      const n = Math.floor(Math.random() * 5);
      const id = Math.floor(Math.random() * availableShapes.length);
      const timer = (Math.floor(Math.random() * 5) + 1) * 1000;
      const newPowerUp = {
        square: availableShapes[id].toString(),
        color: colors[n],
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

  saveOffsetY = e => {
    const { layout: { y } } = e.nativeEvent;
    const { offsetY } = this.state;
    this.setState({ offsetY: offsetY + y });
  }

  saveInnerMatrix = e => {
    const { layout: { x, y } } = e.nativeEvent;
    console.log({ x, y });
    const { offsetX, offsetY } = this.state;
    this.setState({ offsetX: offsetX + x, offsetY: offsetY + y });
  }

  saveShapeLocation = e => {
    const { updateShapesInfo, shapesInMatrix } = this.props;
    const { layout, layout: { x, y, width, height } } = e.nativeEvent;
    const { memoizedProps } = e._targetInst;
    const { style: { borderWidth } } = e._targetInst.memoizedProps
    this.setState({ shapeBorder: borderWidth });

    // console.log( 'layout= ', layout, ' key = ', memoizedProps.children.key)

    let row = -1

    const newShapesInfo = shapesInMatrix.map((shape, i) => {
      const column = i % 5
      if (column === 0) {
        row += 1
      }

      return (
        {
          x: x + (column * width),
          y: y + (row * height),
          height,
          width,
          ...shape,
        }
      );
    });
    updateShapesInfo(newShapesInfo);
  }

  saveOutterMatrix = e => {
    const { layout: { x, y } } = e.nativeEvent;
    const { style: { borderWidth } } = e._targetInst.memoizedProps
    const { offsetY, offsetX } = this.state;
    this.setState({
      border: borderWidth,
      offsetY: offsetY + y,
      offsetX: offsetX + x
    });
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
      score,
      bonus,
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
          score={score + bonus}
          level={level}
          timeID={timeID}
          isFrozen={true}
          isAddTime={addTime}
          gamePaused={gamePaused}
          showPowerupTime={powerupTime}
          handlePause={this.handlePause}
          handleGameOver={this.handleGameOver}
          ref={this.time}
          saveOffsetY={this.saveOffsetY}
        />

        <Matrix
          squareId={powerUp.square}
          shapes={shapesInMatrix}
          backgroundColor={powerUp.color}
          renderShape={this.renderShape}
          saveOutterMatrix={this.saveOutterMatrix}
          saveInnerMatrix={this.saveInnerMatrix}
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
