import { StyleSheet, View, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Colors from '@/styles/colors';
import { useRouter } from 'expo-router';
import Avatar from '@/components/Avatar';
import {Heading} from '@/styles/typography';
import Button from '@/components/Button';

const Header = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back-ios" size={16} color="white" />
        </Pressable>

        <View style={styles.stylistInfo}>
          <Avatar width={32} height={32} />
          <Heading style={styles.stylistName}>[Stylist Name]</Heading>
        </View>
      </View>

      <Button
        onPress={undefined}
        title="create Order"
        fontFamily="REGULAR"
        fontSize={10}
        backgroundColor="#FEFEFE"
        color="black"
        paddingTop={10}
        paddingBottom={10}
        paddingLeft={16}
        paddingRight={16}
      />
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 30,
    paddingBottom: 60,
    justifyContent: 'space-between',
    padding: 16,
  },
  leftSection: {
    flexDirection: 'row',
  },
  backButton: {
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stylistInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  stylistName: {
    color: Colors.primaryLight,
  },
});
