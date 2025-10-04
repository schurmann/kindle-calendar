#!/usr/bin/env sh

# Get script directory
DIR="$(dirname "$0")"

# Source environment configuration
if [ -f "$DIR/env.sh" ]; then
    . "$DIR/env.sh"
else
    echo "Error: Environment file $DIR/env.sh not found"
    exit 1
fi

# Configuration
DASH_PNG="$DIR/dash.png"

# Function to log messages (following reference format)
log() {
    echo "[$(date -u)] $1"
}

init() {
  echo powersave >/sys/devices/system/cpu/cpu0/cpufreq/scaling_governor
  lipc-set-prop com.lab126.powerd preventScreenSaver 1
  top stackdumpd # trying to not generate a KPP / TODO core dump when stopping other services... but doesn't work.

  trap "" SIGTERM
  stop lab126_gui # `stop framework` causes a crash
  trap - SIGTERM

  # OTA update related processes
  # https://www.mobileread.com/forums/showpost.php?p=2422385&postcount=6
  # https://www.mobileread.com/forums/showpost.php?p=2008593&postcount=13
  stop otaupd # over-the-air update
  stop phd # phone home
  stop tmd # transfer manager
  stop todo
  
  # Other stuff
  stop webreader # browser
  
  sleep 2 # so we don't start before the blank screen

  eips -c -f # do a full screen clear
}

# Function to display image on Kindle (using full path like reference)
display_image() {
    if [ -f "$1" ]; then
        /usr/sbin/eips -f -g "$1"
        log "Displayed image: $1"
    else
        log "Error: Image file not found: $1"
    fi
}

# Function to validate PNG file
validate_png() {
    local file="$1"
    if [ ! -f "$file" ]; then
        log "File does not exist: $file"
        return 1
    fi

    local filesize=$(wc -c < "$file")
    log "Downloaded file size: $filesize bytes"
    return 0
}

# Function to get current time in specified timezone
get_current_time() {
    # Try to use TZ environment variable if available
    if command -v date >/dev/null 2>&1; then
        TZ="$TIMEZONE" date '+%H:%M'
    else
        # Fallback to system date
        date '+%H:%M'
    fi
}

# Function to get current hour in specified timezone
get_current_hour() {
    # Try to use TZ environment variable if available
    if command -v date >/dev/null 2>&1; then
        TZ="$TIMEZONE" date '+%H'
    else
        # Fallback to system date
        date '+%H'
    fi
}

# Function to check if it's day time (08:00-23:00)
is_day_time() {
    local hour=$(get_current_hour)
    # Convert hour to integer (remove leading zero if present)
    hour=$(echo "$hour" | sed 's/^0//')

    if [ "$hour" -ge 8 ] && [ "$hour" -lt 23 ]; then
        return 0  # true - it's day time
    else
        return 1  # false - it's night time
    fi
}

# Function to calculate dynamic interval based on current time
get_dynamic_interval() {
    if is_day_time; then
        echo 600   # 10 minutes during active hours
    else
        echo 7200  # 2h during night hours
    fi
}


# Function to get battery level
get_battery_level() {
    local battery_level=""

    # Try to get battery level using gasgauge-info
    if command -v gasgauge-info >/dev/null 2>&1; then
        battery_level=$(gasgauge-info -c 2>/dev/null | grep -o '[0-9]\+' | head -1)
    fi

    # Fallback to reading from /sys if gasgauge-info fails
    if [ -z "$battery_level" ] && [ -f "/sys/class/power_supply/mc13892_bat/capacity" ]; then
        battery_level=$(cat "/sys/class/power_supply/mc13892_bat/capacity" 2>/dev/null)
    fi

    # Another fallback location
    if [ -z "$battery_level" ] && [ -f "/sys/class/power_supply/max77696-battery/capacity" ]; then
        battery_level=$(cat "/sys/class/power_supply/max77696-battery/capacity" 2>/dev/null)
    fi

    echo "$battery_level"
}

# Function to fetch and display image (following reference pattern)
fetch_and_display() {
    # Check if credentials are set as environment variables
    if [ -z "$API_USERNAME" ] || [ -z "$API_PASSWORD" ]; then
        log "Error: API_USERNAME and API_PASSWORD environment variables must be set"
        return 1
    fi

    # Get battery level and construct URL with battery parameter
    local battery_level=$(get_battery_level)
    local url_with_battery="$IMAGE_URL"

    if [ -n "$battery_level" ]; then
        # Add battery parameter to URL
        if echo "$IMAGE_URL" | grep -q '?'; then
            url_with_battery="${IMAGE_URL}&battery=${battery_level}"
        else
            url_with_battery="${IMAGE_URL}?battery=${battery_level}"
        fi
        log "Battery level: ${battery_level}%"
    else
        log "Could not determine battery level"
    fi

    log "Fetching image from: $url_with_battery"

    # Use curl with Basic Auth for authentication
    curl -s -L -u "$API_USERNAME:$API_PASSWORD" -o "$DASH_PNG.tmp" "$url_with_battery"
    download_status=$?

    if [ "$download_status" -ne 0 ]; then
        log "Failed to download image (status $download_status)"
        # If the image already exists, we'll use it as fallback
        if [ ! -f "$DASH_PNG" ]; then
            log "No fallback image available."
            return 1
        fi
        log "Using existing image as fallback"
    else
        log "Download completed"

        # Validate the downloaded PNG
        if validate_png "$DASH_PNG.tmp"; then
            # If validation successful, replace the current image
            mv "$DASH_PNG.tmp" "$DASH_PNG"
            log "Successfully fetched new image"
        else
            log "Downloaded image failed validation - keeping previous image"
            rm -f "$DASH_PNG.tmp"
        fi
    fi

    # Display the image (current or fallback)
    if [ -f "$DASH_PNG" ]; then
        display_image "$DASH_PNG"
    else
        log "No image available to display"
        return 1
    fi
}

# Set up signal handlers
trap 'log "Shutting down..."; exit 0' INT TERM

# Main loop
log "Starting Kindle dashboard fetcher"
log "Image URL: $IMAGE_URL"
log "Timezone: $TIMEZONE"
log "Current time: $(get_current_time)"

init
"$DIR/wait_for_wifi.sh" 1.1.1.1 && fetch_and_display

# Periodic updates with dynamic intervals
while true; do
    CURRENT_INTERVAL=$(get_dynamic_interval)
    current_time=$(get_current_time)
    log "Current time: $current_time, Next update in: ${CURRENT_INTERVAL} seconds"
    rtcwake -d /dev/rtc1 -m mem -s "$CURRENT_INTERVAL"
    "$DIR/wait_for_wifi.sh" 1.1.1.1 && fetch_and_display
done
