#!/bin/bash

set -e

# Configuration
IMAGE_NAME="ghcr.io/schurmann/kindle-calendar"
DOCKERFILE_PATH="image-renderer/Dockerfile"
BUILD_CONTEXT="image-renderer"

# Get git commit hash for tagging
GIT_HASH=$(git rev-parse --short HEAD)
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

# Build the Docker image
echo "Building Docker image..."
docker build -f "${DOCKERFILE_PATH}" -t "${IMAGE_NAME}:${GIT_HASH}" -t "${IMAGE_NAME}:latest" "${BUILD_CONTEXT}"

# Push the image to GitHub Container Registry
echo "Pushing to GitHub Container Registry..."
docker push "${IMAGE_NAME}:${GIT_HASH}"
docker push "${IMAGE_NAME}:latest"

echo "Successfully built and pushed:"
echo "  ${IMAGE_NAME}:${GIT_HASH}"
echo "  ${IMAGE_NAME}:latest"
