import squareImg from 'App/Assets/Images/square.png';
import circleImg from 'App/Assets/Images/circle.png';
import starImg from 'App/Assets/Images/star.png';
import andImg from 'App/Assets/Images/and.png';
import asteriskImg from 'App/Assets/Images/asterisk.png';
import atImg from 'App/Assets/Images/at.png';
import crossImg from 'App/Assets/Images/cross.png';
import diagnalImg from 'App/Assets/Images/diagnal.png';
import diamondImg from 'App/Assets/Images/diamond.png';
import dividImg from 'App/Assets/Images/divid.png';
import equalImg from 'App/Assets/Images/equal.png';
import exclamationImg from 'App/Assets/Images/exclamation.png';
import greaterImg from 'App/Assets/Images/greater.png';
import lessImg from 'App/Assets/Images/less.png';
import moneyImg from 'App/Assets/Images/money.png';
import numImg from 'App/Assets/Images/num.png';
import ovalImg from 'App/Assets/Images/oval.png';
import percentImg from 'App/Assets/Images/percent.png';
import pieImg from 'App/Assets/Images/pie.png';
import polygonImg from 'App/Assets/Images/polygon.png';
import questionImg from 'App/Assets/Images/question.png';
import rainbowImg from 'App/Assets/Images/rainbow.png';
import rectangleImg from 'App/Assets/Images/rectangle.png';
import triangleImg from 'App/Assets/Images/triangle.png';
import xImg from 'App/Assets/Images/x.png';
import squareHiddenImg from 'App/Assets/Images/squareHidden.png'
import circleHiddenImg from 'App/Assets/Images/circleHidden.png'
import starHiddenImg from 'App/Assets/Images/starHidden.png'
import diagnalHiddenImg from 'App/Assets/Images/diagnalHidden.png'
import diamondHiddenImg from 'App/Assets/Images/diamondHidden.png'
import dividHiddenImg from 'App/Assets/Images/dividHidden.png'
import equalHiddenImg from 'App/Assets/Images/equalHidden.png'
import exclamationHiddenImg from 'App/Assets/Images/exclamationHidden.png'
import greaterHiddenImg from 'App/Assets/Images/greaterHidden.png'
import lessHiddenImg from 'App/Assets/Images/lessHidden.png'
import moneyHiddenImg from 'App/Assets/Images/moneyHidden.png'
import numHiddenImg from 'App/Assets/Images/numHidden.png'
import ovalHiddenImg from 'App/Assets/Images/ovalHidden.png'
import percentHiddenImg from 'App/Assets/Images/percentHidden.png'
import pieHiddenImg from 'App/Assets/Images/pieHidden.png'
import polygonHiddenImg from 'App/Assets/Images/polygonHidden.png'
import questionHiddenImg from 'App/Assets/Images/questionHidden.png'
import rainbowHiddenImg from 'App/Assets/Images/rainbowHidden.png'
import rectangleHiddenImg from 'App/Assets/Images/rectangleHidden.png'
import triangleHiddenImg from 'App/Assets/Images/triangleHidden.png'
import xHiddenImg from 'App/Assets/Images/xHidden.png'
import andHiddenImg from 'App/Assets/Images/andHidden.png'
import asteriskHiddenImg from 'App/Assets/Images/asteriskHidden.png'
import atHiddenImg from 'App/Assets/Images/atHidden.png'
import crossHiddenImg from 'App/Assets/Images/crossHidden.png'


class Shape {
  constructor(id, name, activeImg, inactiveImg) {

    this.id = id;
    this.name = name;
    this.activeImg = activeImg;
    this.inactiveImg = inactiveImg;
  };
};

export const shuffle = (array, n) => {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array.slice(0, n);
}

export const getShapes = (n = 25) => {
  const names = [
    'square', 
    'circle', 
    'star',
    'and', 
    'asterisk', 
    'at',
    'cross', 
    'diagnal', 
    'diamond',
    'divid', 
    'equal', 
    'exclamation',
    'greater', 
    'less', 
    'money',
    'num', 
    'oval', 
    'percent',
    'pie', 
    'polygon', 
    'question',
    'rainbow', 
    'rectangle', 
    'triangle',
    'x', 
  ];
  const shapeImgs = [
    squareImg, 
    circleImg, 
    starImg,
    andImg, 
    asteriskImg, 
    atImg,
    crossImg, 
    diagnalImg, 
    diamondImg,
    dividImg, 
    equalImg, 
    exclamationImg,
    greaterImg, 
    lessImg, 
    moneyImg,
    numImg, 
    ovalImg, 
    percentImg,
    pieImg, 
    polygonImg, 
    questionImg,
    rainbowImg, 
    rectangleImg, 
    triangleImg,
    xImg, 
  ];

  const shapeHiddenImgs = [
    squareHiddenImg, 
    circleHiddenImg, 
    starHiddenImg,
    andHiddenImg,
    asteriskHiddenImg,
    atHiddenImg,
    crossHiddenImg,
    diagnalHiddenImg,
    diamondHiddenImg,
    dividHiddenImg,
    equalHiddenImg,
    exclamationHiddenImg,
    greaterHiddenImg,
    lessHiddenImg,
    moneyHiddenImg,
    numHiddenImg,
    ovalHiddenImg,
    percentHiddenImg,
    pieHiddenImg,
    polygonHiddenImg,
    questionHiddenImg,
    rainbowHiddenImg,
    rectangleHiddenImg,
    triangleHiddenImg,
    xHiddenImg,
  ];

  const shapesArr = names.map((name, i) => {
    const item = new Shape(i, name, shapeImgs[i], shapeHiddenImgs[i]);
    return item;
  });

  return shuffle(shapesArr, n);
}
