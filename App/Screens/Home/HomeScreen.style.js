import { StyleSheet } from 'react-native'
import Fonts from 'App/Theme/Fonts'
import ApplicationStyles from 'App/Theme/ApplicationStyles'

export const style = StyleSheet.create({
  button: { 
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
    width: 250,
    borderWidth: 1,
    borderColor: 'gray',
    marginTop: 20,
  },
  buttonsContainer: {
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  container: {
    backgroundColor: 'rgb(6,32,57)',
    flex: 1,
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
  },
  logo: {
    backgroundColor: 'rgb(170, 170, 170)',
    height: 300,
    justifyContent: 'center',
    width: 300,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...Fonts.style.h2,
    textAlign: 'center',
    marginBottom: 10,
    color: 'white',
    marginTop: -150,
    fontWeight: '900'
  },
  background: {
    flex: 1,
    justifyContent: 'space-around',
    // alignItems: ''
  },
})
