import { container, inject, injectable } from 'tsyringe';
import Stripe from 'stripe';
import { EnvConfiguration } from '../utils';

@injectable()
export default class StripeController {
    private stripe: Stripe;
  private _envConfiguration: EnvConfiguration;
  constructor(@inject(EnvConfiguration) envConfiguration: EnvConfiguration) {
    this._envConfiguration = envConfiguration;
    this.stripe = new Stripe(this._envConfiguration.STRIPE_SECRET_KEY, {
        apiVersion: '2025-05-28.basil',
      });
  }


  async createCheckoutSession(userId: string, amount: number, title: string, successUrl: string, cancelUrl: string) {
    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: title,
            },
            unit_amount: amount,  // Amount in cents (e.g., $10 → 1000)
          },
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId: userId,          // ✅ Metadata directly on the session
      },
      payment_intent_data: { metadata: { userId: userId } }
    });

    return session.url;
  }


  public async createPaymentSession(req, res) {
    const {userId, amount, title, successUrl, cancelUrl} = req.body
    console.log('ussr id being sent', userId)
    const sessionUrl = await this.createCheckoutSession(
        userId,
        amount,
        title,
        successUrl,
        cancelUrl
    )
    return res.status(200).json({ url: sessionUrl })
}

  public async createEvent(req){
        const sig = req.headers['stripe-signature']!;
        const webhookSecret = this._envConfiguration.STRIPE_WEBHOOK_SECRET;
    
        let event = this.stripe.webhooks.constructEvent(
            req.body,
            sig,
            webhookSecret
          );

       return event
    }

  public async getPaymentIntent(paymentIntentId){
    try{
    return this.stripe.paymentIntents.retrieve(paymentIntentId)
    }catch(err){
        console.error('An error has occured', err)
    }
  }

}


export const registerStripeControllerDI = () => {
    container.register(StripeController.name, { useClass: StripeController })
}