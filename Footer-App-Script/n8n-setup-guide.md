# n8n FTP to Google Drive Sync - Setup Guide

## Overview
This guide shows how to sync Reynolds FTP inventory files to Google Drive using n8n, allowing Google Apps Script to read them.

## Architecture
```
Reynolds FTP → n8n (hourly) → Google Drive → Apps Script → Customer.io
```

---

## Step 1: Deploy n8n

### Option A: n8n Cloud (Recommended for simplicity)
1. Go to https://n8n.io
2. Sign up for an account
3. Start a workspace ($20/month)

### Option B: Self-Hosted (Free)
```bash
# Install via Docker (recommended)
docker run -d \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  -e N8N_BASIC_AUTH_ACTIVE=true \
  -e N8N_BASIC_AUTH_USER=admin \
  -e N8N_BASIC_AUTH_PASSWORD=your_secure_password \
  n8nio/n8n

# Access at http://localhost:5678
```

---

## Step 2: Set Up Google Drive

1. **Create a dedicated folder** in Google Drive:
   - Name it: `Reynolds Inventory Files`
   - Right-click → Share → Copy link
   - Extract the Folder ID from the URL:
     ```
     https://drive.google.com/drive/folders/1ABC123XYZ789
                                          ↑
                                    This is your FOLDER_ID
     ```

2. **Note the Folder ID** - you'll need it for n8n

---

## Step 3: Configure n8n Environment Variables

In n8n, go to **Settings → Variables** and add:

```
FTP_HOST=your-reynolds-ftp-host.com
FTP_USER=your_ftp_username
FTP_PASS=your_ftp_password
DRIVE_FOLDER_ID=1ABC123XYZ789
```

---

## Step 4: Import the Workflow

1. In n8n, click **Workflows → Import from File**
2. Upload: `n8n-ftp-to-drive-workflow.json`
3. The workflow will appear with these nodes:

```
Schedule Trigger (hourly)
    ↓
FTP - List Files
    ↓
Filter CSV Files (only *U.csv)
    ↓
FTP - Download File
    ↓
Google Drive - Upload
    ↓
Log Success
```

---

## Step 5: Connect Google Drive to n8n

1. Click the **Google Drive - Upload** node
2. Click **Create New Credential**
3. Choose **OAuth2**
4. Click **Connect my account**
5. Sign in with your Google account
6. Grant permissions

---

## Step 6: Configure FTP Credentials

1. Click the **FTP - List Files** node
2. Click **Create New Credential**
3. Enter:
   - Host: Use environment variable `{{$env.FTP_HOST}}`
   - Port: 21
   - Username: Use environment variable `{{$env.FTP_USER}}`
   - Password: Use environment variable `{{$env.FTP_PASS}}`

---

## Step 7: Test the Workflow

1. Click **Execute Workflow** (top right)
2. Check the output of each node
3. Verify files appear in Google Drive

Expected files:
```
SWICKARD12U.csv (Acura Thousand Oaks)
AUDIOAKL01U.csv (Audi Oakland)
AUDIPALO01U.csv (Audi Palo Alto)
... and 27 more files
```

---

## Step 8: Activate the Workflow

1. Toggle the **Active** switch (top right)
2. The workflow will now run every hour automatically

---

## Step 9: Update Apps Script to Read from Drive

The Apps Script has been updated to read from Google Drive instead of FTP.

See `Pre_Owned_Inventory_Sync.js` - the `downloadInventoryFile()` function now uses:
```javascript
DriveApp.getFolderById('YOUR_FOLDER_ID')
```

---

## Monitoring & Troubleshooting

### Check Execution History
- Go to **Executions** in n8n
- View logs for each run
- See which files were synced

### Common Issues

**Issue: FTP connection fails**
- Check FTP credentials in environment variables
- Verify FTP host allows connections from n8n IP
- Test FTP connection manually with FileZilla

**Issue: Google Drive upload fails**
- Re-authenticate Google Drive credential
- Check folder permissions
- Verify folder ID is correct

**Issue: Files not appearing in Drive**
- Check file filter (only files ending in `U.csv`)
- Verify FTP path `/inventory/` is correct
- Check n8n execution logs

### Manual Trigger
You can manually trigger the workflow:
1. Open the workflow
2. Click **Execute Workflow**
3. Watch it run in real-time

---

## Cost Estimate

### n8n Cloud
- **Basic Plan**: $20/month
- Includes: 2,500 workflow executions/month
- This workflow: ~720 executions/month (hourly)
- ✅ Well within limits

### Self-Hosted (Free)
- **Server cost**: ~$5-10/month (DigitalOcean, AWS, etc.)
- **n8n**: Free (open source)
- **Total**: $5-10/month

---

## Next Steps

1. ✅ Import workflow to n8n
2. ✅ Configure environment variables
3. ✅ Connect Google Drive
4. ✅ Test workflow
5. ✅ Activate for hourly sync
6. ✅ Update Apps Script with Drive Folder ID
7. ✅ Test Apps Script inventory sync

---

## Advanced: Custom Schedule

To change sync frequency, edit the **Schedule Trigger** node:

**Every 30 minutes:**
```
Interval: 30 minutes
```

**Every 4 hours:**
```
Interval: 4 hours
```

**Daily at 2 AM:**
```
Cron: 0 2 * * *
```

**Business hours only (9 AM - 5 PM):**
```
Cron: 0 9-17 * * 1-5
```

---

## Support Resources

- **n8n Docs**: https://docs.n8n.io
- **n8n Community**: https://community.n8n.io
- **FTP Node Docs**: https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.ftp/
- **Google Drive Node Docs**: https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.googledrive/
