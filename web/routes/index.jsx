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
} from "@shopify/polaris";
import { useNavigate } from "react-router";
import { useState, useCallback, useEffect } from "react";
import { EditIcon, DeleteIcon } from "@shopify/polaris-icons";
import { useFindMany } from "@gadgetinc/react";
import { api } from "../api";

function CustomerDetailsPage() {
  const [afterCustomerCursor, setAfterCustomerCursor] = useState(null);
  const [beforeCustomerCursor, setBeforeCustomerCursor] = useState(null);
  const customerPageSize = 20;
  const [sortSelected, setSortSelected] = useState(["customerName asc"]);
  const [customerSortField, customerSortOrder] = sortSelected[0].split(" ");
  const [customerSearchValue, setCustomerSearchValue] = useState("");
  const [customerTableLoading, setCustomerTableLoading] = useState(false);
  const [customerInitialLoading, setCustomerInitialLoading] = useState(true);
  const [hasCustomerDetails, setHasCustomerDetails] = useState(false);
  const [customerInitialLoadComplete, setCustomerInitialLoadComplete] = useState(false);

  const navigate = useNavigate();

  const [
    {
      data: customerDetailsData,
      fetching: customerDetailsFetching,
      error: customerDetailsError,
    },
    refetchCustomerDetails,
  ] = useFindMany(api.shopifyCustomer, {
    first: customerPageSize,
    after: afterCustomerCursor,
    before: beforeCustomerCursor,
    search: customerSearchValue || undefined,
    sort: customerSortField === 'customerName' ?
      { displayName: customerSortOrder === 'asc' ? 'Ascending' : 'Descending' } :
      { createdAt: customerSortOrder === 'asc' ? 'Ascending' : 'Descending' },
    select: {
      displayName: true,
      id: true,
      email: true,
      numberOfOrders: true,
      orders: {
        edges: {
          node: {
            id: true,
            name: true,
            totalPrice: true,
            createdAt: true,
          }
        }
      },
    }
  });

  useEffect(() => {
    if (customerDetailsData) {
      setCustomerInitialLoading(false);
      setHasCustomerDetails(customerDetailsData.length > 0);
      setCustomerInitialLoadComplete(true);
    }
  }, [customerDetailsData]);

  const handleNextCustomerPage = () => {
    if (customerDetailsData?.hasNextPage) {
      setAfterCustomerCursor(customerDetailsData.endCursor);
      setBeforeCustomerCursor(null);
    }
  };

  const handlePreviousCustomerPage = () => {
    if (customerDetailsData?.hasPreviousPage) {
      setBeforeCustomerCursor(customerDetailsData.startCursor);
      setAfterCustomerCursor(null);
    }
  };

  const [deleteModalActive, setDeleteModalActive] = useState(false);
  const toggleDeleteModal = useCallback(() => setDeleteModalActive((active) => !active), []);

  const sortOptions = [
    {
      label: "Customer Name",
      value: "customerName asc",
      directionLabel: "A-Z",
    },
    {
      label: "Customer Name",
      value: "customerName desc",
      directionLabel: "Z-A",
    },
    { label: "Date", value: "createdAt asc", directionLabel: "Ascending" },
    { label: "Date", value: "createdAt desc", directionLabel: "Descending" },
  ];
  const { mode, setMode } = useSetIndexFiltersMode(IndexFiltersMode.Filtering);

  const [queryValue, setQueryValue] = useState(undefined);

  const handleCustomerQueryValueChange = useCallback((value) => {
    setQueryValue(value);
    setCustomerSearchValue(value);
    setAfterCustomerCursor(null);
    setBeforeCustomerCursor(null);
  }, []);

  const handleCustomerQueryValueRemove = useCallback(() => {
    setQueryValue("");
    setCustomerSearchValue("");
    setAfterCustomerCursor(null);
    setBeforeCustomerCursor(null);
  }, []);

  const handleCustomerFiltersClearAll = useCallback(() => {
    handleCustomerQueryValueRemove();
  }, [handleCustomerQueryValueRemove]);

  const customerResourceName = {
    singular: "customer detail",
    plural: "customer details",
  };

  const { selectedResources: selectedCustomerDetails, allResourcesSelected: allCustomerDetailsSelected, handleSelectionChange: handleCustomerSelectionChange } =
    useIndexResourceState(customerDetailsData || []);

  const updateCustomerStatus = async (ids, value) => {
    try {
      setCustomerTableLoading(true);
      for (const id of ids) {
        await api.reviewList.update(id, { publishStatus: value });
      }
      refetchCustomerDetails();
      handleCustomerSelectionChange("all", false);
    } catch (error) {
    }
    finally {
      setCustomerTableLoading(false);
    }
  };

  const deleteCustomerDetails = async (idsToDelete) => {
    try {
      setCustomerTableLoading(true);
      for (const id of idsToDelete) {
        await api.reviewList.delete(id);
      }
      refetchCustomerDetails();
      handleCustomerSelectionChange("all", false);
    } catch (error) {
    } finally {
      setCustomerTableLoading(false);
    }
  };

  const customerRowMarkup = customerDetailsData?.map(
    ({
      id,
      displayName,
      email,
      numberOfOrders
    }, index) => (
      <IndexTable.Row
        id={id}
        key={id}
        selected={selectedCustomerDetails.includes(id)}
        position={index}
        onClick={(event) => {
          navigate(`/orderLineItems/${id}`);
          if (event) {
            event.stopPropagation();
            event.preventDefault();
          }
        }}
      >
        <IndexTable.Cell>{displayName}</IndexTable.Cell>
        <IndexTable.Cell>{email}</IndexTable.Cell>
        <IndexTable.Cell>{numberOfOrders}</IndexTable.Cell>
      </IndexTable.Row>
    )
  );

  return (
    <Page
      title="Customer Details"
      compactTitle
      primaryAction={{
        content: "Create Customer Detail",
        disabled: false,
        variant: "primary",
        onAction: () => { navigate("") },
      }}
    >
      {customerTableLoading && (
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
        {customerInitialLoadComplete && (hasCustomerDetails || queryValue) ? (
          <IndexFilters
            loading={customerDetailsFetching}
            sortOptions={sortOptions}
            sortSelected={sortSelected}
            queryValue={queryValue}
            queryPlaceholder="Search all customer details"
            onQueryChange={handleCustomerQueryValueChange}
            onQueryClear={() => setQueryValue("")}
            onSort={setSortSelected}
            tabs={[]}
            selected={[]}
            onSelect={[]}
            canCreateNewView
            onCreateNewView={[]}
            filters={[]}
            primaryActionButton={<Badge progress="complete">Publish</Badge>}
            appliedFilters={[]}
            onClearAll={handleCustomerFiltersClearAll}
            mode={mode}
            setMode={setMode}
          />
        ) : null}
        <IndexTable
          emptyState={customerInitialLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}>
              <Spinner accessibilityLabel="Spinner example" size="large" />
            </div>
          ) : ''}
          condensed={useBreakpoints().smDown}
          resourceName={customerResourceName}
          itemCount={customerDetailsData ? customerDetailsData.length : 0}
          selectedItemsCount={
            allCustomerDetailsSelected ? "All" : selectedCustomerDetails.length
          }
          onSelectionChange={handleCustomerSelectionChange}
          promotedBulkActions={[
            {
              content: 'Delete selected customer details',
              onAction: () => toggleDeleteModal(),
            },
            {
              title: 'Publish Status',
              actions: [
                {
                  content: 'Publish',
                  onAction: () => updateCustomerStatus(selectedCustomerDetails, true),
                },
                {
                  content: 'Unpublish',
                  onAction: () => updateCustomerStatus(selectedCustomerDetails, false),
                },
              ],
            },
          ]}
          headings={[
            { title: "Customer Name" },
            { title: "Email" },
            { title: "Total Orders" },
          ]}
          pagination={{
            hasNext: customerDetailsData?.hasNextPage,
            hasPrevious: customerDetailsData?.hasPreviousPage,
            onNext: handleNextCustomerPage,
            onPrevious: handlePreviousCustomerPage,
          }}
        >
          {customerRowMarkup}
        </IndexTable>
      </Card>
      <Modal
        open={deleteModalActive}
        onClose={toggleDeleteModal}
        title="Delete Customer Detail"
        primaryAction={{
          destructive: true,
          content: "Delete",
          onAction: () => {
            deleteCustomerDetails(selectedCustomerDetails);
            toggleDeleteModal();
          },
        }}
        secondaryActions={[
          {
            content: "Cancel",
            onAction: toggleDeleteModal,
          },
        ]}
      >
        <Modal.Section>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              textAlign: "center",
              padding: "20px 0",
            }}
          >
            <Text variant="headingSm" as="h6">
              Are you sure you want to delete this customer detail?
            </Text>
          </div>
        </Modal.Section>
      </Modal>
    </Page>
  );
}

export default CustomerDetailsPage;