import {
  IndexTable,
  Card,
  IndexFilters,
  useSetIndexFiltersMode,
  useIndexResourceState,
  Text,
  Badge,
  IndexFiltersMode,
  useBreakpoints,
  Page,
  Icon,
  Modal,
  Spinner,
  Layout,
  InlineStack,
  Button
} from "@shopify/polaris";
import { useParams, useNavigate } from "react-router"
import { useState, useCallback, useEffect } from "react";
import { EditIcon, DeleteIcon } from "@shopify/polaris-icons";
import { useFindFirst } from "@gadgetinc/react";
import { api } from "../api";
import MeasurementModal from "./measurementModal";

function CustomerOrderDetailsPage() { 
  const [isTableLoading, setIsTableLoading] = useState(false);
  const [isInitialDataLoading, setIsInitialDataLoading] = useState(true);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [sortOrder, setSortOrder] = useState(["createdAt desc"]);
  const [paginationInfo, setPaginationInfo] = useState(null);
  const [isMeasurementModalOpen, setIsMeasurementModalOpen] = useState(false);
  const [selectedLineItem, setSelectedLineItem] = useState(null);

  const navigate = useNavigate();
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
            customMeasurement: {
              id: true,
              name: true,
              measurementType: true,
              armLength: true,
              armhole: true,
              bicep: true,
              chest: true,
              hips: true,
              neck: true,
              shirtLength: true,
              shoulder: true,
              sleeveLength: true,
              waist: true,
              wrist: true,
            }
          }
        }
      }
    }
  });

  console.log(orderDetails)

  console.log('order fetch details', orderFetchError)

  useEffect(() => {
    if (orderDetails) {
      setIsInitialDataLoading(false);
      setHasLoadedOnce(true);
    }
  }, [orderDetails]);

  const goToNextPage = () => { };
  const goToPreviousPage = () => { };

  const [isDeleteModalActive, setIsDeleteModalActive] = useState(false);
  const toggleDeleteModal = useCallback(() => setIsDeleteModalActive((active) => !active), []);

  const tableSortOptions = [
    { label: "Order Name", value: "name asc", directionLabel: "A-Z" },
    { label: "Order Name", value: "name desc", directionLabel: "Z-A" },
    { label: "Date", value: "createdAt asc", directionLabel: "Ascending" },
    { label: "Date", value: "createdAt desc", directionLabel: "Descending" },
  ];
  const { mode: filterMode, setMode: setFilterMode } = useSetIndexFiltersMode(IndexFiltersMode.Filtering);

  const lineItemIds = orderDetails?.lineItems?.edges?.map(({ node }) => node.id) || [];
  const { selectedResources, allResourcesSelected, handleSelectionChange } = useIndexResourceState(lineItemIds);

  const lineItemRows = orderDetails?.lineItems?.edges?.map(({ node }, index) => {
    const { id, name, title, quantity, price, customMeasurement } = node;
    return (
      <IndexTable.Row
        id={id}
        key={id}
        selected={selectedResources.includes(id)}
        position={index}
        onClick={(event) => {
          if (event) {
            event.stopPropagation();
            event.preventDefault();
          }
        }}
      >
        <IndexTable.Cell>{name}</IndexTable.Cell>
        <IndexTable.Cell>{customMeasurement ? 'Custom' : 'Standard'}</IndexTable.Cell>
        <IndexTable.Cell>{title}</IndexTable.Cell>
        <IndexTable.Cell>{quantity}</IndexTable.Cell>
        <IndexTable.Cell>{price}</IndexTable.Cell>
        <IndexTable.Cell>{customMeasurement?.name ?? '-'}</IndexTable.Cell>
        <IndexTable.Cell>
          <InlineStack gap="200" align="center">
            <Button tone="success" onClick={() => {
              const { customMeasurement } = node;
              if (customMeasurement) {
                const { createdAt, updatedAt, ...measurementProps } = customMeasurement;
                const numericMeasurementProps = { ...measurementProps };
                // Convert all numeric fields to numbers
                [
                  'armLength', 'armhole', 'bicep', 'chest', 'hips', 'neck', 'shirtLength', 'shoulder', 'sleeveLength', 'waist', 'wrist'
                ].forEach(key => {
                  if (numericMeasurementProps[key] !== undefined && numericMeasurementProps[key] !== null) {
                    numericMeasurementProps[key] = Number(numericMeasurementProps[key]);
                  }
                });
                setSelectedLineItem(numericMeasurementProps);
              } else {
                setSelectedLineItem(null);
              }
              setIsMeasurementModalOpen(true);
            }}>
              <Icon source={EditIcon} />
            </Button>
          </InlineStack>
        </IndexTable.Cell>
      </IndexTable.Row>
    );
  });

  const lineItemResourceName = {
    singular: "Order Line Item",
    plural: "Order Line Items",
  };

  const handleMeasurementSave = async (updatedMeasurement) => {
    try {
      if (!updatedMeasurement?.id) {
        throw new Error("Missing measurement ID");
      }
      await api.customMeasurement.update(updatedMeasurement.id, {
        name: updatedMeasurement.name,
        measurementType: updatedMeasurement.measurementType,
        armLength: updatedMeasurement.armLength,
        armhole: updatedMeasurement.armhole,
        bicep: updatedMeasurement.bicep,
        chest: updatedMeasurement.chest,
        hips: updatedMeasurement.hips,
        neck: updatedMeasurement.neck,
        shirtLength: updatedMeasurement.shirtLength,
        shoulder: updatedMeasurement.shoulder,
        sleeveLength: updatedMeasurement.sleeveLength,
        waist: updatedMeasurement.waist,
        wrist: updatedMeasurement.wrist,
      });
      shopify.toast.show("Measurement details updated successfully!");
      refetchOrderDetails();
    } catch (error) {
      console.error("Measurement update failed:", error);
      const message = error.message || (error.response?.errors?.[0]?.message) || "Failed to update measurement details";
      shopify.toast.show(message, { isError: true });
    }
  };

  return (
    <div>
      <Page
        backAction={{ content: "Back to Customer Orders", url: `/orderLineItems/${orderDetails?.customer?.id}` }}
        title={`Order ${orderDetails?.name ?? ''}`}
        compactTitle
      >
        <MeasurementModal
          open={isMeasurementModalOpen}
          onClose={() => setIsMeasurementModalOpen(false)}
          lineItem={selectedLineItem}
          onUpdate={handleMeasurementSave}
        />
        <Layout>
        </Layout>
        {isTableLoading && (
          <div>
            <div
              style={{
                position: "fixed",
                inset: "0px",
                backgroundColor: "rgba(255,255,255,0.7)",
                zIndex: "999",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Spinner size="large" />
            </div>
          </div>
        )}
        <Card>
          {hasLoadedOnce ? (
            <IndexFilters
              loading={isOrderFetching}
              sortOptions={tableSortOptions}
              sortSelected={sortOrder}
              queryValue={searchValue}
              queryPlaceholder="Search order line items"
              onQueryChange={setSearchValue}
              onQueryClear={() => setSearchValue("")}
              onSort={setSortOrder}
              tabs={[]}
              selected={[]}
              onSelect={[]}
              canCreateNewView={false}
              filters={[]}
              appliedFilters={[]}
              onClearAll={() => setSearchValue("")}
              mode={filterMode}
              setMode={setFilterMode}
            />
          ) : null}
          <IndexTable
            emptyState={isInitialDataLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}>
                <Spinner accessibilityLabel="Loading order line items" size="large" />
              </div>
            ) : ''}
            condensed={useBreakpoints().smDown}
            resourceName={lineItemResourceName}
            itemCount={lineItemIds.length}
            selectedItemsCount={allResourcesSelected ? "All" : selectedResources.length}
            onSelectionChange={handleSelectionChange}
            headings={[
              { title: "Line Item Name" },
              { title: "Measurement Type" },
              { title: "Product Title" },
              { title: "Quantity" },
              { title: "Unit Price" },
              { title: "Size Name" },
              { title: "Edit Measurement" },
            ]}
            pagination={{
              hasNext: paginationInfo?.hasNextPage,
              hasPrevious: paginationInfo?.hasPreviousPage,
              onNext: goToNextPage,
              onPrevious: goToPreviousPage,
            }}
          >
            {lineItemRows}
          </IndexTable>
        </Card>
      </Page>
    </div>
  );
}

export default CustomerOrderDetailsPage;
