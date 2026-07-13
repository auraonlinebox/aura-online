function doGet(e) {
  try {
    const sheet = SpreadsheetApp.openById('1NVxQuDTfmR67ysKWGDXo4HsypdhRDdd9JQRlhNFwy6c').getActiveSheet();
    sheet.appendRow([
      new Date(),
      e.parameter.name || '',
      e.parameter.email || '',
      e.parameter.restaurant || '',
      e.parameter.phone || '',
      e.parameter.accepted || ''
    ]);
    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
