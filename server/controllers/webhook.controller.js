import Shopify from "@shopify/shopify-api";

class WebhookController {
  registerWebhook = async (ctx) => {
    console.log(ctx);
    try {
      await Shopify.Webhooks.Registry.process(ctx.req, ctx.res);
      console.log(`Webhook processed, returned status code 200`);
    } catch (error) {
      console.log(`Failed to process webhook: ${error}`);
    }
  };
}

const webhookController = new WebhookController();

export default webhookController;
