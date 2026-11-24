# Render the Kindle dashboard directly from agenda data

The HTML preview and Kindle dashboard share agenda preparation. The Kindle dashboard uses SVG for graphics and Sharp for text layout and 8-bit grayscale PNG output, so each request can render locally without starting Chrome or fetching the HTML preview. Event titles wrap, and the dashboard displays only complete event rows within the screen.
