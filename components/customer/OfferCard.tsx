import { Pressable, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Body, Title } from '@/styles/typography'
import FontAwesome from '@expo/vector-icons/FontAwesome';
import EvilIcons from '@expo/vector-icons/EvilIcons';
import Button from '@/components/Button';
import Colors from '@/styles/colors';
import { router } from 'expo-router';

const OfferCard= ({
  rating,
  deliveryDays,
  location,
  price,
  stylistName,
  onChatPressBtn
}) => {
  return (
    <Pressable
      onPress={() => router.push('/stylist-profile')}  
     style={{backgroundColor:Colors.primaryLight, padding:20, borderRadius:30,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
      flex:1
    }}>
      <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'flex-end', marginBottom:20}}>
        <View style={{flexDirection:'row', alignItems:'flex-end', gap:5}}>
          <FontAwesome name="star" size={12} color="#EEC800" />
          <Body style={{fontFamily:'SEMIBOLD'}}>{rating}</Body>
        </View>
        <Body>{deliveryDays} delivery days</Body>
      </View>
      
      <Body style={{fontFamily:'SEMIBOLD'}}>{stylistName}</Body>

      <View style={{flexDirection:'row', justifyContent:'space-between', marginTop: 10, marginBottom:10}}>
        <View style={{flexDirection:'row', alignItems:'center', gap:5}}>
          <EvilIcons name="location" size={10} color="black" />
          <Body>Location: {location}</Body>
        </View>
        <Body style={{fontFamily:'SEMIBOLD'}}>N{price}</Body>
      </View>

      <View style ={{zIndex: 1}}>
      <Button onPress={onChatPressBtn} title={'Chat'} marginRight={undefined} marginLeft={undefined} fontFamily={'MEDIUM'} paddingBottom={10} paddingTop={10} fontSize={10}/>
      </View>
    </Pressable>
  )
}

export default OfferCard


const styles = StyleSheet.create({})