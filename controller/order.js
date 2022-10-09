import { asyncError } from "../middlewares/errorMiddleware.js";
import { Order } from "../models/Order.js"
import ErrorHandler from "../utils/ErrorHandler.js";
import {instance} from "../server.js"
import crypto from "crypto";
import { Payment } from "../models/Payment.js";

export const placeOrder = asyncError(async (req, res, next) => {
    const {
        shippingInfo,
        orderItems,
        paymentMethod,
        paymentInfo,
        itemsPrice,
        taxPrice,
        shippingCharge,
        totalAmount
    } = req.body;
    const user = req.user._id;


    const orderOptions = {
        shippingInfo,
        orderItems,
        paymentMethod,
        paymentInfo,
        itemsPrice,
        taxPrice,
        shippingCharge,
        totalAmount,
        user,
    };
    await Order.create(orderOptions);
    res.status(201).json({
        success: true,
        message: 'Order Placed successfully via Cash On Delivery',
    })

});

export const placeOrderOnline = asyncError(async (req, res, next) => {
    const {
        shippingInfo,
        orderItems,
        paymentMethod,
        paymentInfo,
        itemsPrice,
        taxPrice,
        shippingCharge,
        totalAmount
    } = req.body;
    const user = req.user._id;


    const orderOptions = {
        shippingInfo,
        orderItems,
        paymentMethod,
        paymentInfo,
        itemsPrice,
        taxPrice,
        shippingCharge,
        totalAmount,
        user,
    };

    const options = {
        amount: Number(totalAmount)*100,
        currency: "INR",
    };
    const order = await instance.orders.create(options)

    await Order.create(orderOptions);
    res.status(201).json({
        success: true,
        order,
        orderOptions,
       // message: 'Order Placed successfully via Cash On Delivery',
    })

});
export const paymentVerification = asyncError(async (req, res, next) => {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      orderOptions,
    } = req.body;
  
    const body = razorpay_order_id + "|" + razorpay_payment_id;
  
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_API_SECRET)
      .update(body)
      .digest("hex");
  
    const isAuthentic = expectedSignature === razorpay_signature;
  
    if (isAuthentic) {
      const payment = await Payment.create({
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      });
  
      await Order.create({
        ...orderOptions,
        paidAt: new Date(Date.now()),
        paymentInfo: payment._id,
      });
  
      res.status(201).json({
        success: true,
        message: `Order Placed Successfully. Payment ID: ${payment._id}`,
      });
    } else {
      return next(new ErrorHandler("Payment Failed", 400));
    }
  });

export const getMyOrder = asyncError(async (req, res, next) => {
    const orders = await Order.find({
        user: req.user._id,
    }).populate('user', 'name');

    res.status(200).json({
        success: true,
        orders,
    })

});

export const getMyOrderDetails = asyncError(async (req, res, next) => {
    const order = await Order.findById(req.params.id).populate("user", "name")
    if (!order) return next(new ErrorHandler("Invalid Order Id", 404));
    res.status(200).json({
        success: true,
        order,
    });
});


export const getAdminOrder = asyncError(async (req, res, next) => {
    const orders = await Order.find({}).populate('user', 'name');

    res.status(200).json({
        success: true,
        orders,
    })

});

export const processOrder = asyncError(async (req, res, next) => {
    const order = await Order.findById(req.params.id)
    if (!order) return next(new ErrorHandler("Invalid Order Id", 404));
    if (order.orderStatus === "Preparing") order.orderStatus = "Shipped";
    else if (order.orderStatus === "Shipped") {
        order.orderStatus = "Delivered";
        order.deliveredAt = new Date(Date.now());
    }
    else if (order.orderStatus === "Delivered") return next(new ErrorHandler("Food Already Delivered", 404));
    await order.save();
    res.status(200).json({
        success: true,
        message: "Status Update Successfully",
    })

});