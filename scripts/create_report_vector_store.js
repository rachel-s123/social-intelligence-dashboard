const fs = require('fs');
const path = require('path');
const OpenAI = require('openai').default;

async function main() {
  if (!process.env.OPENAI_API_KEY) {
    console.error('OPENAI_API_KEY environment variable not set');
    process.exit(1);
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const reportsDir = path.join(__dirname, '../vector_reports');
  const pdfFiles = fs.readdirSync(reportsDir).filter((f) => f.endsWith('.pdf'));
  if (pdfFiles.length === 0) {
    console.error('No PDF files found in vector_reports/');
    process.exit(1);
  }

  const fileStreams = pdfFiles.map((file) =>
    fs.createReadStream(path.join(reportsDir, file))
  );

  console.log(`Uploading ${pdfFiles.length} PDFs to a new vector store...`);

  const vectorStore = await openai.vectorStores.create({
    name: 'BMW Report Vector Store',
  });

  await openai.vectorStores.fileBatches.uploadAndPoll(vectorStore.id, {
    files: fileStreams,
  });

  console.log('Vector store created successfully!');
  console.log('Store ID:', vectorStore.id);
}

main().catch((err) => {
  console.error('Failed to create report vector store:', err);
  process.exit(1);
});
