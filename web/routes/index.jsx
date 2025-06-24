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

function IndexPage() {
  const [afterCursor, setAfterCursor] = useState(null);
  const [beforeCursor, setBeforeCursor] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [pageInfoData, setPageInfoData] = useState(null);
  const pageSize = 20;
  const [sortSelected, setSortSelected] = useState(["customerName asc"]);
  const [fieldDB, sortOrder] = sortSelected[0].split(" ");
  const [searchTableData, setSearchTableData] = useState("");
  const [tableSpinnerToDataLoad, setTableSpinnerToDataLoad] = useState(false);
  const [tableSpinnerOnDataLoadFromDB, settableSpinnerOnDataLoadFromDB] = useState(true);
  const [hasReviews, setHasReviews] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  const navigate = useNavigate();
  // const [
  //   {
  //     data: reviewListData,
  //     fetching: findFetching,
  //     error: findError,
  //     pageInfo,
  //   },
  //   _refetch,
  // ] = useFindMany(api.reviewList, {
  //   live: true,
  //   ...(searchTableData ? { search: searchTableData } : {}),
  //   first: pageSize,
  //   ...(afterCursor ? { after: afterCursor } : {}),
  //   ...(beforeCursor ? { before: beforeCursor, last: pageSize } : {}),
  //   sort: { [fieldDB]: sortOrder === "asc" ? "Ascending" : "Descending" },
  //   select: {
  //     id: true,
  //     reviewTitle: true,
  //     customerName: true,
  //     publishStatus: true,
  //     createdAt: true,
  //     updatedAt: true,
  //     customerEmail: true,
  //     product: {
  //       title: true,
  //       id: true,
  //     }
  //   }
  // });

  const [
    {
      data: reviewListData,
      fetching: findFetching,
      error: findError,
    },
    _refetch,
  ] = useFindMany(api.shopifyCustomer, {
    select: {
      displayName: true,
      id: true,
      email: true,
      numberOfOrders: true,
      // Add orders related to customer
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

  console.log('Data.', reviewListData, findFetching, findError)

  const updateReviewStatus = async (ids, value) => {
    try {
      setTableSpinnerToDataLoad(true);
      for (const id of ids) {
        await api.reviewList.update(id, { publishStatus: value });
      }
      _refetch();
      handleSelectionChange("all", false);
    } catch (error) {
    }
    finally {
      setTableSpinnerToDataLoad(false);
    }
  };

  const { selectedResources, allResourcesSelected, handleSelectionChange } = useIndexResourceState(reviews);

  const deleteReviews = async (idsToDelete) => {
    try {
      setTableSpinnerToDataLoad(true);
      for (const id of idsToDelete) {
        await api.reviewList.delete(id);
      }
      _refetch();
      handleSelectionChange("all", false);
    } catch (error) {
    } finally {
      setTableSpinnerToDataLoad(false);
    }
  };
  console.log("reviewListing,", reviewListData, findError)
  useEffect(() => {
    if (reviewListData) {
      setReviews(reviewListData);
      settableSpinnerOnDataLoadFromDB(false)
      setHasReviews(reviewListData.length > 0);
      setInitialLoadComplete(true);
    }
  }, [reviewListData, afterCursor, beforeCursor]);

  useEffect(() => {
    if (reviewListData?.pagination) {
      const newReviews = reviewListData.pagination.edges.map(
        (edge) => edge.node
      );
      settableSpinnerOnDataLoadFromDB(false)
      setReviews(newReviews);
      setPageInfoData(reviewListData.pagination.pageInfo);
    }
  }, [reviewListData]);

  const handleNextPage = () => {
    if (pageInfoData?.hasNextPage) {
      setAfterCursor(pageInfoData.endCursor);
      setBeforeCursor(null);
      // setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePreviousPage = () => {
    if (pageInfoData?.hasPreviousPage) {
      setBeforeCursor(pageInfoData.startCursor);
      setAfterCursor(null);
      // setCurrentPage((prev) => Math.max(prev - 1, 1));
    }
  };

  const [active, setActive] = useState(false);

  const toggleModal = useCallback(() => setActive((active) => !active), []);

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

  const handleQueryValueChange = useCallback((value) => {
    setQueryValue(value);
    setSearchTableData(value);
    setAfterCursor(null);
    setBeforeCursor(null);
    setCurrentPage(1);
  }, []);

  const handleQueryValueRemove = useCallback(() => {
    setQueryValue("");
    setSearchTableData("");
    setAfterCursor(null);
    setBeforeCursor(null);
    setCurrentPage(1);
  }, []);

  const handleFiltersClearAll = useCallback(() => {
    handleQueryValueRemove();
  }, [handleQueryValueRemove]);

  const resourceName = {
    singular: "review",
    plural: "reviews",
  };

  const rowMarkup = reviews?.map(
    (
      {
        id,
        displayName,
        email,
        numberOfOrders
      },
      index
    ) => (
      <IndexTable.Row
        id={id}
        key={id}
        selected={selectedResources.includes(id)}
        position={index}
        onClick={(event) => {
          navigate(`/orderLineItems/${id}`);
          // navigate(`/review/${id}`, { replace: true });
          if (event) {
            event.stopPropagation();
            event.preventDefault();
          }
        }}
      >
        <IndexTable.Cell>{displayName}</IndexTable.Cell>
        <IndexTable.Cell>{email}</IndexTable.Cell>
        <IndexTable.Cell>{numberOfOrders}</IndexTable.Cell>

        {/* <IndexTable.Cell>
          {new Date(createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </IndexTable.Cell> */}

        {/* <IndexTable.Cell>
          {publishStatus ? (
            <Badge progress="complete">Publish</Badge>
          ) : (
            <Badge progress="incomplete">Unpublish</Badge>
          )}
        </IndexTable.Cell> */}
        {/* <IndexTable.Cell>
          <InlineStack gap="200" align="center">
            <Button tone="success">
              <Icon source={EditIcon} />
            </Button>
            <Button tone="critical">
              <Icon source={DeleteIcon} />
            </Button>
          </InlineStack>
        </IndexTable.Cell> */}
      </IndexTable.Row>
    )
  );

  return (
    <Page
      backAction={{ content: "Reviews", url: "/" }}
      title="Customer details"
      compactTitle
      primaryAction={{
        content: "Create",
        disabled: false,
        variant: "primary",
        onAction: () => { navigate("/review/create") },
      }}
    > 
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
        {initialLoadComplete && (hasReviews || queryValue) ? (
          <IndexFilters
            loading={findFetching}
            sortOptions={sortOptions}
            sortSelected={sortSelected}
            queryValue={queryValue}
            queryPlaceholder="Searching in all"
            onQueryChange={handleQueryValueChange}
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
            onClearAll={handleFiltersClearAll}
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
          itemCount={reviews ? reviews.length : 0}
          selectedItemsCount={
            allResourcesSelected ? "All" : selectedResources.length
          }
          onSelectionChange={handleSelectionChange}
          promotedBulkActions={[
            {
              content: 'Delete selected reviews',
              onAction: () => toggleModal(),
            },
            {
              title: 'Publish Status',
              actions: [
                {
                  content: 'Publish',
                  onAction: () => updateReviewStatus(selectedResources, true),
                },
                {
                  content: 'Unpublish',
                  onAction: () => updateReviewStatus(selectedResources, false),
                },
              ],
            },
          ]}
          headings={[
            // { title: "Review Id" },
            { title: "Customer Name" },
            { title: "Email" },
            { title: "Total Order" },
            // { title: "CreatedAt" },
            // { title: "Product" },
            // { title: "Status" },
            // { title: "Action", alignment: "center" },
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


      <Modal
        open={active}
        onClose={toggleModal}
        title="Delete customization"
        primaryAction={{
          destructive: true,
          content: "Delete",
          onAction: () => {
            deleteReviews(selectedResources);
            toggleModal();
          },
        }}
        secondaryActions={[
          {
            content: "Cancel",
            onAction: toggleModal,
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
              Are you sure you want to delete this Customization <br />
              "Measurement List Module"
            </Text>
          </div>
        </Modal.Section>
      </Modal>

    </Page>
  );
}

export default IndexPage;