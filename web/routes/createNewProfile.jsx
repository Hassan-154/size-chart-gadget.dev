import React, { useState } from 'react'
import MeasurementTypeSelector from './measurementUI';
import { api } from "../api";
import FullPageSpinner from '../components/FullPageSpinner';
import { Page } from '@shopify/polaris';

function createNewProfile() {
  const [loading, setLoading] = useState(false);

  const handleSave = async (selectedValue, formData) => {
    const dataReadyToCreate = {
      value: selectedValue,
      subOptions: {
        ...formData
      }
    };

    if (formData !== undefined) {
      try {
        setLoading(true);
        const result = await api.sizeMeasurement.create({
          orderSelectedMeasurement: {
            _link: null,
          },
          sizeData: { ...dataReadyToCreate }
        });
        console.log("New size is created successfully:", result);
      } catch (error) {
        const message = error.message || (error.response?.errors?.[0]?.message) || "Failed to submit measurement details";
        console.log("Failed to create new size:", error, message);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Page>
      {loading && <FullPageSpinner />}
      <MeasurementTypeSelector
        selected={undefined}
        orderDetails={null}
        onSave={handleSave}
        radioGroupName="createNewProfile"
      />
    </Page>
  );
}

export default createNewProfile