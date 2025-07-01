import { useState, useCallback, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Select, Box, Text, BlockStack, InlineGrid, TextField } from '@shopify/polaris';
import measurementData from '../constants/measurementData.json';

const SpecifyCustom = forwardRef(({SpecifyCustomDataProp}, ref) => {

  const [data, setData] = useState(measurementData[2]?.subOptions ?? {});
  const measurements = measurementData[2]?.subOptions?.measurementsInches ?? [];

  const [specifyCustomData, setSpecifyCustomData] = useState({});
  const [errors, setErrors] = useState({});

  console.log('specifyCustom data from child component.', specifyCustomData)

  useEffect(() => {
    if (SpecifyCustomDataProp) {
      setSpecifyCustomData(SpecifyCustomDataProp)
    }
  }, [SpecifyCustomDataProp]);

  const handleSelectDropDown = useCallback(
    (type, value) => {
      setSpecifyCustomData(prev => ({
        ...prev,
        [type]: value
      }));
    },
    []
  );

  const handleMeasurementChange = useCallback((measurementKey, value) => {
    setSpecifyCustomData(prev => ({
      ...prev,
      measurementsInches: {
        ...prev.measurementsInches,
        [measurementKey]: value
      }
    }));
    // Clear error when user enters a value
    if (errors[measurementKey]) {
      setErrors(prev => ({
        ...prev,
        [measurementKey]: ''
      }));
    }
  }, [errors]);

  const handleSaveData = useCallback(() => {
    const newErrors = {};

    // Check if measurement type is selected
    if (!specifyCustomData?.measurementType || specifyCustomData.measurementType === '') {
      newErrors.measurementType = '* Required';
    }

    // Check all measurement fields
    measurements.forEach((measurement) => {
      if (!specifyCustomData?.measurementsInches?.[measurement.value] || specifyCustomData.measurementsInches[measurement.value] === '') {
        newErrors[measurement.value] = '* Required (number only)';
      }
    });

    setErrors(newErrors);

    // If no errors, proceed with saving
    if (Object.keys(newErrors).length === 0) {
      console.log('data is ready to process of specifyCustom')
      return specifyCustomData;
    }
    return undefined;
  }, [specifyCustomData, measurements]);

  useImperativeHandle(ref, () => ({
    childFunction: handleSaveData
  }), [handleSaveData]);

  return (
    <Box>
      <BlockStack gap="500">
        <Box style={{ maxWidth: '350px' }}>
          <BlockStack gap="200">
            <Text variant="headingMd" as="h2">Measurement Type</Text>
            <InlineGrid gap="200" columns={(data.measurementType ?? []).length}>
              {(data.measurementType ?? []).map((fit, idx) => (
                <Box
                  key={idx}
                  style={{
                    border: specifyCustomData?.measurementType === fit.value ? '3px solid #8a8a8a' : '1px solid #d1d1d1',
                    borderRadius: '7px',
                    padding: '9px 0px',
                    display: 'inline-block',
                    textAlign: 'center',
                    cursor: 'pointer'
                  }}
                  onClick={() => handleSelectDropDown('measurementType', fit.value)}
                >
                  {fit.label}
                </Box>
              ))}
            </InlineGrid>
            {errors.measurementType && (
              <Text tone="critical" variant="bodySm">
                {errors.measurementType}
              </Text>
            )}
          </BlockStack>
        </Box>
        <Box>
          <BlockStack gap="200">
            <Text variant="headingMd" as="h2">Measurements (Inches)</Text>
            <InlineGrid gap="200" columns={4}>
              {measurements.map((measurement, idx) => (
                <TextField
                  key={idx}
                  label={measurement.label}
                  value={specifyCustomData?.measurementsInches?.[measurement.value] || ""}
                  onChange={(value) => handleMeasurementChange(measurement.value, value)}
                  type="number"
                  autoComplete="off"
                  error={errors[measurement.value]}
                />
              ))}
            </InlineGrid>
          </BlockStack>
        </Box>
      </BlockStack>
    </Box>
  )
})

export default SpecifyCustom