import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "customMeasurement" model, go to https://size-chart.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "umOVqnNeAS10",
  fields: {
    armLength: { type: "number", storageKey: "adCwvb-qXGw3" },
    chest: { type: "number", storageKey: "LZMmpNJzuyYD" },
    name: { type: "string", storageKey: "XHSIaM7PhUgt" },
    orderSelectedMeasuement: {
      type: "belongsTo",
      parent: { model: "shopifyOrderLineItem" },
      storageKey: "n_9HSv7VLfo-",
    },
    shoulderWidth: { type: "number", storageKey: "T7vj0_VcQfuw" },
    waist: { type: "number", storageKey: "MJrMwAx4Q50Z" },
  },
};
