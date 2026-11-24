/**
 * Regenerates launcher and native launch-screen resources after Capacitor sync.
 * The same transparent emblem is used by the React and initial HTML splash.
 */
const sharp = require("sharp");
const path = require("node:path");
const fs = require("node:fs/promises");

const source = path.resolve(__dirname, "../public/assets/field-guide/tmt-mark.png");
const resources = path.resolve(__dirname, "../android/app/src/main/res");
const mint = "#D9EEE2";
const cream = "#FCF7E9";
const densities = [
  ["mdpi", 48, 108],
  ["hdpi", 72, 162],
  ["xhdpi", 96, 216],
  ["xxhdpi", 144, 324],
  ["xxxhdpi", 192, 432],
];

const transparent = { r: 0, g: 0, b: 0, alpha: 0 };

async function composeIcon(size, scale, background) {
  const innerSize = Math.round(size * scale);
  const mark = await sharp(source).resize(innerSize, innerSize).png().toBuffer();
  const margin = Math.floor((size - innerSize) / 2);
  return sharp({ create: { width: size, height: size, channels: 4, background } })
    .composite([{ input: mark, top: margin, left: margin }])
    .png()
    .toBuffer();
}

async function writeDensity([density, launcherSize, adaptiveSize]) {
  const folder = path.join(resources, "mipmap-" + density);
  await fs.mkdir(folder, { recursive: true });

  const square = await composeIcon(launcherSize, 0.84, mint);
  const round = await composeIcon(launcherSize, 0.75, mint);
  const radius = launcherSize / 2;
  const circle = Buffer.from(
    '<svg xmlns="http://www.w3.org/2000/svg" width="' + launcherSize + '" height="' + launcherSize +
    '"><circle cx="' + radius + '" cy="' + radius + '" r="' + radius + '"/></svg>',
  );

  await Promise.all([
    fs.writeFile(path.join(folder, "ic_launcher.png"), square),
    sharp(round).composite([{ input: circle, blend: "dest-in" }]).png()
      .toFile(path.join(folder, "ic_launcher_round.png")),
    // Keep the wing tips inside Android's circular 66dp safe zone.
    composeIcon(adaptiveSize, 0.47, transparent)
      .then(image => fs.writeFile(path.join(folder, "ic_launcher_foreground.png"), image)),
  ]);
}

async function generate() {
  const stylesFile = path.join(resources, "values", "styles.xml");
  const styles = await fs.readFile(stylesFile, "utf8");
  const launchTheme = /<style name="AppTheme\.NoActionBarLaunch"[^>]*>[\s\S]*?<\/style>/;
  if (!launchTheme.test(styles)) throw new Error("Theme AppTheme.NoActionBarLaunch tidak ditemukan.");

  await Promise.all(densities.map(writeDensity));
  await fs.writeFile(path.join(resources, "values", "ic_launcher_background.xml"), [
    '<?xml version="1.0" encoding="utf-8"?>',
    "<resources>",
    '    <color name="ic_launcher_background">' + mint + "</color>",
    '    <color name="tmt_launch_background">' + cream + "</color>",
    "</resources>",
    "",
  ].join("\n"));
  await fs.writeFile(stylesFile, styles.replace(launchTheme, [
    '<style name="AppTheme.NoActionBarLaunch" parent="Theme.SplashScreen">',
    '        <item name="windowSplashScreenBackground">@color/tmt_launch_background</item>',
    '        <item name="windowSplashScreenAnimatedIcon">@mipmap/ic_launcher_foreground</item>',
    '        <item name="postSplashScreenTheme">@style/AppTheme.NoActionBar</item>',
    "    </style>",
  ].join("\n")));
  console.log("Logo TMT diterapkan ke launcher biasa, bulat, adaptif, dan splash Android.");
}

generate().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
