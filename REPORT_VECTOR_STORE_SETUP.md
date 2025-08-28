# Report Vector Store Setup

This project can search R 12 G/S market PDF reports using an OpenAI vector store. The repository includes sample PDFs in `vector_reports/r12gs/`.

## Creating the Vector Store

1. Ensure the `OPENAI_API_KEY` environment variable is configured.
2. Run the upload script:
   ```bash
   node scripts/create_report_vector_store.js
   ```
3. The script uploads all PDFs from `vector_reports/r12gs/` and prints the new store ID.

## Configuring the Application

Add the returned ID to your `.env` file:
```bash
R12GS_REPORTS_VECTOR_STORE_ID=your_new_store_id
```

The chat assistant continues to use `R12GS_VECTOR_STORE_ID` for the main market data vector store.
