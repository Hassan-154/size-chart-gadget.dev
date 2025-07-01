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
    const [tableLoading, setTableLoading] = useState(false);
    const [dbLoading, setDbLoading] = useState(true);
    const [initialLoadComplete, setInitialLoadComplete] = useState(false);
    const [searchValue, setSearchValue] = useState("");
    const [sortSelected, setSortSelected] = useState(["createdAt desc"]);
    const [pageInfo, setPageInfo] = useState(null);
  
    const navigate = useNavigate();
    const { id: customerId } = useParams();
  
    const [
      {
        data: customerOrderData,
        fetching: orderFetching,
        error: orderError,
      },
      _refetch,
    ] = useFindOne(api.shopifyCustomer, customerId, {
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
      if (customerOrderData) {
        setDbLoading(false);
        setInitialLoadComplete(true);
      }
    }, [customerOrderData]);
  
    // Pagination handlers (no-op for now)
    const handleNextPage = () => {};
    const handlePreviousPage = () => {};
  
    // Modal state for delete confirmation (not used but kept for future bulk actions)
    const [modalActive, setModalActive] = useState(false);
    const toggleModal = useCallback(() => setModalActive((active) => !active), []);
  
    // Table sort options (if needed in the future)
    const sortOptions = [
      { label: "Order Name", value: "name asc", directionLabel: "A-Z" },
      { label: "Order Name", value: "name desc", directionLabel: "Z-A" },
      { label: "Date", value: "createdAt asc", directionLabel: "Ascending" },
      { label: "Date", value: "createdAt desc", directionLabel: "Descending" },
    ];
    const { mode, setMode } = useSetIndexFiltersMode(IndexFiltersMode.Filtering);
  
    // Setup selection state for IndexTable
    const orderIds = customerOrderData?.orders?.edges?.map(({ node }) => node.id) || [];
    const { selectedResources, allResourcesSelected, handleSelectionChange } = useIndexResourceState(orderIds);
  
    // Render order line items from customerOrderData.orders.edges
    const rowMarkup = customerOrderData?.orders?.edges?.map(({ node }, index) => {
      const { id, name, createdAt, totalPrice } = node;
      return (
        <IndexTable.Row
          id={id}
          key={id}
          selected={selectedResources?.includes?.(id)}
          position={index}
          onClick={(event) => {
            navigate(`/MeasurementProducts/${name.replace(/^#/, "")}`);
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
        backAction={{ content: "Orders", url: "/" }}
        title={`${customerOrderData?.displayName ?? ''} Orders`}
        compactTitle
      >
      <Layout>
      </Layout>
        {tableLoading && (
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
              loading={orderFetching}
              sortOptions={sortOptions}
              sortSelected={sortSelected}
              queryValue={searchValue}
              queryPlaceholder="Search orders"
              onQueryChange={setSearchValue}
              onQueryClear={() => setSearchValue("")}
              onSort={setSortSelected}
              tabs={[]}
              selected={[]}
              onSelect={[]}
              canCreateNewView={false}
              filters={[]}
              appliedFilters={[]}
              onClearAll={() => setSearchValue("")}
              mode={mode}
              setMode={setMode}
            />
          ) : null}
          <IndexTable
            emptyState={dbLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}>
                <Spinner accessibilityLabel="Loading orders" size="large" />
              </div>
            ) : ''}
            condensed={useBreakpoints().smDown}
            resourceName={resourceName}
            itemCount={orderIds.length}
            selectedItemsCount={allResourcesSelected ? "All" : selectedResources.length}
            onSelectionChange={handleSelectionChange}
            headings={[
              { title: "Order Name" },
              { title: "Created At" },
              { title: "Total Price" },
            ]}
            pagination={{
              hasNext: pageInfo?.hasNextPage,
              hasPrevious: pageInfo?.hasPreviousPage,
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
