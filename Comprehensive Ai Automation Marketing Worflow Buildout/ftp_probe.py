#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
FTP Server Probe Script
Connects to FTP server and explores directory structure to find *U.csv files
"""

import ftplib
import os
import sys
from datetime import datetime

# Simpler output without emojis for Windows compatibility

# FTP Configuration
FTP_HOST = "ftp.maxdigital.com"
FTP_USER = "109424_Google"
FTP_PASS = "nwdngmsS"

def probe_ftp_directory(ftp, path="", level=0, max_level=3):
    """
    Recursively probe FTP directory structure

    Args:
        ftp: FTP connection object
        path: Current path being explored
        level: Current recursion level
        max_level: Maximum depth to explore
    """
    indent = "  " * level

    try:
        # Try to change to the directory
        if path:
            print(f"{indent}[DIR] Exploring: {path}")
            ftp.cwd(path)
        else:
            print(f"{indent}[DIR] Exploring: ROOT directory")

        # Get current working directory
        current_dir = ftp.pwd()
        print(f"{indent}   Current PWD: {current_dir}")

        # List all items in current directory
        items = []
        ftp.retrlines('NLST', items.append)

        print(f"{indent}   Found {len(items)} items:")

        # Separate files and directories
        files = []
        directories = []

        for item in items:
            try:
                # Try to CWD to check if it's a directory
                original_dir = ftp.pwd()
                ftp.cwd(item)
                directories.append(item)
                ftp.cwd(original_dir)
                print(f"{indent}   [SUBDIR] {item}")
            except:
                # It's a file
                files.append(item)
                # Check if it's a *U.csv file
                if item.endswith('U.csv'):
                    print(f"{indent}   [USED FILE] {item} <<< TARGET")
                else:
                    print(f"{indent}   [FILE] {item}")

        # If we found *U.csv files, report the path
        used_files = [f for f in files if f.endswith('U.csv')]
        if used_files:
            print(f"\n*** FOUND {len(used_files)} USED INVENTORY FILES IN: {current_dir} ***")
            print(f"   Example files: {', '.join(used_files[:5])}")
            if len(used_files) > 5:
                print(f"   ... and {len(used_files) - 5} more")

        # Recurse into subdirectories (if not at max depth)
        if level < max_level and directories:
            print(f"{indent}   Exploring {len(directories)} subdirectories...")
            for directory in directories:
                try:
                    probe_ftp_directory(ftp, directory, level + 1, max_level)
                    # Go back to parent directory
                    ftp.cwd('..')
                except Exception as e:
                    print(f"{indent}   [ERROR] exploring {directory}: {str(e)}")

    except Exception as e:
        print(f"{indent}[ERROR]: {str(e)}")

def main():
    """Main probe function"""
    print("=" * 80)
    print("FTP SERVER PROBE")
    print("=" * 80)
    print(f"Host: {FTP_HOST}")
    print(f"User: {FTP_USER}")
    print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 80)
    print()

    try:
        # Connect to FTP
        print(f"[CONNECT] Connecting to {FTP_HOST}...")
        ftp = ftplib.FTP(FTP_HOST)

        print(f"[LOGIN] Logging in as {FTP_USER}...")
        ftp.login(FTP_USER, FTP_PASS)

        print("[SUCCESS] Connected successfully!")
        print()

        # Get welcome message
        welcome = ftp.getwelcome()
        if welcome:
            print(f"[SERVER MSG] {welcome}")
            print()

        # Start probing from root
        probe_ftp_directory(ftp, "", 0, 3)

        print()
        print("=" * 80)
        print("PROBE COMPLETE")
        print("=" * 80)

        # Try some common paths explicitly
        print("\n[TEST] Testing common path variations:")
        test_paths = [
            "",
            ".",
            "/",
            "inventory",
            "/inventory",
            "inventory/",
            "/inventory/",
            "files",
            "data",
            "csv"
        ]

        for test_path in test_paths:
            try:
                original = ftp.pwd()
                if test_path:
                    ftp.cwd(test_path)
                items = []
                ftp.retrlines('NLST', items.append)
                used_files = [f for f in items if f.endswith('U.csv')]

                if used_files:
                    print(f"[MATCH] Path '{test_path}' -> Found {len(used_files)} *U.csv files")
                    print(f"   Current PWD after cwd('{test_path}'): {ftp.pwd()}")
                    print(f"   *** n8n Path should be: '{test_path}' ***")
                else:
                    print(f"[INFO] Path '{test_path}' -> {len(items)} items, but no *U.csv files")

                ftp.cwd(original)
            except Exception as e:
                print(f"[ERROR] Path '{test_path}' -> {str(e)}")

        # Close connection
        ftp.quit()
        print("\n[DONE] FTP connection closed.")

    except Exception as e:
        print(f"\n[FATAL ERROR] {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
