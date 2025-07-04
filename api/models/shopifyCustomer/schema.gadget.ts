import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "shopifyCustomer" model, go to https://size-chart.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "DataModel-Shopify-Customer",
  fields: {
    customMeasurements: {
      type: "hasMany",
      children: {
        model: "customMeasurement",
        belongsToField: "customer",
      },
      storageKey: "cMKqtFHxJeXL",
    },
  },
  shopify: {
    fields: [
      "acceptsMarketing",
      "acceptsMarketingUpdatedAt",
      "amountSpent",
      "canDelete",
      "currency",
      "dataSaleOptOut",
      "displayName",
      "email",
      "emailMarketingConsent",
      "firstName",
      "hasTimelineComment",
      "lastName",
      "lastOrder",
      "lastOrderName",
      "legacyResourceId",
      "lifetimeDuration",
      "locale",
      "marketingOptInLevel",
      "multipassIdentifier",
      "note",
      "numberOfOrders",
      "orders",
      "phone",
      "productSubscriberStatus",
      "shop",
      "shopifyCreatedAt",
      "shopifyState",
      "shopifyUpdatedAt",
      "smsMarketingConsent",
      "statistics",
      "tags",
      "taxExempt",
      "taxExemptions",
      "unsubscribeUrl",
      "validEmailAddress",
      "verifiedEmail",
    ],
  },
};
