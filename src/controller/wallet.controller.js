import Stripe from 'stripe';
import mongoose from 'mongoose';
import asyncHandler from '../utils/asynhandler.js';
import AppError from '../utils/AppError.js';
import authModel from '../model/user.model.js';
import transactionModel from '../model/transaction.model.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createCheckoutSession = asyncHandler(async (req, res, next) => {
  const { amount } = req.body;
  const userId = req.user.id;

  if (isNaN(amount) || amount <= 0) return next(new AppError('Invalid amount', 400));

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Smart Response Wallet Top-up',
            metadata: { userId },
          },
          unit_amount: Math.round(amount * 100),
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${process.env.CLIENT_URL}/wallet/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.CLIENT_URL}/wallet/failed`,
    metadata: {
      userId: userId.toString(),
      amount: amount.toString(),
      type: 'deposit',
    },
  });

  res.status(200).json({ success: true, url: session.url });
});

export const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error(`Webhook Signature Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { userId, amount, type } = session.metadata;

    const existingTx = await transactionModel.findOne({ transactionId: session.id });
    if (existingTx) {
      return res.status(200).json({ received: true, message: 'Already processed' });
    }

    const dbSession = await mongoose.startSession();
    dbSession.startTransaction();

    try {
      const updatedUser = await authModel.findByIdAndUpdate(
        userId,
        { $inc: { walletBalance: parseFloat(amount) } },
        { session: dbSession, new: true }
      );

      if (!updatedUser) throw new Error('User not found');

      await transactionModel.create(
        [
          {
            transactionId: session.id,
            userId,
            type: 'Deposit',
            amount: parseFloat(amount),
            currency: 'USD',
            status: 'Success',
          },
        ],
        { session: dbSession }
      );

      await dbSession.commitTransaction();
      console.log(`Wallet secured & updated for: ${userId}`);
    } catch (error) {
      await dbSession.abortTransaction();
      console.error(`Transaction Failed, Rollbacked: ${error.message}`);
      return res.status(500).send('Internal Server Error during processing');
    } finally {
      dbSession.endSession();
    }
  }

  res.json({ received: true });
};
