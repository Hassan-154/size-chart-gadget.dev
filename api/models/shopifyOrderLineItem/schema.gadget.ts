import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "shopifyOrderLineItem" model, go to https://size-chart.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "DataModel-Shopify-OrderLineItem",
  fields: {
    customMeasurement: {
      type: "hasOne",
      child: {
        model: "customMeasurement",
        belongsToField: "orderSelectedMeasuement",
      },
      storageKey: "Xle80Q5aONCP",
    },
  },
  shopify: {
    fields: [
      "attributedStaffs",
      "currentQuantity",
      "discountAllocations",
      "discountedTotalSet",
      "discountedUnitPriceAfterAllDiscountsSet",
      "discountedUnitPriceSet",
      "fulfillableQuantity",
      "fulfillmentLineItems",
      "fulfillmentService",
      "fulfillmentStatus",
      "giftCard",
      "grams",
      "merchantEditable",
      "name",
      "nonFulfillableQuantity",
      "order",
      "originalTotalSet",
      "price",
      "priceSet",
      "productExists",
      "properties",
      "quantity",
      "refundableQuantity",
      "requiresShipping",
      "restockable",
      "shop",
      "sku",
      "taxLines",
      "taxable",
      "title",
      "totalDiscount",
      "totalDiscountSet",
      "unfulfilledDiscountedTotalSet",
      "unfulfilledOriginalTotalSet",
      "unfulfilledQuantity",
      "variantInventoryManagement",
      "variantTitle",
      "vendor",
    ],
  },
};
