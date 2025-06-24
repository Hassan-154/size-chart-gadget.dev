import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "session" model, go to https://size-chart.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "f6hMxE8FBPFl",
  fields: {
    roles: {
      type: "roleList",
      default: ["unauthenticated"],
      storageKey: "4-ATh7pEqN66",
    },
  },
  shopify: { fields: ["shop", "shopifySID"] },
};
