import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Box, BlockStack, Card, Button, Text, RadioButton } from '@shopify/polaris';
import measurementData from '../constants/measurementData.json';
import FitSureSize from '../components/fitSureSize';
import StandardSize from '../components/StandardSize';
import SpecifyCustom from '../components/SpecifyCustom';
import fitSureData from '../constants/fitSure.json'
import standardData from '../constants/standardCustom.json'
import specifyCustomData from '../constants/SpecifyCustom.json'
import { api } from "../api";

function MeasurementTypeSelector({ selected, orderDetails, onSave, radioGroupName }) {
  function getValidSelected(val) {
    if (val === undefined || val === null || val === "") {
      return measurementData[0].value;
    }
    return val;
  }
  const [internalSelected, setInternalSelected] = useState(getValidSelected(selected));
  const [measurementOptions, setMeasurementOptions] = useState();
  const [childData, setChildData] = useState(null);
  const fitSureRef = useRef();

  useEffect(() => {
    setInternalSelected(getValidSelected(selected));
  }, [selected]);

  useEffect(() => {
    if (orderDetails === null) {
      if (internalSelected === 'fitSure') {
        setMeasurementOptions(fitSureData.subOptions);
      } else if (internalSelected === 'standardSize') {
        setMeasurementOptions(standardData.subOptions);
      } else if (internalSelected === 'specifyCustom') {
        setMeasurementOptions(specifyCustomData.subOptions);
      }
    }
    else {
      setMeasurementOptions(orderDetails?.sizeData?.subOptions)
    }
  }, [orderDetails, internalSelected]);

  const handleTypeChange = (value) => {
    console.log('value', value);
    setInternalSelected(value);
    if (orderDetails === null) {
      if (value === 'fitSure') {
        setMeasurementOptions(fitSureData.subOptions);
      } else if (value === 'standardSize') {
        setMeasurementOptions(standardData.subOptions);
      } else if (value === 'specifyCustom') {
        setMeasurementOptions(specifyCustomData.subOptions);
      }
    } else {
      setMeasurementOptions(orderDetails?.sizeData?.subOptions);
    }
  };

  const handleDataFromChild = useCallback((data) => {
    setChildData(data);
  }, []);

  const handleSaveData = useCallback(() => {
    let latestData;
    if ((internalSelected === 'fitSure' || internalSelected === 'standardSize' || internalSelected === 'specifyCustom') && fitSureRef.current && typeof fitSureRef.current.childFunction === 'function') {
      latestData = fitSureRef.current.childFunction();
    }
    if (onSave) onSave(internalSelected, latestData);
  }, [internalSelected, onSave]);

  return (
    <Box>
      <Box style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '25px', paddingBottom: '10px' }}>
        <Text variant="headingLg" as="h4">Please fill in the measurement details.</Text>
        <Button onClick={handleSaveData} variant="primary">Save</Button>
      </Box>
      <Card>
        <BlockStack gap="200">
          {measurementData.map((option) => (
            <Box key={option.value}>
              <RadioButton
                label={option.label}
                checked={internalSelected === option.value}
                id={`${radioGroupName}-${option.value}`}
                name={radioGroupName}
                value={option.value}
                onChange={() => handleTypeChange(option.value)}
              />
            </Box>
          ))}
        </BlockStack>
      </Card>
      <BlockStack>
        <Card>
          {internalSelected === 'fitSure' && <FitSureSize ref={fitSureRef} fitSureDataProp={measurementOptions} onDataSubmit={handleDataFromChild} />}
          {internalSelected === 'standardSize' && <StandardSize ref={fitSureRef} standardDataProp={measurementOptions} onDataSubmit={handleDataFromChild} />}
          {internalSelected === 'specifyCustom' && <SpecifyCustom ref={fitSureRef} SpecifyCustomDataProp={measurementOptions} onDataSubmit={handleDataFromChild} />}
        </Card>
      </BlockStack>
    </Box>
  );
}

export default MeasurementTypeSelector;