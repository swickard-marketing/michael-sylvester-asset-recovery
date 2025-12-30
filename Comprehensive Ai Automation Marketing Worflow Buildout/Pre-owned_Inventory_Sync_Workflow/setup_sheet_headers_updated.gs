/**
 * UPDATED VERSION: Sets up headers for Pre-Owned Specials Automation
 * Stock filters (P-Q) removed - now in separate "Configuration" sheet
 *
 * Instructions:
 * 1. Open Google Sheet: "Pre-Owned Specials Automation"
 * 2. Extensions → Apps Script
 * 3. Replace existing setupSheetHeaders function with this code
 * 4. Click Run → setupPreOwnedSheetHeaders
 * 5. Authorize when prompted
 * 6. Check the sheet - row 1 should have all headers
 */

function setupPreOwnedSheetHeaders() {
  try {
    const ss = SpreadsheetApp.openById('1PkU3Sh9fgWWaz25OqymT2P_EWzB_UvWghgrizTWjHlA');
    const sheet = ss.getSheetByName('Pre-Owned Specials Automation');

    if (!sheet) {
      Browser.msgBox('Error', 'Sheet not found: Pre-Owned Specials Automation', Browser.Buttons.OK);
      return;
    }

    // Show start notification
    ss.toast('Setting up headers...', 'Setup', 5);

  // Define headers A-AS (43 columns - P-Q removed)
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
    'Mileage',                      // M
    'certified_pre_owned',          // N

    // O-R: Reserved (4 columns)
    '',                             // O (reserved)
    '',                             // P (reserved - was Stock_Include, now in Config sheet)
    '',                             // Q (reserved - was Stock_Exclude, now in Config sheet)
    '',                             // R (reserved/spacing)

    // S: Timestamp (1 column)
    'last_updated',                 // S

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

  // Set width for last_updated
  sheet.setColumnWidth(19, 150); // S: last_updated

  // Set widths for subject line columns (T-AS)
  for (let i = 20; i <= 45; i++) {
    sheet.setColumnWidth(i, 200);
  }

  // CRITICAL: Flush all pending changes to ensure they persist
  SpreadsheetApp.flush();

  // Log success
  Logger.log('Headers set up successfully!');
  Logger.log(`Total columns: ${headers.length}`);
  Logger.log('A-N (14): Core Vehicle Data');
  Logger.log('O-R: Reserved (P-Q now in Configuration sheet)');
  Logger.log('S: last_updated');
  Logger.log('T-AS (26): Subject Lines');

  // Show success message
  const message = `Headers configured successfully!\n\n` +
                  `Column Breakdown:\n` +
                  `• A-N (14 columns): Vehicle Data\n` +
                  `• O-R: Reserved\n` +
                  `• S: last_updated timestamp\n` +
                  `• T-AS (26 columns): Subject Lines\n\n` +
                  `Formatting Applied:\n` +
                  `• Headers: Arial 8px, black background, white text\n` +
                  `• Row 1 is frozen\n` +
                  `• Columns auto-sized\n\n` +
                  `NOTE: Stock filters moved to Configuration sheet\n` +
                  `• Columns P-Q no longer used on this sheet\n` +
                  `• Stock_Include and Stock_Exclude now in Configuration sheet\n\n` +
                  `Next Steps:\n` +
                  `1. Create Configuration sheet (if not exists)\n` +
                  `2. Add stock filters to Configuration sheet\n` +
                  `3. Add subject line data to columns T-AS\n` +
                  `4. Run the FTP sync from the menu`;

  Browser.msgBox('Setup Complete', message, Browser.Buttons.OK);

  // Final confirmation toast
  ss.toast('Headers setup complete! Check row 1.', 'Success', 5);

  } catch (error) {
    Logger.log('Error in setupSheetHeaders: ' + error.toString());
    Browser.msgBox('Error', 'Failed to set up headers: ' + error.toString(), Browser.Buttons.OK);
  }
}

/**
 * Sets up the Configuration sheet for stock filters
 */
function setupPreOwnedConfigSheet() {
  try {
    const ss = SpreadsheetApp.openById('1PkU3Sh9fgWWaz25OqymT2P_EWzB_UvWghgrizTWjHlA');

    // Check if Configuration sheet exists
    let configSheet = ss.getSheetByName('Configuration');

    // Create it if it doesn't exist
    if (!configSheet) {
      configSheet = ss.insertSheet('Configuration');
      Logger.log('Created Configuration sheet');
    }

    // Set up headers
    configSheet.getRange('A1').setValue('Stock_Include');
    configSheet.getRange('B1').setValue('Stock_Exclude');

    // Format headers
    const headerRange = configSheet.getRange('A1:B1');
    headerRange.setFontFamily('Arial');
    headerRange.setFontSize(10);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#4285f4');  // Blue background
    headerRange.setFontColor('#ffffff');   // White text

    // Freeze header row
    configSheet.setFrozenRows(1);

    // Set column widths
    configSheet.setColumnWidth(1, 150);  // A: Stock_Include
    configSheet.setColumnWidth(2, 150);  // B: Stock_Exclude

    // Add notes
    configSheet.getRange('A1').setNote('Enter stock numbers to INCLUDE (whitelist). One stock number per row. Leave column empty to include all vehicles (after exclusions).');
    configSheet.getRange('B1').setNote('Enter stock numbers to EXCLUDE (blacklist). One stock number per row. These are removed FIRST, highest priority.');

    // Flush changes
    SpreadsheetApp.flush();

    const message = `Configuration sheet setup complete!\n\n` +
                    `Sheet: Configuration\n` +
                    `Headers:\n` +
                    `• Column A: Stock_Include (whitelist)\n` +
                    `• Column B: Stock_Exclude (blacklist)\n\n` +
                    `Usage:\n` +
                    `• Add stock numbers starting from row 2\n` +
                    `• One stock number per row\n` +
                    `• Leave cells empty if not needed\n\n` +
                    `Example:\n` +
                    `  A2: 12345    B2: 99999\n` +
                    `  A3: 67890    B3: 88888\n` +
                    `  A4: 11111`;

    Browser.msgBox('Configuration Sheet Ready', message, Browser.Buttons.OK);
    ss.toast('Configuration sheet created!', 'Success', 5);

  } catch (error) {
    Logger.log('Error in setupConfigurationSheet: ' + error.toString());
    Browser.msgBox('Error', 'Failed to set up Configuration sheet: ' + error.toString(), Browser.Buttons.OK);
  }
}

/**
 * Creates a custom menu to run the setup functions
 */
function onOpenPreOwnedSetup() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🚗 Pre-Owned Setup')
    .addItem('Set Up Main Sheet Headers', 'setupPreOwnedSheetHeaders')
    .addItem('Set Up Configuration Sheet', 'setupPreOwnedConfigSheet')
    .addToUi();
}
