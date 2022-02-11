import { StyleSheet, Platform } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const containerDropShadow = Platform.select({
  android: {
    elevation: 2,
  },
  ios: {
    shadowColor: 'rgb(50,50,50)',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
});

export const style = StyleSheet.create({
  button: {
    width: 250,
    height: 50,
    backgroundColor: 'rgb(52, 152, 219)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'silver',
    borderRadius: 15,
    ...containerDropShadow,
    marginTop: 20,
  },
  container: { 
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: { 
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold'
  },
});
