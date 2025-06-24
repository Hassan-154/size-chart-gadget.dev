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
    Layout
  } from "@shopify/polaris";
  import { useParams, useNavigate } from "react-router"
  import { useState, useCallback, useEffect } from "react";
  import { EditIcon, DeleteIcon } from "@shopify/polaris-icons";
  import { useFindOne } from "@gadgetinc/react";
  import { api } from "../api";
  
  function OrderLineItemsPage() {
    const [tableSpinnerToDataLoad, setTableSpinnerToDataLoad] = useState(false);
    const [tableSpinnerOnDataLoadFromDB, setTableSpinnerOnDataLoadFromDB] = useState(true);
    const [initialLoadComplete, setInitialLoadComplete] = useState(false);
    const [queryValue, setQueryValue] = useState("");
    const [sortSelected, setSortSelected] = useState(["createdAt desc"]);
    const [pageInfoData, setPageInfoData] = useState(null);
  
    const navigate = useNavigate();
    const { id } = useParams();
  
    const [
      {
        data: customerData,
        fetching: findFetching,
        error: findError,
      },
      _refetch,
    ] = useFindOne(api.shopifyCustomer, id, {
      select: {
        id: true,
        displayName: true,
        orders: {
          edges: {
            node: {
              id: true,
              name: true,
              totalPrice: true,
              createdAt: true,
            },
          },
        },
      },
    });
  
    useEffect(() => {
      if (customerData) {
        console.log(customerData)
        setTableSpinnerOnDataLoadFromDB(false);
        setInitialLoadComplete(true);
      }
    }, [customerData]);
  
    // Pagination handlers (no-op for now)
    const handleNextPage = () => {};
    const handlePreviousPage = () => {};
  
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
    const orderResources = customerData?.orders?.edges?.map(({ node }) => node.id) || [];
    const { selectedResources, allResourcesSelected, handleSelectionChange } = useIndexResourceState(orderResources);
  
    // Render order line items from customerData.orders.edges
    const rowMarkup = customerData?.orders?.edges?.map(({ node }, index) => {
      const { id, name, createdAt, totalPrice } = node;
      return (
        <IndexTable.Row
          id={id}
          key={id}
          selected={selectedResources?.includes?.(id)}
          position={index}
          onClick={(event) => {
            navigate(`/customerOrderDetails/${name.replace(/^#/, "")}`);
            if (event) {
              event.stopPropagation();
              event.preventDefault();
            }
          }}
        >
          <IndexTable.Cell>{name}</IndexTable.Cell>
          <IndexTable.Cell>{createdAt}</IndexTable.Cell>
          <IndexTable.Cell>{totalPrice ?? '-'}</IndexTable.Cell>
        </IndexTable.Row>
      );
    });
  
    const resourceName = {
      singular: "order",
      plural: "orders",
    };
  
    return (
      <Page
        backAction={{ content: "Customers", url: "/" }}
        title={`${customerData?.displayName ?? ''} Order`}
        compactTitle
      >
      <Layout>
      {/* <Layout.Section>
        1
      </Layout.Section>
      <Layout.Section variant="oneThird">
        2
        </Layout.Section> */}
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
              queryPlaceholder="Search orders"
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
            itemCount={orderResources.length}
            selectedItemsCount={allResourcesSelected ? "All" : selectedResources.length}
            onSelectionChange={handleSelectionChange}
            headings={[
              { title: "Order Name" },
              { title: "Created At" },
              { title: "Total Price" },
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
    );
  }
  
  export default OrderLineItemsPage;
