#!/bin/bash

# Kindle deployment script
KINDLE_HOST="kindle"
REMOTE_PATH="/mnt/us/extensions"
TEMP_ZIP="kual_extension.zip"

echo "Deploying KUAL extension to Kindle..."

# Create zip file from kual directory
if [ -d "kual" ]; then
    echo "Creating zip archive..."
    cd kual
    zip -r "../$TEMP_ZIP" . -x "*/env.sh.example"
    cd ..
else
    echo "Error: kual directory not found"
    exit 1
fi

# Create remote directory if it doesn't exist
ssh "$KINDLE_HOST" "mkdir -p $REMOTE_PATH"

# Copy the zip file
echo "Copying zip to Kindle..."
scp "$TEMP_ZIP" "$KINDLE_HOST:/tmp/"

# Extract on Kindle and clean up
echo "Extracting on Kindle..."
ssh "$KINDLE_HOST" "cd $REMOTE_PATH && unzip -o /tmp/$TEMP_ZIP && rm /tmp/$TEMP_ZIP"

# Make scripts executable
ssh "$KINDLE_HOST" "find $REMOTE_PATH -name '*.sh' -exec chmod +x {} \;"

# Clean up local zip
rm "$TEMP_ZIP"

echo "Deployment complete!"
echo "KUAL extension installed to $REMOTE_PATH"