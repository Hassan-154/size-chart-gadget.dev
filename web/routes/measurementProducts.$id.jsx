import React, { useState, useCallback, useEffect } from 'react';
import { RadioButton, Page, Box, BlockStack, Card, Text, LegacyCard, LegacyStack, Button, Collapsible, TextContainer, Link } from '@shopify/polaris';
import measurementData from '../constants/measurementData.json';
import { useFindFirst } from "@gadgetinc/react";
import { api } from "../api";
import { useParams } from "react-router"
import fitSureData from '../constants/fitSure.json'
import standardData from '../constants/standardCustom.json'
import specifyCustomData from '../constants/SpecifyCustom.json'
import MeasurementTypeSelector from './measurementUI';
import FullPageSpinner from '../components/FullPageSpinner';

function measurementProducts() {

  const [selectedItems, setSelectedItems] = useState({}); // Track selections per item
  const [measurementDataPerItem, setMeasurementDataPerItem] = useState({});
  const [loading, setLoading] = useState(false);

  const [measurementOptions, setMeasurementOptions] = useState(fitSureData.subOptions);
  const { id: orderIdParam } = useParams();

  const [
    {
      data: orderDetails,
      fetching: isOrderFetching,
      error: orderFetchError,
    },
    refetchOrderDetails,
  ] = useFindFirst(api.shopifyOrder, {
    filter: {
      name: { equals: `#${orderIdParam}` }
    },
    select: {
      name: true,
      customer: {
        id: true,
      },
      lineItems: {
        edges: {
          node: {
            id: true,
            name: true,
            title: true,
            quantity: true,
            price: true,
            sizeMeasurement: {
              id: true,
              sizeData: true,
            }
          }
        }
      }
    }
  });


  useEffect(() => {
    if (orderDetails) {
      //   console.log('order details.', orderDetails)
      setMeasurementOptions(orderDetails)
    }
  }, [orderDetails]);


  const handleChange = useCallback((_checked, newValue, itemId) => {
    setSelectedItems(prev => ({
      ...prev,
      [itemId]: newValue
    }));

    let defaultSubOptions;
    if (newValue === 'fitSure') {
      defaultSubOptions = fitSureData.subOptions;
    } else if (newValue === 'standardSize') {
      defaultSubOptions = standardData.subOptions;
    } else if (newValue === 'specifyCustom') {
      defaultSubOptions = specifyCustomData.subOptions;
    }

    setMeasurementDataPerItem(prev => ({
      ...prev,
      [itemId]: defaultSubOptions
    }));
  }, []);

  // Add the handleSave function
  const handleSave = useCallback(async (nodeId, selectedValue, formData, sizeMeasurementId) => {

    console.log("formData", formData);
    console.log("selectedValue", selectedValue);
    console.log("sizeMeasurementId", sizeMeasurementId);
    console.log("nodeId", nodeId);

    const dataReadyToUpdate = {
      value: selectedValue,
      subOptions: {
        ...formData
      }
    };

    if (formData !== undefined) {
      console.log("trying to submit data");
      try {
        setLoading(true);
        let result;
        if (sizeMeasurementId) {
          result = await api.sizeMeasurement.update(sizeMeasurementId, {
            sizeData: { ...dataReadyToUpdate }
          });
          shopify.toast.show("Measurement details updated successfully!");
          console.log("Data updated successfully:", result);
        } else {
          result = await api.sizeMeasurement.create({
            orderSelectedMeasurement: {
              _link: nodeId,
            },
            sizeData: { ...dataReadyToUpdate }
          });
          shopify.toast.show("Measurement details created successfully!");
          console.log("Data created successfully:", result);
        }
      } catch (error) {
        const message = error.message || (error.response?.errors?.[0]?.message) || "Failed to submit measurement details";
        shopify.toast.show(message, { isError: true });
        console.log("Failed to submit data:", error);
      }
      finally {
        setLoading(false);
        refetchOrderDetails()
      }
    }
  }, []);

  const [open, setOpen] = useState({});
  const handleToggle = useCallback((id) => {
    setOpen(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  }, []);

  return (
    <Page title={`Order ${orderIdParam}`}>
      {(isOrderFetching || loading) && (
        <FullPageSpinner />
      )}
      <BlockStack gap={600}>
        {orderDetails?.lineItems?.edges.map(({ node }) => {
          const initialValue = node.sizeMeasurement?.sizeData?.value || measurementData[0].value;

          return (
            <Card key={node.id} borderColor="border">
              <Box style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                <Box style={{ display: 'flex', alignItems: 'center' }}>
                  <Box></Box>
                  <Box>
                    <Text as="p" variant="bodyMd" fontWeight="semibold">
                      {node.name}
                    </Text>
                    <Text as="p" variant="bodyMd">
                      Price: ${node.price}
                    </Text>
                  </Box>
                </Box>
                <Text as="p" variant="bodyMd">
                  Quantity: {node.quantity}
                </Text>
              </Box>

              <Box style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
                <Button
                  onClick={() => handleToggle(node.id)}
                  ariaExpanded={!!open[node.id]}
                  ariaControls={`collapsible-${node.id}`}
                >
                  {open[node.id] ? "Hide Measurement" : "Show Measurement"}
                </Button>
              </Box>
              <Collapsible
                open={!!open[node.id]}
                id={`collapsible-${node.id}`}
                transition={{ duration: '500ms', timingFunction: 'ease-in-out' }}
                expandOnPrint
              >
                <MeasurementTypeSelector
                  selected={selectedItems[node.id] ?? initialValue}
                  orderDetails={measurementDataPerItem[node.id] || node.sizeMeasurement}
                  onSave={(selectedValue, formData) => handleSave(node.id, selectedValue, formData, node.sizeMeasurement?.id)}
                  radioGroupName={`measurementType-${node.id}`}
                />
              </Collapsible>
            </Card>
          );
        })}
      </BlockStack>

    </Page>
  );
}

export default measurementProducts;