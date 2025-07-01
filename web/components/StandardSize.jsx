import { useState, useCallback, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Select, Box, Text, BlockStack, InlineGrid, TextField } from '@shopify/polaris';
import measurementData from '../constants/measurementData.json';

const StandardSize = forwardRef(({ standardDataProp }, ref) => {

    const [data, setData] = useState(measurementData[1]?.subOptions ?? {});
    const [standardData, setStandardData] = useState();
    const [errors, setErrors] = useState({});

    useEffect(() => {

      if (standardDataProp) {
        setStandardData(standardDataProp)
      }
    }, [standardDataProp]);
  
    console.log('standard data from child component.', standardData)

    const handleSelectDropDown = useCallback(
      (type, value) => {
        setStandardData(prev => ({
          ...prev,
          [type]: value
        }));
        // Clear all errors when user selects any value
        setErrors({});
      },
      []
    );

    const handleSaveData = useCallback(() => {
      const newErrors = {};

      // Check all required fields
      if (!standardData?.collarSize || standardData.collarSize === '') {
        newErrors.collarSize = '* Required';
      }

      if (!standardData?.sleeveLength || standardData.sleeveLength === '') {
        newErrors.sleeveLength = '* Required';
      }

      if (!standardData?.shirtLength || standardData.shirtLength === '') {
        newErrors.shirtLength = '* Required';
      }

      setErrors(newErrors);

      // If no errors, proceed with saving
      if (Object.keys(newErrors).length === 0) {
        console.log('okay now data is ready to process')
        return standardData;
      }
      return undefined;
    }, [standardData]);

    useImperativeHandle(ref, () => ({
      childFunction: handleSaveData
    }));

  return (
    <Box>
     <BlockStack gap="500">
     <Select
          label="Collar Size"
          placeholder="Select"
          options={
            (data.collarSize ?? []).map((value) => ({
              label: value.toString(),
              value: value,
            }))
          }
          onChange={(value) => handleSelectDropDown('collarSize', value)}
          value={standardData?.collarSize || ""}
          error={errors.collarSize}
        />
        <Select
          label="Sleeve Length"
          placeholder="Select"
          options={
            (data.sleeveLength ?? []).map((value) => ({
              label: value.toString(),
              value: value,
            }))
          }
          onChange={(value) => handleSelectDropDown('sleeveLength', value)}
          value={standardData?.sleeveLength || ""}
          error={errors.sleeveLength}
        />
        <Select
          label="Shirt Length"
          placeholder="Select"
          options={
            (data.shirtLength ?? []).map((value) => ({
              label: value.toString(),
              value: value,
            }))
          }
          onChange={(value) => handleSelectDropDown('shirtLength', value)}
          value={standardData?.shirtLength || ""}
          error={errors.shirtLength}
        />
     </BlockStack>
    </Box>
  )
});

export default StandardSize