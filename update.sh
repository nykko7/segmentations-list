#!/bin/bash

# Stop script if any command fails
# Fail if any command in a pipe fails
# Fail if using undeclared variable
set -euo pipefail

# Capture errors and show more information
trap 'echo "Error on line $LINENO: Command: $BASH_COMMAND. Exit code: $?"' ERR

echo "Step 1: Stopping current process..."
pm2 delete segmentations_list || true

echo "Step 2: Pulling latest changes..."
sudo git pull

echo "Step 3: Installing dependencies..."
pnpm install

# echo "Step 4: Pushing database changes..."
# sudo pnpm db:push

echo "Step 4: Building project..."
pnpm build

echo "Step 5: Starting with PM2..."
pm2 start --name "segmentations_list" pnpm -- start

echo "Update process completed successfully!"
