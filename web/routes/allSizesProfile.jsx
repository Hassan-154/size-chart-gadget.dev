import React, { useEffect } from 'react'
import { Button, Page, Card, Text, InlineGrid } from '@shopify/polaris';
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

    useEffect(() => {
        if (sizeMeasurements) {
            console.log('Size Measurements:', sizeMeasurements);
        }
    }, [sizeMeasurements]);

    return (
        <Page
            title="All Sizes Profile"
            primaryAction={<Button variant="primary" url="/createNewProfile">Create</Button>}
        >
            <InlineGrid columns={3} gap="400">
                {sizeMeasurements?.map((measurement) => (
                    <Card key={measurement.id} sectioned>
                        <Text variant="headingSm">{measurement.sizeData?.value || "No value"}</Text>
                        {/* Add more fields from measurement.sizeData here later if needed */}
                    </Card>
                ))}
            </InlineGrid>
        </Page>
    )
}

export default allSizesProfile