function getReportVectorStoreId() {
  return (
    process.env.R12GS_REPORTS_VECTOR_STORE_ID ||
    process.env.REACT_APP_R12GS_REPORTS_VECTOR_STORE_ID ||
    ""
  );
}

module.exports = { getReportVectorStoreId };
