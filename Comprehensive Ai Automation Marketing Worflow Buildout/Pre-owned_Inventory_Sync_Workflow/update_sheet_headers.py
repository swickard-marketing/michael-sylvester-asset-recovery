#!/usr/bin/env python3
"""
Updates Google Sheet headers for Pre-Owned Specials Automation
Writes all headers A-AS to row 1
"""

from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from google.auth.transport.requests import Request
from google_auth_oauthlib.flow import InstalledAppFlow
import os
import pickle

# Sheet configuration
SHEET_ID = '1PkU3Sh9fgWWaz25OqymT2P_EWzB_UvWghgrizTWjHlA'
SHEET_NAME = 'Pre-Owned Specials Automation'
SCOPES = ['https://www.googleapis.com/auth/spreadsheets']

# Define all headers A-AS
HEADERS = [
    # A-O: Core Vehicle Data (15 columns)
    'VIN',                          # A
    'Stock',                        # B
    'vehicle_name',                 # C
    'Dealer_Name',                  # D
    'VDP_URL_1',                    # E
    'Main_Photo',                   # F
    'Price_Is',                     # G
    'Price_Was',                    # H
    'Make',                         # I
    'Model',                        # J
    'Year',                         # K
    'Trim',                         # L
    'certified_pre_owned',          # M
    'Mileage',                      # N
    'last_updated',                 # O

    # P-Q: Stock Filters (2 columns)
    'Stock_Include',                # P
    'Stock_Exclude',                # Q

    # R-S: Reserved (2 columns)
    '',                             # R (reserved)
    '',                             # S (reserved)

    # T-AS: Subject Lines & Preheaders (26 columns)
    'Luxury_Subject_Line',                          # T
    'Luxury_Preheader',                             # U
    'Lifestyle_Subject_Line',                       # V
    'Lifestyle_Preheader',                          # W
    'Alternative_Luxury_Subject_Line',              # X
    'Alternative_Luxury_Preheader',                 # Y
    'Alternative_Lifestyle_Subject_Line',           # Z
    'Alternative_Lifestyle_Preheader',              # AA
    'FollowUp1_Luxury_Subject_Line',                # AB
    'FollowUp1_Luxury_Preheader',                   # AC
    'FollowUp1_Lifestyle_Subject_Line',             # AD
    'FollowUp1_Lifestyle_Preheader',                # AE
    'FollowUp1_Alternative_Luxury_Subject_Line',    # AF
    'FollowUp1_Alternative_Luxury_Preheader',       # AG
    'FollowUp1_Alternative_Lifestyle_Subject_Line', # AH
    'FollowUp1_Alternative_Lifestyle_Preheader',    # AI
    'FollowUp2_Luxury_Subject_Line',                # AJ
    'FollowUp2_Luxury_Preheader',                   # AK
    'FollowUp2_Lifestyle_Subject_Line',             # AL
    'FollowUp2_Lifestyle_Preheader',                # AM
    'FollowUp2_Alternative_Luxury_Subject_Line',    # AN
    'FollowUp2_Alternative_Luxury_Preheader',       # AO
    'FollowUp2_Alternative_Lifestyle_Subject_Line', # AP
    'FollowUp2_Alternative_Lifestyle_Preheader',    # AQ
    '',                                              # AR (reserved)
    '',                                              # AS (reserved)
]

def get_credentials():
    """Get Google Sheets API credentials"""
    creds = None
    token_path = 'token.pickle'

    # Load existing credentials
    if os.path.exists(token_path):
        with open(token_path, 'rb') as token:
            creds = pickle.load(token)

    # If no valid credentials, get new ones
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                'credentials.json', SCOPES)
            creds = flow.run_local_server(port=0)

        # Save credentials
        with open(token_path, 'wb') as token:
            pickle.dump(creds, token)

    return creds

def update_headers():
    """Update sheet headers"""
    print("Connecting to Google Sheets API...")
    creds = get_credentials()
    service = build('sheets', 'v4', credentials=creds)

    # Prepare the update
    range_name = f'{SHEET_NAME}!A1:AS1'
    values = [HEADERS]
    body = {'values': values}

    print(f"Updating headers in sheet: {SHEET_ID}")
    print(f"Range: {range_name}")
    print(f"Total headers: {len(HEADERS)}")

    # Update the sheet
    result = service.spreadsheets().values().update(
        spreadsheetId=SHEET_ID,
        range=range_name,
        valueInputOption='RAW',
        body=body
    ).execute()

    print(f"\n✓ Successfully updated {result.get('updatedCells')} cells")
    print(f"✓ Updated range: {result.get('updatedRange')}")

    # Format headers (bold)
    print("\nFormatting headers (bold)...")
    requests = [{
        'repeatCell': {
            'range': {
                'sheetId': 0,  # Assumes first sheet
                'startRowIndex': 0,
                'endRowIndex': 1,
                'startColumnIndex': 0,
                'endColumnIndex': len(HEADERS)
            },
            'cell': {
                'userEnteredFormat': {
                    'textFormat': {
                        'bold': True
                    }
                }
            },
            'fields': 'userEnteredFormat.textFormat.bold'
        }
    }]

    body = {'requests': requests}
    service.spreadsheets().batchUpdate(
        spreadsheetId=SHEET_ID,
        body=body
    ).execute()

    print("✓ Headers formatted (bold)")

    # Print column breakdown
    print("\n" + "="*60)
    print("HEADER BREAKDOWN:")
    print("="*60)
    print(f"A-O (15 columns): Vehicle Data")
    print(f"  VIN, Stock, vehicle_name, Dealer_Name, VDP_URL_1, Main_Photo,")
    print(f"  Price_Is, Price_Was, Make, Model, Year, Trim,")
    print(f"  certified_pre_owned, Mileage, last_updated")
    print(f"\nP-Q (2 columns): Stock Filters")
    print(f"  Stock_Include, Stock_Exclude")
    print(f"\nR-S (2 columns): Reserved")
    print(f"\nT-AS (26 columns): Subject Lines & Preheaders")
    print(f"  (Original, FollowUp1, FollowUp2 variations)")
    print("="*60)

if __name__ == '__main__':
    try:
        update_headers()
        print("\n✅ Sheet headers updated successfully!")
    except FileNotFoundError as e:
        print("\n❌ Error: credentials.json not found")
        print("\nTo set up Google Sheets API credentials:")
        print("1. Go to https://console.cloud.google.com/")
        print("2. Enable Google Sheets API")
        print("3. Create OAuth 2.0 credentials")
        print("4. Download as 'credentials.json' to this folder")
    except Exception as e:
        print(f"\n❌ Error: {e}")
