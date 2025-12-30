/**
 * ONE-TIME SETUP: Sets up all column headers for Pre-Owned Specials Automation
 *
 * Instructions:
 * 1. Open Google Sheet: "Pre-Owned Specials Automation"
 * 2. Extensions → Apps Script
 * 3. Paste this code in a new file or run from Script Editor
 * 4. Click Run → setupSheetHeaders
 * 5. Authorize when prompted
 * 6. Check the sheet - row 1 should have all headers
 */

function setupSheetHeaders() {
  try {
    const ss = SpreadsheetApp.openById('1PkU3Sh9fgWWaz25OqymT2P_EWzB_UvWghgrizTWjHlA');
    const sheet = ss.getSheetByName('Pre-Owned Specials Automation');

    if (!sheet) {
      Browser.msgBox('Error', 'Sheet not found: Pre-Owned Specials Automation', Browser.Buttons.OK);
      return;
    }

    // Show start notification
    ss.toast('Setting up headers...', 'Setup', 5);

  // Define all headers A-AS (45 columns)
  const headers = [
    // A-N: Core Vehicle Data (14 columns)
    'VIN',                          // A
    'Stock',                        // B
    'vehicle_name',                 // C
    'Dealer_Name',                  // D
    'VDP_URL_1',                    // E
    'Main_Photo',                   // F
    'Price_Is',                     // G
    'Price_Was',                    // H
    'Make',                         // I
    'Model',                        // J
    'Year',                         // K
    'Trim',                         // L
    'Mileage',                      // M (swapped with N)
    'certified_pre_owned',          // N (swapped with M)

    // O: Reserved (1 column)
    '',                             // O (reserved)

    // P-Q: Stock Filters (2 columns)
    'Stock_Include',                // P
    'Stock_Exclude',                // Q

    // R: Reserved (1 column)
    '',                             // R (reserved/spacing)

    // S: Timestamp (1 column)
    'last_updated',                 // S (moved from O)

    // T-AS: Subject Lines & Preheaders (26 columns)
    'Luxury_Subject_Line',                          // T
    'Luxury_Preheader',                             // U
    'Lifestyle_Subject_Line',                       // V
    'Lifestyle_Preheader',                          // W
    'Alternative_Luxury_Subject_Line',              // X
    'Alternative_Luxury_Preheader',                 // Y
    'Alternative_Lifestyle_Subject_Line',           // Z
    'Alternative_Lifestyle_Preheader',              // AA
    'FollowUp1_Luxury_Subject_Line',                // AB
    'FollowUp1_Luxury_Preheader',                   // AC
    'FollowUp1_Lifestyle_Subject_Line',             // AD
    'FollowUp1_Lifestyle_Preheader',                // AE
    'FollowUp1_Alternative_Luxury_Subject_Line',    // AF
    'FollowUp1_Alternative_Luxury_Preheader',       // AG
    'FollowUp1_Alternative_Lifestyle_Subject_Line', // AH
    'FollowUp1_Alternative_Lifestyle_Preheader',    // AI
    'FollowUp2_Luxury_Subject_Line',                // AJ
    'FollowUp2_Luxury_Preheader',                   // AK
    'FollowUp2_Lifestyle_Subject_Line',             // AL
    'FollowUp2_Lifestyle_Preheader',                // AM
    'FollowUp2_Alternative_Luxury_Subject_Line',    // AN
    'FollowUp2_Alternative_Luxury_Preheader',       // AO
    'FollowUp2_Alternative_Lifestyle_Subject_Line', // AP
    'FollowUp2_Alternative_Lifestyle_Preheader',    // AQ
    '',                                              // AR (reserved)
    '',                                              // AS (reserved)
  ];

  // Write headers to row 1
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setValues([headers]);

  // Format headers: Arial 8px, black background, white text
  headerRange.setFontFamily('Arial');
  headerRange.setFontSize(8);
  headerRange.setFontWeight('normal');   // Not bold
  headerRange.setBackground('#000000');  // Black background
  headerRange.setFontColor('#ffffff');   // White text

  // Special formatting for Stock_Include (column P/16) - Green background
  sheet.getRange('P1').setBackground('#00ff00').setFontColor('#000000');  // Green with black text

  // Special formatting for Stock_Exclude (column Q/17) - Red background
  sheet.getRange('Q1').setBackground('#ff0000').setFontColor('#ffffff');  // Red with white text

  // Freeze the header row
  sheet.setFrozenRows(1);

  // Auto-resize columns A-N (vehicle data)
  for (let i = 1; i <= 14; i++) {
    sheet.autoResizeColumn(i);
  }

  // Set widths for specific columns
  sheet.setColumnWidth(1, 150);  // A: VIN
  sheet.setColumnWidth(2, 100);  // B: Stock
  sheet.setColumnWidth(3, 200);  // C: vehicle_name
  sheet.setColumnWidth(4, 150);  // D: Dealer_Name
  sheet.setColumnWidth(5, 250);  // E: VDP_URL_1
  sheet.setColumnWidth(6, 250);  // F: Main_Photo

  // Set widths for stock filters
  sheet.setColumnWidth(16, 120); // P: Stock_Include
  sheet.setColumnWidth(17, 120); // Q: Stock_Exclude

  // Set width for last_updated
  sheet.setColumnWidth(19, 150); // S: last_updated

  // Set widths for subject line columns (T-AS)
  for (let i = 20; i <= 45; i++) {
    sheet.setColumnWidth(i, 200);
  }

  // Add notes to specific headers
  sheet.getRange('P1').setNote('Enter stock numbers to INCLUDE (one per row). Leave empty to include all vehicles after exclusions.');
  sheet.getRange('Q1').setNote('Enter stock numbers to EXCLUDE (one per row). Highest priority - removes these even if in include list.');

  // CRITICAL: Flush all pending changes to ensure they persist
  SpreadsheetApp.flush();

  // Log success
  Logger.log('Headers set up successfully!');
  Logger.log(`Total columns: ${headers.length}`);
  Logger.log('A-N (14): Core Vehicle Data');
  Logger.log('O: Reserved');
  Logger.log('P-Q (2): Stock Filters');
  Logger.log('R: Reserved');
  Logger.log('S: last_updated');
  Logger.log('T-AS (26): Subject Lines');

  // Show success message
  const message = `✅ Sheet headers configured successfully!\n\n` +
                  `📊 Column Breakdown:\n` +
                  `• A-N (14 columns): Vehicle Data\n` +
                  `• O: Reserved\n` +
                  `• P-Q (2 columns): Stock Filters\n` +
                  `• R: Reserved\n` +
                  `• S: last_updated timestamp\n` +
                  `• T-AS (26 columns): Subject Lines\n\n` +
                  `🎨 Formatting Applied:\n` +
                  `• Headers: Arial 8px, black background, white text\n` +
                  `• Stock_Include (P): Green background\n` +
                  `• Stock_Exclude (Q): Red background\n` +
                  `• Row 1 is frozen\n` +
                  `• Columns auto-sized\n\n` +
                  `📝 Next Steps:\n` +
                  `1. Add stock filters to columns P-Q (optional)\n` +
                  `2. Add subject line data to columns T-AS\n` +
                  `3. Run the FTP sync from the menu`;

  Browser.msgBox('Setup Complete', message, Browser.Buttons.OK);

  // Final confirmation toast
  ss.toast('Headers setup complete! Check row 1.', '✅ Success', 5);

  } catch (error) {
    Logger.log('Error in setupSheetHeaders: ' + error.toString());
    Browser.msgBox('Error', 'Failed to set up headers: ' + error.toString(), Browser.Buttons.OK);
  }
}

/**
 * Creates a custom menu to run the setup
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🔧 Sheet Setup')
    .addItem('📋 Set Up Headers (One-Time)', 'setupSheetHeaders')
    .addToUi();
}
