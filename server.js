const express = require('express');
const { google } = require('googleapis');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

const SPREADSHEET_ID = '1CCjq_7liQn3c0VYAGCQu68CWjuTkkAJrevfAwWhMsEY';
const SHEET_NAME = 'KOLs';

const credentials = process.env.GOOGLE_CREDENTIALS_JSON
  ? JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON)
  : JSON.parse(fs.readFileSync(path.join(__dirname, 'divine-command-498210-j1-ca1c88d514a1.json'), 'utf8'));

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const HEADERS = [
  'id','name','platform','type','category','conditions',
  'followers','feeSet','feeAgreed','contact','tags','month',
  'note','status','saveRate','commentQuality','engagementRate',
  'audienceAge','audienceFemale','contentRelevance','trustSignal',
  'kqsScore','kqsResult','createdAt','updatedAt','statusUpdatedAt'
];

async function getSheets() {
  const client = await auth.getClient();
  return google.sheets({ version: 'v4', auth: client });
}

async function ensureSheet(sheets) {
  const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
  const exists = spreadsheet.data.sheets.some(s => s.properties.title === SHEET_NAME);
  if (!exists) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: { requests: [{ addSheet: { properties: { title: SHEET_NAME } } }] },
    });
  }
}

async function ensureHeaders(sheets) {
  await ensureSheet(sheets);
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAME}!A1:Z1`,
  });
  const firstRow = ((res.data.values || [])[0]) || [];
  if (firstRow.length === 0 || firstRow[0] !== 'id') {
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A1`,
      valueInputOption: 'RAW',
      requestBody: { values: [HEADERS] },
    });
  }
}

async function getAllRows(sheets) {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAME}!A:Z`,
  });
  const rows = res.data.values || [];
  if (rows.length <= 1) return [];
  const headers = rows[0];
  return rows.slice(1).map((row, idx) => {
    const obj = { _rowIndex: idx + 2 };
    headers.forEach((h, i) => { obj[h] = row[i] !== undefined ? row[i] : ''; });
    return obj;
  }).filter(r => r.id);
}

app.get('/api/kols', async (req, res) => {
  try {
    const sheets = await getSheets();
    await ensureHeaders(sheets);
    const kols = await getAllRows(sheets);
    res.json(kols.map(({ _rowIndex, ...k }) => k));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/kols', async (req, res) => {
  try {
    const sheets = await getSheets();
    await ensureHeaders(sheets);
    const now = new Date().toISOString();
    const kol = { id: uuidv4(), ...req.body, createdAt: now, updatedAt: now, statusUpdatedAt: now };
    const row = HEADERS.map(h => kol[h] !== undefined ? String(kol[h]) : '');
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:Z`,
      valueInputOption: 'RAW',
      requestBody: { values: [row] },
    });
    res.json(kol);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/kols/:id', async (req, res) => {
  try {
    const sheets = await getSheets();
    const kols = await getAllRows(sheets);
    const kol = kols.find(k => k.id === req.params.id);
    if (!kol) return res.status(404).json({ error: 'Not found' });
    const now = new Date().toISOString();
    const statusChanged = req.body.status && req.body.status !== kol.status;
    const updated = {
      ...kol,
      ...req.body,
      id: kol.id,
      createdAt: kol.createdAt,
      updatedAt: now,
      statusUpdatedAt: statusChanged ? now : (kol.statusUpdatedAt || kol.createdAt),
    };
    const rowIdx = updated._rowIndex;
    delete updated._rowIndex;
    const row = HEADERS.map(h => updated[h] !== undefined ? String(updated[h]) : '');
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A${rowIdx}:Z${rowIdx}`,
      valueInputOption: 'RAW',
      requestBody: { values: [row] },
    });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/kols/:id', async (req, res) => {
  try {
    const sheets = await getSheets();
    const kols = await getAllRows(sheets);
    const kol = kols.find(k => k.id === req.params.id);
    if (!kol) return res.status(404).json({ error: 'Not found' });
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
    const sheet = spreadsheet.data.sheets.find(s => s.properties.title === SHEET_NAME);
    const sheetId = sheet.properties.sheetId;
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [{
          deleteDimension: {
            range: { sheetId, dimension: 'ROWS', startIndex: kol._rowIndex - 1, endIndex: kol._rowIndex }
          }
        }]
      }
    });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Serve React build in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/dist/index.html'));
  });
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server on port ${PORT}`));
