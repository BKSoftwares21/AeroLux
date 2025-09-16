import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import Login from './screens/Auth/Login';

export default function Index() {
  return (
<SafeAreaView style={styles.background}>
  <Login/>
  </SafeAreaView>
  );
}

const styles = StyleSheet.create({  
  background: {   
        flex: 1,
        backgroundColor: "#fff",
        justifyContent: "center",
    },         
});