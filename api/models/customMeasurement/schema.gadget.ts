import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "customMeasurement" model, go to https://size-chart.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "umOVqnNeAS10",
  fields: {
    armLength: { type: "number", storageKey: "adCwvb-qXGw3" },
    armhole: { type: "number", storageKey: "N_JnCwklUbvD" },
    bicep: { type: "number", storageKey: "iK4NTSQvzDoW" },
    chest: { type: "number", storageKey: "LZMmpNJzuyYD" },
    hips: { type: "number", storageKey: "kRJFo1J_bayX" },
    measurementType: {
      type: "enum",
      default: "Shirt Measurement",
      acceptMultipleSelections: false,
      acceptUnlistedOptions: false,
      options: ["Shirt Measurement", "Body Measurement"],
      storageKey: "fO2gWQ4s2zDi",
    },
    name: { type: "string", storageKey: "XHSIaM7PhUgt" },
    neck: { type: "number", storageKey: "2y_VkC-8wJXE" },
    orderSelectedMeasuement: {
      type: "belongsTo",
      parent: { model: "shopifyOrderLineItem" },
      storageKey: "n_9HSv7VLfo-",
    },
    shirtLength: { type: "number", storageKey: "6MCg9545BBnj" },
    shoulder: { type: "number", storageKey: "T7vj0_VcQfuw" },
    sleeveLength: { type: "number", storageKey: "FE89SwX2jKqT" },
    waist: { type: "number", storageKey: "MJrMwAx4Q50Z" },
    wrist: { type: "number", storageKey: "rXERK1nhcHxe" },
  },
};
