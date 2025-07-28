import { container, inject, injectable } from "tsyringe";
import StripeController from "../controllers/stripeController";
import Stripe from "stripe";
import { UserController } from "../controllers/userController";
import { Request, Response } from "express";
import { NotificationService } from "../utils/messaging";

@injectable()
export default class StripeWebhookController {
  private _userController: UserController;
  private _stripeClient: StripeController;
  private _notificationService: NotificationService
  constructor(
    @inject(UserController) userController: UserController,
    @inject(NotificationService) notificationService: NotificationService,
    @inject(StripeController) _stripeClient: StripeController) {
    this._userController = userController;
    this._notificationService = notificationService;
    this._stripeClient = _stripeClient
  }



  async handleStripeWebhook(req, res) {

    let event: Stripe.Event;

    try {
      event = await this._stripeClient.createEvent(req)
    } catch (err) {
      console.error('Webhook signature verification failed.', err);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }


    // ✅ Handle the specific event types
    switch (event.type) {
      case 'checkout.session.completed':

        const paymentIntent = await this._stripeClient.getPaymentIntent(event.data.object.payment_intent)

        const userId = paymentIntent.metadata.userId
        const paymentStatus = event.data.object.payment_status


        const email = paymentIntent.metadata.email
        const course = paymentIntent.metadata.course_id

        if (course && email) {
          await this._notificationService.sendPDFEmail(email, 'Heres Your Course', 'Enjoy your day', course)
          return res.status(200).json({ message: 'Recieved' });
        }



        if (!userId || !paymentStatus) {
          console.error('❌ Missing userId or paymentStatus in session metadata');
          return res.status(400).json({ error: 'Invalid webhook payload' });
        }

        try {
          const updated = await this._userController.updateUserToPaid(userId, paymentStatus);
          if (!updated) {
            console.error('❌ Failed to update user');
            return res.status(500).json({ error: 'User update failed' });
          }
          console.log('✅ User updated to paid');
        } catch (err) {
          console.error('❌ Error updating user:', err);
          return res.status(500).json({ error: 'Internal server error' });
        }

        break;

      // Add more event types as needed
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return res.status(200).json({ received: true });
  }
}


export const registerStripeWebhookControllerDI = () => {
  container.register(StripeWebhookController.name, {
    useClass: StripeWebhookController,
  });
};
