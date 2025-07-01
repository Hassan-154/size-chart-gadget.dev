import { useState, useCallback, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Select, Box, Text, BlockStack, InlineGrid, TextField } from '@shopify/polaris';
import measurementData from '../constants/measurementData.json';

const FitSureSize = forwardRef(({ fitSureDataProp, onDataSubmit }, ref) => {
  // Store FitSure subOptions in state for easy access
  const [fitSureOptions, setFitSureOptions] = useState(measurementData[0]?.subOptions ?? {});
  const [fitSureData, setFitSureData] = useState();
  const [errors, setErrors] = useState({});

  useEffect(() => {

    if (fitSureDataProp) {
      setFitSureData(fitSureDataProp)
    }
  }, [fitSureDataProp]);

  const handleSelectDropDown = useCallback(
    (type, value) => {
      setFitSureData(prev => ({
        ...prev,
        [type]: value
      }));
      // Clear error when user selects a value
      if (errors[type]) {
        setErrors(prev => ({
          ...prev,
          [type]: ''
        }));
      }
    },
    [errors]
  );

  const handleSaveData = useCallback(() => {
    const newErrors = {};

    // Check all required fields
    if (!fitSureData?.height || fitSureData.height === '') {
      newErrors.height = '* Required';
    }

    if (!fitSureData?.tShirtSize || fitSureData.tShirtSize === '') {
      newErrors.tShirtSize = '* Required';
    }

    if (!fitSureData?.pantsWaist || fitSureData.pantsWaist === '') {
      newErrors.pantsWaist = '* Required (number only)';
    }

    if (!fitSureData?.collarSize || fitSureData.collarSize === '') {
      newErrors.collarSize = '* Required (number only)';
    }

    if (!fitSureData?.sleeveLength || fitSureData.sleeveLength === '') {
      newErrors.sleeveLength = '* Required';
    }

    if (!fitSureData?.belly || fitSureData.belly === '') {
      newErrors.belly = '* Required';
    }

    if (!fitSureData?.preferredFit || fitSureData.preferredFit === '') {
      newErrors.preferredFit = '* Required';
    }

    if (!fitSureData?.personalPrefer || fitSureData.personalPrefer === '') {
      newErrors.personalPrefer = '* Required';
    }

    setErrors(newErrors);

    // If no errors, proceed with saving
    if (Object.keys(newErrors).length === 0) {
      console.log('send the data to parent component after all the error handling')
      // Pass the data to parent component
      if (onDataSubmit && typeof onDataSubmit === 'function') {
        onDataSubmit(fitSureData);
      }
      return fitSureData;
    }
    return undefined;
  }, [fitSureData, onDataSubmit]);

  useImperativeHandle(ref, () => ({
    childFunction: handleSaveData
  }));

  return (
      <BlockStack gap="500">
        <Select
          label="What is your height?"
          placeholder="Select"
          options={
            (fitSureOptions.height ?? []).map((value) => ({
              label: value.toString(),
              value: value,
            }))
          }
          onChange={(value) => handleSelectDropDown('height', value)}
          value={fitSureData?.height || ""}
          error={errors.height}
        />
        <Box style={{ maxWidth: '600px' }}>
          <BlockStack gap="200">
            <Text>What's your T-shirt size?</Text>
            <InlineGrid gap="200" columns={(fitSureOptions.tShirtSize ?? []).length}>
              {(fitSureOptions.tShirtSize ?? []).map((size, idx) => (
                <Box
                  key={idx}
                  style={{
                    border: fitSureData?.tShirtSize === size ? '3px solid #8a8a8a' : '1px solid #d1d1d1',
                    borderRadius: '7px',
                    padding: '9px 0px',
                    display: 'inline-block',
                    textAlign: 'center',
                    cursor: 'pointer',

                  }}
                  onClick={() => handleSelectDropDown('tShirtSize', size)}
                >
                  {size}
                </Box>
              ))}
            </InlineGrid>
            {errors.tShirtSize && (
              <Text tone="critical" variant="bodySm">
                {errors.tShirtSize}
              </Text>
            )}
          </BlockStack>
        </Box>
        <TextField
          label="What waist do you wear in pants?"
          value={fitSureData?.pantsWaist || ""}
          type='number'
          onChange={(value) => {
            setFitSureData(prev => ({
              ...prev,
              pantsWaist: value
            }));
            if (errors.pantsWaist) {
              setErrors(prev => ({
                ...prev,
                pantsWaist: ''
              }));
            }
          }}
          autoComplete="off"
          error={errors.pantsWaist}
        />
        <TextField
          label="What's your collar size?"
          value={fitSureData?.collarSize || ""}
          onChange={(value) => {
            setFitSureData(prev => ({
              ...prev,
              collarSize: value
            }));
            if (errors.collarSize) {
              setErrors(prev => ({
                ...prev,
                collarSize: ''
              }));
            }
          }}
          type='number'
          autoComplete="off"
          error={errors.collarSize}
        />
        <Select
          label="What's your sleeve length"
          placeholder="Select"
          options={
            (fitSureOptions.sleeveLength ?? []).map((value) => ({
              label: value.toString(),
              value: value,
            }))
          }
          onChange={(value) => handleSelectDropDown('sleeveLength', value)}
          value={fitSureData?.sleeveLength || ""}
          error={errors.sleeveLength}
        />
        <Box style={{ maxWidth: '600px' }}>
          <BlockStack gap="200">
            <Text>Which option describes your belly?</Text>
            <InlineGrid gap="200" columns={(fitSureOptions.belly ?? []).length}>
              {(fitSureOptions.belly ?? []).map((belly, idx) => (
                <Box
                  key={idx}
                  style={{
                    border: fitSureData?.belly === belly.value ? '3px solid #8a8a8a' : '1px solid #d1d1d1',
                    borderRadius: '7px',
                    padding: '9px 0px',
                    display: 'inline-block',
                    textAlign: 'center',
                    cursor: 'pointer'
                  }}
                  onClick={() => handleSelectDropDown('belly', belly.value)}
                >
                  {belly.label}
                </Box>
              ))}
            </InlineGrid>
            {errors.belly && (
              <Text tone="critical" variant="bodySm">
                {errors.belly}
              </Text>
            )}
          </BlockStack>
        </Box>
        <Box style={{ maxWidth: '600px' }}>
          <BlockStack gap="200">
            <Text>Select your preferred fit.</Text>
            <InlineGrid gap="200" columns={(fitSureOptions.preferredFit ?? []).length}>
              {(fitSureOptions.preferredFit ?? []).map((fit, idx) => (
                <Box
                  key={idx}
                  style={{
                    border: fitSureData?.preferredFit === fit.value ? '3px solid #8a8a8a' : '1px solid #d1d1d1',
                    borderRadius: '7px',
                    padding: '9px 0px',
                    display: 'inline-block',
                    textAlign: 'center',
                    cursor: 'pointer'
                  }}
                  onClick={() => handleSelectDropDown('preferredFit', fit.value)}
                >
                  {fit.label}
                </Box>
              ))}
            </InlineGrid>
            {errors.preferredFit && (
              <Text tone="critical" variant="bodySm">
                {errors.preferredFit}
              </Text>
            )}
          </BlockStack>
        </Box>
        <Box style={{ maxWidth: '600px' }}>
          <BlockStack gap="200">
            <Text>How would you like to wear your shirt?</Text>
            <InlineGrid gap="200" columns={(fitSureOptions.personalPrefer ?? []).length}>
              {(fitSureOptions.personalPrefer ?? []).map((prefer, idx) => (
                <Box
                  key={idx}
                  style={{
                    border: fitSureData?.personalPrefer === prefer.value ? '3px solid #8a8a8a' : '1px solid #d1d1d1',
                    borderRadius: '7px',
                    padding: '9px 0px',
                    display: 'inline-block',
                    textAlign: 'center',
                    cursor: 'pointer'
                  }}
                  onClick={() => handleSelectDropDown('personalPrefer', prefer.value)}
                >
                  {prefer.label}
                </Box>
              ))}
            </InlineGrid>
            {errors.personalPrefer && (
              <Text tone="critical" variant="bodySm">
                {errors.personalPrefer}
              </Text>
            )}
          </BlockStack>
        </Box>
      </BlockStack>
  );
});

export default FitSureSize;