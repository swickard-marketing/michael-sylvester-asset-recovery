# n8n + Google Drive Setup Checklist

Quick checklist to get FTP → Drive → Apps Script working.

---

## ✅ Setup Steps

### 1. Google Drive Setup (5 minutes)

- [ ] Create folder in Google Drive named `Reynolds Inventory Files`
- [ ] Open the folder and copy the Folder ID from URL
  ```
  https://drive.google.com/drive/folders/1ABC123XYZ789
                                          ↑ Copy this
  ```
- [ ] Save the Folder ID somewhere safe

---

### 2. n8n Setup (15 minutes)

**Option A: n8n Cloud**
- [ ] Go to https://n8n.io and sign up
- [ ] Create a new workspace
- [ ] Note: $20/month but includes 2,500 executions

**Option B: Self-Hosted (Free)**
- [ ] Run: `docker run -d --name n8n -p 5678:5678 n8nio/n8n`
- [ ] Access at http://localhost:5678

---

### 3. Import n8n Workflow (10 minutes)

- [ ] In n8n, click **Workflows → Import from File**
- [ ] Upload `n8n-ftp-to-drive-workflow.json`
- [ ] Go to **Settings → Variables** and add:
  ```
  FTP_HOST=your-reynolds-ftp-host.com
  FTP_USER=your_ftp_username
  FTP_PASS=your_ftp_password
  DRIVE_FOLDER_ID=1ABC123XYZ789 (from step 1)
  ```

---

### 4. Connect Google Drive to n8n (5 minutes)

- [ ] Click the **Google Drive - Upload** node in workflow
- [ ] Click **Create New Credential**
- [ ] Choose **OAuth2**
- [ ] Click **Connect my account**
- [ ] Sign in with Google and grant permissions

---

### 5. Test the Workflow (2 minutes)

- [ ] Click **Execute Workflow** button (top right)
- [ ] Watch the nodes turn green as they execute
- [ ] Check Google Drive folder - you should see CSV files appearing!
  ```
  Expected files:
  - SWICKARD12U.csv
  - AUDIOAKL01U.csv
  - AUDIPALO01U.csv
  ... and 27 more
  ```

---

### 6. Activate Automatic Sync (1 minute)

- [ ] Toggle the **Active** switch in n8n (top right)
- [ ] Workflow will now run every hour automatically

---

### 7. Configure Apps Script (3 minutes)

- [ ] Open your Google Sheet with Apps Script
- [ ] Go to **Extensions → Apps Script**
- [ ] In the menu, click **Inventory Sync → Configure Settings**
- [ ] Paste your Google Drive Folder ID
- [ ] Click **Save Settings**

---

### 8. Test Apps Script Sync (2 minutes)

- [ ] In Google Sheets, click **Inventory Sync → Sync Selected Dealership...**
- [ ] Choose any dealership (e.g., "Acura Thousand Oaks")
- [ ] Click **Sync Selected**
- [ ] Watch for success message!

---

## 🎉 You're Done!

Your setup is now complete:

```
Reynolds FTP → n8n (hourly) → Google Drive → Apps Script → Customer.io
```

---

## 📊 Expected Results

**After first n8n run:**
- ✅ 30 CSV files in Google Drive
- ✅ Files updated hourly
- ✅ Each file contains vehicle inventory data

**After Apps Script sync:**
- ✅ Customer.io collection updated
- ✅ Up to 20 vehicles per dealership
- ✅ Filtered by stock numbers from sheet

---

## 🔍 Troubleshooting

**Problem: Files not appearing in Drive**
```
Solution:
1. Check n8n execution logs
2. Verify FTP credentials in n8n variables
3. Make sure workflow is Active (toggle is ON)
4. Try manual execution to test
```

**Problem: Apps Script can't find files**
```
Solution:
1. Verify DRIVE_FOLDER_ID is correct
2. Check folder permissions (Apps Script needs read access)
3. Confirm files exist in Drive folder
4. Check Apps Script logs (View → Logs)
```

**Problem: n8n workflow fails**
```
Solution:
1. Check each node's output by clicking on it
2. Verify Google Drive credential is connected
3. Re-authenticate Google Drive if needed
4. Check FTP path is correct (/inventory/)
```

---

## 📞 Need Help?

- **n8n Community**: https://community.n8n.io
- **n8n Docs**: https://docs.n8n.io
- **Full Setup Guide**: See `n8n-setup-guide.md`

---

## 💰 Cost Breakdown

| Service | Cost | Notes |
|---------|------|-------|
| **n8n Cloud** | $20/month | Easiest, no maintenance |
| **n8n Self-Hosted** | Free | Requires server (~$5-10/month) |
| **Google Drive** | Free | 15 GB included |
| **Apps Script** | Free | No limits for this usage |
| **Customer.io** | Varies | Existing service |

**Recommended**: n8n Cloud = **$20/month** total

---

## ⚡ Next Steps

After setup is complete:

1. **Monitor first few syncs** to ensure everything works
2. **Check Customer.io collections** to verify data quality
3. **Adjust n8n schedule** if hourly is too frequent/infrequent
4. **Set up alerts** in n8n for failed executions (optional)

---

Last updated: 2025-10-14
