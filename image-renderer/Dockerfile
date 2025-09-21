FROM oven/bun:1.2

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Install latest chrome dev package and fonts to support major charsets including emojis
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        fonts-freefont-ttf \
        fonts-liberation \
        fonts-noto-color-emoji \
        wget \
        gnupg \
        software-properties-common \
    && wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list \
    && apt-get update \
    && apt-get install -y google-chrome-stable \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files and install dependencies
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Expose port and run the app
EXPOSE 3000
ENTRYPOINT ["bun", "src/index.tsx"]

