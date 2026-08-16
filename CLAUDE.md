# Kindle dashboard

## Overview

Technical specification for the Kindle dashboard architecture

## System Architecture

### Hardware Environment

- **Architecture**: armv7l
- **OS**: Linux-based custom system
- **Kernel**: 4.1.15-lab126
- **Display**: E-ink display (1072x1448 pixels, ~300 DPI)
- **Image Format**: 8-bit grayscale PNG required

### Software Stack

- Bash script running on the kindle. It will fetch an image at an interval
- Containerized server that generates image that is displayed on the kindle

#### SSH Access

```bash
ssh kindle
```

### Display System

- **Format**: 8-bit grayscale PNG only
- **Resolution**: 1072x1448 pixels (specific device tested)
- **Framework**: FBInk for direct framebuffer access

## Kindle Dashboard Application

### Project Overview

Transforms jailbroken Kindle into customizable dashboard display using periodic image fetching from remote server.

### Architecture

- **Client Component**: Runs on Kindle device
- **Backend Component**: Containerized server serving images
- **Communication**: HTTP requests for PNG image retrieval
- **Display Method**: Direct e-ink screen rendering

### Core Components

- **fetch_and_display.sh**: Main script for periodic image fetching
- **env.sh**: Configuration variables

### Technical Requirements

- **Image Format**: 8-bit grayscale PNG
- **Resolution**: Device-specific (use `eips -i` to determine)
- **Network**: WiFi connectivity required

### Use Cases

- Display calendar on the kindle
- Custom information panels
- Low-power always-on displays

### Troubleshooting

- **Process Check**: `ps aux | grep fetch_and_display.sh`

### Related Projects

- **Backend**: kindle-dash-backend repository
- **Community**: MobileRead Wiki, KindModding Discord

## Backend Server Component

### Overview

Containerized backend that serves dashboard images to Kindle clients via HTTP requests.

### Architecture

- **Platform**: Docker container
- **Runtime**: TypeScript with JSX
- **Framework**: Hono web framework
- **Build Tool**: Bun
- **Development**: Bun

### Project Structure

- **Components**: Modular JSX components for UI elements
- **Configuration**: Application constants and environment handling
- **Types**: TypeScript interfaces and type definitions
- **Utilities**: Helper functions for data processing

### Technology Stack

- **JSX Components**: Type-safe React-style components with Hono JSX
- **TypeScript**: Full type safety with strict configuration
- **Date Handling**: date-fns library for reliable date operations
- **Calendar Integration**: Google Calendar API with OAuth service account
- **Image Processing**: Puppeteer for grayscale conversion
- **Environment Management**: Environment variables

### API Endpoints

- **`/dashboard.png`**: PNG image generation for Kindle display
- **`/calendar`**: HTML calendar view with battery status support

### Features

- **Battery Status**: CSS-only battery icon with percentage display
- **Calendar Display**: Multi-calendar support with event deduplication
- **Responsive Layout**: Swedish locale, week-based organization
- **Image Optimization**: Automatic grayscale conversion for e-ink displays
- **Type Safety**: Complete TypeScript coverage with JSX components

### Configuration

Environment variables:
- Calendar IDs (comma-separated)
- Google service account credentials
- Project configuration

### Development

```bash
# Install dependencies
bun install

# Start development server (requires Google Calendar credentials)
bun run dev

# Start development server with mock data (no credentials needed)
CALENDAR_PROVIDER=mock bun run dev

# Build and run container
docker build -t kindle-calendar .
docker run -p 3000:3000 kindle-calendar
```

**Mock Data**: The server includes mock calendar data featuring Hobbit-themed events for testing without Google Calendar API setup. Set `CALENDAR_PROVIDER=mock` to use it.

### Implementation Notes

- **Component Architecture**: Modular, reusable JSX components with TypeScript
- **Template System**: React-style JSX with conditional rendering
- **Build Process**: Docker containerization with Bun runtime
