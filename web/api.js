// Sets up the API client for interacting with your backend.
// For your API reference, visit: https://docs.gadget.dev/api/size-chart
import { Client } from "@gadget-client/size-chart";

export const api = new Client({ environment: window.gadgetConfig.environment });