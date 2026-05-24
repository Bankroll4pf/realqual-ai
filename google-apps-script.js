const WEBHOOK_URL = "https://YOUR-DEPLOYED-APP.vercel.app/api/google-form-webhook";
const WEBHOOK_SECRET = "replace-with-the-same-value-as-GOOGLE_FORM_WEBHOOK_SECRET";

const OUTPUT_HEADERS = [
  "AI Summary",
  "AI Lead Type",
  "AI Score",
  "AI Temperature",
  "AI Reasoning",
  "AI Recommended Next Action",
  "AI Agent Message",
  "AI Qualified At",
  "AI Error"
];

function onFormSubmit(event) {
  const row = {};
  const namedValues = event.namedValues || {};

  Object.keys(namedValues).forEach((key) => {
    row[key] = Array.isArray(namedValues[key]) ? namedValues[key][0] : namedValues[key];
  });

  const response = UrlFetchApp.fetch(WEBHOOK_URL, {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify({
      secret: WEBHOOK_SECRET,
      row
    }),
    muteHttpExceptions: true
  });

  Logger.log(response.getResponseCode());
  Logger.log(response.getContentText());

  if (event.range) {
    writeQualificationResult(event.range.getSheet(), event.range.getRow(), response);
  }
}

function writeQualificationResult(sheet, rowNumber, response) {
  const headers = ensureOutputHeaders(sheet);
  const statusCode = response.getResponseCode();
  const body = response.getContentText();
  const parsed = safeJsonParse(body);
  const valuesByHeader = {};

  if (statusCode >= 200 && statusCode < 300 && parsed && parsed.lead) {
    valuesByHeader["AI Summary"] = parsed.lead.summary || "";
    valuesByHeader["AI Lead Type"] = parsed.lead.qualifiedLeadType || parsed.lead.leadType || "";
    valuesByHeader["AI Score"] = parsed.lead.score || "";
    valuesByHeader["AI Temperature"] = parsed.lead.temperature || "";
    valuesByHeader["AI Reasoning"] = parsed.lead.reasoning || "";
    valuesByHeader["AI Recommended Next Action"] = parsed.lead.recommendedNextAction || "";
    valuesByHeader["AI Agent Message"] = parsed.lead.agentMessage || "";
    valuesByHeader["AI Qualified At"] = new Date();
    valuesByHeader["AI Error"] = "";
  } else {
    valuesByHeader["AI Qualified At"] = new Date();
    valuesByHeader["AI Error"] = parsed && parsed.error ? parsed.error : body;
  }

  OUTPUT_HEADERS.forEach((header) => {
    const columnNumber = headers.indexOf(header) + 1;
    sheet.getRange(rowNumber, columnNumber).setValue(valuesByHeader[header] || "");
  });
}

function ensureOutputHeaders(sheet) {
  const lastColumn = Math.max(sheet.getLastColumn(), 1);
  const headerRange = sheet.getRange(1, 1, 1, lastColumn);
  const headers = headerRange.getValues()[0].map((value) => String(value || "").trim());
  let nextColumn = headers.length + 1;

  OUTPUT_HEADERS.forEach((header) => {
    if (!headers.includes(header)) {
      sheet.getRange(1, nextColumn).setValue(header);
      headers.push(header);
      nextColumn += 1;
    }
  });

  return headers;
}

function safeJsonParse(value) {
  try {
    return JSON.parse(value);
  } catch (error) {
    return null;
  }
}
