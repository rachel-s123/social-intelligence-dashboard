/**
 * Get the report vector store ID with fallback logic
 * 
 * This function provides a centralized way to get the vector store ID
 * for R12GS reports, with proper fallback handling for different
 * environment variable names.
 * 
 * @returns {string|null} The vector store ID or null if not configured
 */
function getReportVectorStoreId() {
  // Primary environment variable for reports vector store
  if (process.env.R12GS_REPORTS_VECTOR_STORE_ID) {
    return process.env.R12GS_REPORTS_VECTOR_STORE_ID;
  }
  
  // Fallback to VS_REPORTS_STORE_ID (used in some configurations)
  if (process.env.VS_REPORTS_STORE_ID) {
    return process.env.VS_REPORTS_STORE_ID;
  }
  
  // Additional fallback to R12GS_VECTOR_STORE_ID
  if (process.env.R12GS_VECTOR_STORE_ID) {
    return process.env.R12GS_VECTOR_STORE_ID;
  }
  
  // Client-side fallback (for React app)
  if (process.env.REACT_APP_R12GS_VECTOR_STORE_ID) {
    return process.env.REACT_APP_R12GS_VECTOR_STORE_ID;
  }
  
  // Return null if no vector store ID is configured
  console.warn('No vector store ID configured. Please set R12GS_REPORTS_VECTOR_STORE_ID environment variable.');
  return null;
}

module.exports = {
  getReportVectorStoreId
};
