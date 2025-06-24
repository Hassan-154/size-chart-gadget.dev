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

function customerOrderDetails() {
  const [tableSpinnerToDataLoad, setTableSpinnerToDataLoad] = useState(false);
  const [tableSpinnerOnDataLoadFromDB, setTableSpinnerOnDataLoadFromDB] = useState(true);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [queryValue, setQueryValue] = useState("");
  const [sortSelected, setSortSelected] = useState(["createdAt desc"]);
  const [pageInfoData, setPageInfoData] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLineItem, setEditingLineItem] = useState(null);

  const navigate = useNavigate();
  const { id } = useParams();

  console.log('customer order numbers.', id)

  const [
    {
      data: orderData,
      fetching: findFetching,
      error: findError,
    },
    _refetch,
  ] = useFindFirst(api.shopifyOrder, {
    filter: {
      name: { equals: `#${id}` }
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
              chest: true,
              waist: true,
              armLength: true,
              shoulderWidth: true,
              createdAt: true,
              updatedAt: true
            }
          }
        }
      }
    }
  });

  console.log(orderData)

  useEffect(() => {
    if (orderData) {
      setTableSpinnerOnDataLoadFromDB(false);
      setInitialLoadComplete(true);
    }
  }, [orderData]);

  // Pagination handlers (no-op for now)
  const handleNextPage = () => { };
  const handlePreviousPage = () => { };

  // Modal state for delete confirmation (not used but kept for future bulk actions)
  const [active, setActive] = useState(false);
  const toggleModal = useCallback(() => setActive((active) => !active), []);

  // Table sort options (if needed in the future)
  const sortOptions = [
    { label: "Order Name", value: "name asc", directionLabel: "A-Z" },
    { label: "Order Name", value: "name desc", directionLabel: "Z-A" },
    { label: "Date", value: "createdAt asc", directionLabel: "Ascending" },
    { label: "Date", value: "createdAt desc", directionLabel: "Descending" },
  ];
  const { mode, setMode } = useSetIndexFiltersMode(IndexFiltersMode.Filtering);

  // Setup selection state for IndexTable
  const lineItemResources = orderData?.lineItems?.edges?.map(({ node }) => node.id) || [];
  const { selectedResources, allResourcesSelected, handleSelectionChange } = useIndexResourceState(lineItemResources);

  // Render order line items from orderData.lineItems.edges
  const rowMarkup = orderData?.lineItems?.edges?.map(({ node }, index) => {
    const { id, name, title, quantity, price, customMeasurement } = node;
    return (
      <IndexTable.Row
        id={id}
        key={id}
        selected={selectedResources.includes(id)}
        position={index}
        onClick={(event) => {
          //     navigate(`/customerOrderDetails/${name.replace(/^#/, "")}`);
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
              // Only pass customMeasurement (without createdAt, updatedAt) to the modal
              const { customMeasurement } = node;
              if (customMeasurement) {
                // Destructure to remove createdAt and updatedAt
                const { createdAt, updatedAt, ...measurementProps } = customMeasurement;
                setEditingLineItem(measurementProps);
              } else {
                setEditingLineItem(null);
              }
              setModalOpen(true);
            }}>
              <Icon source={EditIcon} />
            </Button>
          </InlineStack>
        </IndexTable.Cell>
      </IndexTable.Row>
    );
  });

  const resourceName = {
    singular: "line item",
    plural: "line items",
  };

  return (
    <div>
      <Page
        backAction={{ content: "Customer Orders", url: `/orderLineItems/${orderData?.customer?.id}` }}
        title={`Order ${orderData?.name ?? ''}`}
        compactTitle
      >
        <MeasurementModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          lineItem={editingLineItem}
        />
        <Layout>
        </Layout>
        {tableSpinnerToDataLoad && (
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
          {initialLoadComplete ? (
            <IndexFilters
              loading={findFetching}
              sortOptions={sortOptions}
              sortSelected={sortSelected}
              queryValue={queryValue}
              queryPlaceholder="Search line items"
              onQueryChange={setQueryValue}
              onQueryClear={() => setQueryValue("")}
              onSort={setSortSelected}
              tabs={[]}
              selected={[]}
              onSelect={[]}
              canCreateNewView={false}
              filters={[]}
              appliedFilters={[]}
              onClearAll={() => setQueryValue("")}
              mode={mode}
              setMode={setMode}
            />
          ) : null}
          <IndexTable
            emptyState={tableSpinnerOnDataLoadFromDB ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}>
                <Spinner accessibilityLabel="Spinner example" size="large" />
              </div>
            ) : ''}
            condensed={useBreakpoints().smDown}
            resourceName={resourceName}
            itemCount={lineItemResources.length}
            selectedItemsCount={allResourcesSelected ? "All" : selectedResources.length}
            onSelectionChange={handleSelectionChange}
            headings={[
              { title: "Name" },
              { title: "Type" },
              { title: "Title" },
              { title: "Quantity" },
              { title: "Price" },
              { title: "Measurement" },
              { title: "Edit Size" },
            ]}
            pagination={{
              hasNext: pageInfoData?.hasNextPage,
              hasPrevious: pageInfoData?.hasPreviousPage,
              onNext: handleNextPage,
              onPrevious: handlePreviousPage,
            }}
          >
            {rowMarkup}
          </IndexTable>
        </Card>
      </Page>
    </div>
  );
}

export default customerOrderDetails;
