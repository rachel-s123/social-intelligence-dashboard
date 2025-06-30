function getReportVectorStoreId() {
  return (
    process.env.VS_REPORTS_STORE_ID ||
    process.env.REACT_APP_VS_REPORTS_STORE_ID ||
    ""
  );
}

module.exports = { getReportVectorStoreId };
