import { afterAll, beforeAll, expect, setSystemTime, test } from "bun:test";
import sharp from "sharp";
import renderer from "../src/index";

const width = 1072;
const height = 1448;
const previousProvider = process.env.CALENDAR_PROVIDER;
let server: ReturnType<typeof Bun.serve> | undefined;

beforeAll(() => {
  process.env.CALENDAR_PROVIDER = "mock";
  setSystemTime(new Date(2026, 10, 24, 8));
  server = Bun.serve({ ...renderer, port: 0, hostname: "127.0.0.1" });
});

afterAll(async () => {
  await server?.stop(true);
  setSystemTime();
  if (previousProvider === undefined) {
    delete process.env.CALENDAR_PROVIDER;
  } else {
    process.env.CALENDAR_PROVIDER = previousProvider;
  }
});

test("calendar shows timed and multi-day events and the supplied battery level", async () => {
  const response = await fetch(`${server!.url.origin}/calendar?battery=83`);
  expect(response.status).toBe(200);
  const html = await response.text();
  expect(html).toContain("Second breakfast with Sam");
  expect(html).toContain("09:00");
  expect(html).toContain("Harvest Festival at the Green Dragon");
  expect(html).toContain("t.o.m.");
  expect(html).toContain("83%");
});

async function dashboardPixels(query = "") {
  const response = await fetch(`${server!.url.origin}/dashboard.png${query}`);
  expect(response.status).toBe(200);
  expect(response.headers.get("content-type")).toBe("image/png");

  const png = Buffer.from(await response.arrayBuffer());
  expect(png.subarray(0, 8)).toEqual(
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
  );
  expect(png.toString("ascii", 12, 16)).toBe("IHDR");
  expect(png.readUInt32BE(16)).toBe(width);
  expect(png.readUInt32BE(20)).toBe(height);
  expect(png[24]).toBe(8);
  expect(png[25]).toBe(0); // PNG grayscale, without alpha.

  return sharp(png).toColourspace("b-w").raw().toBuffer();
}

test("dashboard is a grayscale agenda with an optional battery indicator", async () => {
  const withBattery = await dashboardPixels("?battery=83");
  const withoutBattery = await dashboardPixels();
  expect(withBattery.length).toBe(width * height);
  expect(withoutBattery.length).toBe(width * height);

  // Check regions instead of exact pixels so font and rasterizer differences
  // do not turn a visually equivalent renderer into a test failure.
  function darkPixels(
    pixels: Buffer,
    left: number,
    top: number,
    right: number,
    bottom: number,
  ) {
    let count = 0;
    for (let y = top; y < bottom; y++) {
      for (let x = left; x < right; x++) {
        if (pixels[y * width + x] < 96) count++;
      }
    }
    return count;
  }

  for (const pixels of [withBattery, withoutBattery]) {
    expect(darkPixels(pixels, 180, 65, 1050, 600)).toBeGreaterThan(1000);
  }
  expect(darkPixels(withBattery, 920, 15, 1057, 50)).toBeGreaterThan(100);
  expect(darkPixels(withoutBattery, 920, 15, 1057, 50)).toBe(0);
}, 120_000);
