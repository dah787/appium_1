/* to start run : npx wdio config/wdio.android.conf.js
- - - - - - - - - - - - - - - - - - - - - - - - - - - */

const config  = require('./wdio.shared.conf');
const path    = require('path');
const allure  = require('allure-commandline');
const video   = require('wdio-video-reporter'); // import video from 'wdio-video-reporter';

// ====================
// Runner Configuration
// ====================
// config.port = 4723; // >>> moved to config.services below

// ==================
// Specify Test Files
// ==================
config.specs = [
  // path.join(process.cwd(),'test/specs/android/webview*.js')
  // path.join(process.cwd(),'test/specs/android/apexbank*.js')
  // path.join(process.cwd(),'test/specs/android/ab-smoke*.spec.js')
  // path.join(process.cwd(),'test/specs/android/ab-ts-11p*.spec.js')

  // path.join(process.cwd(),'test/specs/android/ab-ts-01p.spec.js')
  // path.join(process.cwd(),'test/specs/android/ab-e-ts-001p.spec.js')
  path.join(process.cwd(),'test/specs/android/ab-u-ts-1001p.spec.js')
];

// ============
// Capabilities
// ============
config.capabilities = [{
  "appium:language": "ru",
  'appium:locale': 'RU',

  "appium:deviceType": "phone",
  // "browserVersion": "73.0-phone-1",

  "appium:platformName": "Android",

  // "appium:platformVersion": "10.0",
  // "appium:deviceName": "Nexus S v.10",   // 480*800, 240 dpi, 4.0", x86
  // "appium:deviceName": "Pixel 2 v.10",   // 1080*1920, 420 dpi, 5.0", x86
  // "appium:deviceName": "Pixel 6a v.10",   // 1080*2400, 420 dpi, 6.13", x86

  // "appium:platformVersion": "11.0",
  // "appium:deviceName": "Pixel 4 v.11",

  "appium:platformVersion": "13.0",
  // "appium:deviceName": "Pixel 6a v.13",   // 1080*2400, 420 dpi, 6.13", x86_64
  "appium:deviceName": "Pixel 7 v.13",   // 1080*2400, 420 dpi, 6.31", x86_64

  "appium:automationName": "UiAutomator2",
  "appium:app": path.join(process.cwd(), "app/android/Apexbank-1.0.17.1-debug.apk"),
  // "appium:app": path.join(process.cwd(), "app/android/Apexbank-1.0.30-debug.apk"),
  "appium:autoGrantPermissions": true
}];

// ===================
// Test Configurations
// ===================
// https://appium.io/docs/en/writing-running-appium/server-args/
// https://github.com/appium/appium-uiautomator2-driver#chromedriverchrome-compatibility
config.services = [['appium', {
  args: {
    address: 'localhost',
    port: 4723,
    // chromedriverExecutableDir: path.join(process.cwd(), "node_modules/appium-uiautomator2-driver/node_modules/appium-chromedriver/chromedriver/win/chromedriver_win32_v74.0.3729.6.exe"),
    // relaxedSecurity: true
    // allowInsecure: "chromedriver_autodownload"
  },
  // logPath: './'
}]];

config.reporters = ['spec',
  [video, {
    saveAllVideos: false,       // If true, also saves videos for successful test cases
    videoSlowdownMultiplier: 3, // Higher to get slower videos, lower for faster videos [Value 1-100]
  }],
  ['allure', {
    outputDir: 'allure-results',
    disableWebdriverStepsReporting: true, //false,
    disableWebdriverScreenshotsReporting: true, //false,
}]];

config.mochaOpts = {
  ui: 'bdd',
  timeout: 240000 //60000
};

// let counter = 1;
let testNum = '';
config.afterTest = async function(test, context, { error /*, result, duration, passed, retries*/ }) {
  if (error) {
    await driver.takeScreenshot();
    // await driver.saveScreenshot('_view_shots/screen_testFailed-' + counter + '.png');
    testNum = test.title.slice(0, test.title.indexOf(':'));
    await driver.saveScreenshot('_view_shots/screen_failure-' + testNum + '.png');

    // // * Вести счет числу выполненных тестов
    // counter++;
  }
};

config.onComplete = function(/*exitCode, config, capabilities, results*/) {
  const reportError = new Error('Could not generate Allure report')
  const generation = allure(['generate', 'allure-results', '--clean'])
  return new Promise((resolve, reject) => {
      const generationTimeout = setTimeout(
          () => reject(reportError),
          5000)

      generation.on('exit', function(exitCode) {
          clearTimeout(generationTimeout)

          if (exitCode !== 0) {
              return reject(reportError)
          }

          console.log('Allure report successfully generated')
          resolve()
      })
  })
};

exports.config = config;