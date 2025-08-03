import * as yup from "yup";

export const offerSchema = yup.object({
    price: yup.number().required("Price is required").min(0, "Price must be positive"),
    delivery_date: yup.date().required("Delivery date is required").min(new Date(), "Delivery date must be in the future"),
});