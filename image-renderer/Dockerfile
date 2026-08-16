FROM oven/bun:1.3

# Skips the postinstall download; the shell is installed explicitly below.
# Puppeteer 25 renamed this from PUPPETEER_SKIP_CHROMIUM_DOWNLOAD and no longer
# honours the old name, which makes postinstall pull full Chrome as well.
ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_CACHE_DIR=/opt/puppeteer
ENV CONTAINER=1

# Shared libraries chrome-headless-shell links against (from ldd on the binary),
# plus fonts to support major charsets including emojis. Unlike
# google-chrome-stable this pulls in no desktop or X11 stack. unzip is needed to
# extract the browser download: puppeteer 25 dropped its bundled zip extractor.
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        ca-certificates \
        fonts-freefont-ttf \
        fonts-liberation \
        fonts-noto-color-emoji \
        libasound2 \
        libatk-bridge2.0-0 \
        libatk1.0-0 \
        libatspi2.0-0 \
        libdbus-1-3 \
        libexpat1 \
        libgbm1 \
        libglib2.0-0 \
        libnspr4 \
        libnss3 \
        libx11-6 \
        libxcb1 \
        libxcomposite1 \
        libxdamage1 \
        libxext6 \
        libxfixes3 \
        libxkbcommon0 \
        libxrandr2 \
        unzip \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files and install dependencies
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Install the headless shell at the version pinned by the puppeteer package
RUN bunx puppeteer browsers install chrome-headless-shell

# Copy source code
COPY . .

# Expose port and run the app
EXPOSE 3000
ENTRYPOINT ["bun", "src/index.tsx"]

