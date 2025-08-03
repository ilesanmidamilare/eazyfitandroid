import Button from "@/components/Button";
import OrderHeader from "@/components/header/OrderHeader";
import { useBidDetails, useCreateOfferByStylist } from "@/hooks/use-bids";
import { offerSchema } from "@/schema/offer.schema";
import Colors from "@/styles/colors";
import { layout } from "@/styles/layout";
import { Body } from "@/styles/typography";
import AntDesign from "@expo/vector-icons/AntDesign";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import { Formik, FormikHelpers } from "formik";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface FormValues {
  price: number | null;
  delivery_date: string;
}

const Bid = () => {
  const { id } = useLocalSearchParams();
  const [image, setImage] = useState<
    ImagePicker.ImagePickerAsset[] | undefined
  >();

  const [date, setDate] = useState(new Date());
  const [show, setShow] = useState(false);
  const [price, setPrice] = useState("");

  const { bid, isLoading, error } = useBidDetails(id as string);

  const updateImage = (updatedData: any) => {
    setImage(updatedData);
  };

  //Pick Image
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      aspect: [4, 3],
      quality: 1,
      allowsMultipleSelection: true,
      selectionLimit: 3, // Optional: Limit the number of selections to 4
    });

    if (!result.canceled) {
      setImage(result.assets);
    } else {
      // Error occurred
      console.log("Image picking cancelled or error occurred:", result);
    }
  };
  function setFieldValue(arg0: string, arg1: string) {
    throw new Error("Function not implemented.");
  }

  const { createOfferByStylist, isLoading: createOfferLoading } =
    useCreateOfferByStylist();

  const handleSendOffer = async (
    values: FormValues,
    actions: FormikHelpers<FormValues>
  ) => {
    const payload = {
      customer_id: bid?.customer_id,
      style_id: bid?._id,
      price: Number(values.price),
      delivery_date: values.delivery_date,
    };

    const result = await createOfferByStylist(bid?._id as string, payload);

    if (result?.success) {
      actions.resetForm();
      setDate(new Date());
      setShow(false);
      setPrice("");
      router.back();
    } else {
      Alert.alert(result?.error || "Failed to send offer. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <ActivityIndicator size="large" color={Colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[layout.container]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <OrderHeader
          title={"Bid"}
          backArrow
          onPress={() => {
            router.dismiss();
          }}
        />
        <Formik
          initialValues={{
            price: null as number | null,
            delivery_date: new Date().toISOString(),
          }}
          validateOnMount={true}
          validationSchema={offerSchema}
          onSubmit={handleSendOffer}
        >
          {({
            handleChange,
            handleBlur,
            handleSubmit,
            values,
            errors,
            touched,
          }) => (
            <View style={{ marginTop: 20, flex: 1 }}>
              <View>
                <Body style={{ fontFamily: "SEMIBOLD" }}>Price</Body>
                <TextInput
                  style={styles.input}
                  onChangeText={handleChange("price")}
                  onBlur={handleBlur("price")}
                  value={values.price !== null ? String(values.price) : ""}
                  placeholder="Price"
                  keyboardType="numeric"
                />
                <Body>{touched.price && errors.price}</Body>
              </View>

              <Body style={{ fontFamily: "SEMIBOLD", marginBottom: 12 }}>
                Delivery Date
              </Body>
              <Pressable
                onPress={() => {}}
                style={{
                  borderWidth: 0.5,
                  borderColor: Colors.primaryGray,
                  borderRadius: 50,
                  paddingHorizontal: 12,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <TextInput
                  editable={false}
                  style={{
                    flex: 1,
                    fontSize: 10,
                    fontFamily: "REGULAR",
                    height: 45,
                  }}
                  value={
                    new Date(values.delivery_date).toISOString().split("T")[0]
                  }
                  placeholder="Delivery Date"
                  onChangeText={(text) => setFieldValue("price", text)}
                />

                <Pressable style={{ padding: 5 }} onPress={() => setShow(true)}>
                  <AntDesign name="calendar" size={16} color="black" />
                </Pressable>

                {show && (
                  <DateTimePicker
                    value={date}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                      const currentDate = selectedDate || date;
                      setShow(Platform.OS === "ios");
                      setDate(currentDate);
                      handleChange("delivery_date")(currentDate.toISOString());
                    }}
                  />
                )}
              </Pressable>

              {/* <Heading
               style={{
                 fontFamily: "SEMIBOLD",
                 textAlign: "center",
                 marginTop: 50,
               }}
             >
               Upload Similar Style (optional)
             </Heading>
             <View
               style={{
                 borderWidth: 1,
                 borderRadius: 10,
                 borderStyle: "dashed",
                 paddingVertical: 40,
                 paddingHorizontal: 20,
                 marginBlock: 30,
               }}
             >
               <UploadFile
                 uploadName={" Style"}
                 onPress={pickImage}
                 uploadDetails={image}
                 updateUpload={updateImage}
               />
             </View> */}
              {createOfferLoading ? (
                <View style={[styles.loadingBtn, styles.floatingBtn]}>
                  <ActivityIndicator color={Colors.primaryLight} />
                </View>
              ) : (
                <Pressable
                  style={styles.floatingBtn}
                  onPress={() => handleSubmit()}
                >
                  <Button
                    title="Submit"
                    backgroundColor={Colors.primary}
                    fontFamily="MEDIUM"
                    marginRight={undefined}
                    marginLeft={undefined}
                    fontSize={undefined}
                  />
                </Pressable>
              )}
            </View>
          )}
        </Formik>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Bid;

const styles = StyleSheet.create({
  floatingBtn: {
    width: "100%",
    height: 50,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    backgroundColor: Colors.primary,
    position: "absolute",
    bottom: 10,
  },
  loadingBtn: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.primary,
    padding: 15,
    borderRadius: 50,
  },
  input: {
    borderWidth: 0.5,
    fontSize: 10,
    fontFamily: "REGULAR",
    borderColor: Colors.primaryGray,
    borderRadius: 50,
    paddingHorizontal: 12,
    marginVertical: 10,
    height: 45,
  },
});
