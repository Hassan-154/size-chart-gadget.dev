import React from 'react'
import { Button, Page, Box, BlockStack, Card, Text } from '@shopify/polaris';
import { useFindMany } from '@gadgetinc/react';
import { api } from '../api';

function allSizesProfile() {
    const [{ data: sizeMeasurements, fetching, error }] = useFindMany(api.sizeMeasurement, {
        select: {
            id: true,
            sizeData: true,
            createdAt: true,
            updatedAt: true,
            orderSelectedMeasurementId: true
        }
    });

    console.log('Size Measurements:', sizeMeasurements);

    return (
        <Page
            title="All Sizes Profile"
            primaryAction={<Button variant="primary">Save</Button>}
        >
           
        </Page>
    )
}

export default allSizesProfile