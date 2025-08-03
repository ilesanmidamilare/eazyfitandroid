import * as yup from "yup";

export const createOrderSchema = yup.object({
    out_fit_fee: yup.number().required(),
    delivery_fee: yup.number().required(),
    delivery_location: yup.string().required(),
})