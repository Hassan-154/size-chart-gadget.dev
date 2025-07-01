import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Box, BlockStack, Card, Button, Text } from '@shopify/polaris';
import FitSureSize from '../components/fitSureSize';
import StandardSize from '../components/StandardSize';
import SpecifyCustom from '../components/SpecifyCustom';
import fitSureData from '../constants/fitSure.json'
import standardData from '../constants/standardCustom.json'
import specifyCustomData from '../constants/SpecifyCustom.json'

function MeasurementTypeSelector({ selected, orderDetails, onSave }) {

  const [measurementOptions, setMeasurementOptions] = useState();
  const [childData, setChildData] = useState(null);
  const fitSureRef = useRef();

  useEffect(() => {
    console.log("orderDetails", orderDetails)
    if (orderDetails === null) {
      if (selected === 'fitSure') {
        setMeasurementOptions(fitSureData.subOptions);
      } else if (selected === 'standardSize') {
        setMeasurementOptions(standardData.subOptions);
      } else if (selected === 'specifyCustom') {
        setMeasurementOptions(specifyCustomData.subOptions);
      }
    }
    else {
      setMeasurementOptions(orderDetails?.sizeData?.subOptions)
    }
  }, [orderDetails, selected]);

  const handleDataFromChild = useCallback((data) => {
    setChildData(data);
    console.log('Data received from child component after error handling:', data);
    const dataReadyToUpdate = {
      "value": selected,
      "subOptions":
      {
        ...data
      }
    }
    console.log("data is ready to update", dataReadyToUpdate)
  }, [selected]);

  const handleSaveData = useCallback(() => {
    let latestData;
    if ((selected === 'fitSure' || selected === 'standardSize' || selected === 'specifyCustom') && fitSureRef.current && typeof fitSureRef.current.childFunction === 'function') {
      latestData = fitSureRef.current.childFunction();
    }
    if (onSave) onSave(selected, latestData);
  }, [selected, onSave]);

  return (
   
      <Box style={{  }}>
      <Box style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '25px', paddingBottom: '10px' }}>
      <Text variant="headingLg" as="h4">Please fill in the measurement details.</Text>
        <Button onClick={handleSaveData} variant="primary">Save</Button>
      </Box>
        <BlockStack>
          <Card>
            {selected === 'fitSure' && <FitSureSize ref={fitSureRef} fitSureDataProp={measurementOptions} onDataSubmit={handleDataFromChild} />}
            {selected === 'standardSize' && <StandardSize ref={fitSureRef} standardDataProp={measurementOptions} onDataSubmit={handleDataFromChild} />}
            {selected === 'specifyCustom' && <SpecifyCustom ref={fitSureRef} SpecifyCustomDataProp={measurementOptions} onDataSubmit={handleDataFromChild} />}
          </Card>
        </BlockStack>
      </Box>
    
  );
}

export default MeasurementTypeSelector;