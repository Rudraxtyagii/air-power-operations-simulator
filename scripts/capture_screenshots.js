const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const TARGET_URL = 'http://127.0.0.1:5173/#weather';
const OUTPUT_DIR = path.join(__dirname, '..', 'screenshots');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

class CDPClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.ws = null;
    this.msgId = 1;
    this.callbacks = new Map();
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.wsUrl);
      this.ws.onopen = () => resolve();
      this.ws.onerror = (err) => reject(err);
      this.ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.id && this.callbacks.has(msg.id)) {
          const { resolve, reject } = this.callbacks.get(msg.id);
          this.callbacks.delete(msg.id);
          if (msg.error) {
            reject(new Error(msg.error.message));
          } else {
            resolve(msg.result);
          }
        }
      };
    });
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.msgId++;
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  close() {
    if (this.ws) {
      this.ws.close();
    }
  }
}

async function run() {
  console.log('Launching headless Chrome...');
  const chromeProcess = spawn(
    CHROME_PATH,
    [
      '--headless=new',
      '--remote-debugging-port=9222',
      '--disable-gpu',
      '--no-sandbox',
      '--hide-scrollbars',
      'about:blank',
    ],
    { stdio: 'ignore' }
  );

  try {
    // Wait for debugging port
    let version = null;
    for (let i = 0; i < 20; i++) {
      try {
        version = await fetchJson('http://127.0.0.1:9222/json/version');
        if (version) break;
      } catch {
        await sleep(300);
      }
    }

    if (!version) {
      throw new Error('Failed to connect to Chrome debugging port.');
    }
    console.log('Connected to Chrome:', version.Browser);

    const targets = await fetchJson('http://127.0.0.1:9222/json/list');
    const pageTarget = targets.find((t) => t.type === 'page') || targets[0];
    const client = new CDPClient(pageTarget.webSocketDebuggerUrl);
    await client.connect();

    await client.send('Page.enable');
    await client.send('Network.enable');

    const viewports = [
      { name: '1920x1080', width: 1920, height: 1080, mobile: false, scale: 1 },
      { name: '1440x900', width: 1440, height: 900, mobile: false, scale: 1 },
      { name: '1366x768', width: 1366, height: 768, mobile: false, scale: 1 },
      { name: '1280x720', width: 1280, height: 720, mobile: false, scale: 1 },
      { name: '1024x768', width: 1024, height: 768, mobile: false, scale: 1 },
      { name: '768x1024', width: 768, height: 1024, mobile: true, scale: 2 },
      { name: '390x844', width: 390, height: 844, mobile: true, scale: 3 },
    ];

    for (const vp of viewports) {
      console.log(`Setting viewport: ${vp.name} (${vp.width}x${vp.height})...`);
      await client.send('Emulation.setDeviceMetricsOverride', {
        width: vp.width,
        height: vp.height,
        deviceScaleFactor: vp.scale,
        mobile: vp.mobile,
      });

      console.log(`Navigating to ${TARGET_URL}...`);
      await client.send('Page.navigate', { url: TARGET_URL });

      // Wait 3.5 seconds for API fetch and tile rendering
      await sleep(3500);

      // Trigger map resize if needed by evaluating window resize event
      await client.send('Runtime.evaluate', {
        expression: 'window.dispatchEvent(new Event("resize"));',
      });
      await sleep(800);

      console.log(`Capturing screenshot for Weather ${vp.name}...`);
      const screenshot = await client.send('Page.captureScreenshot', {
        format: 'png',
        captureBeyondViewport: false,
      });

      const outPath = path.join(OUTPUT_DIR, `screenshot_${vp.name}.png`);
      fs.writeFileSync(outPath, Buffer.from(screenshot.data, 'base64'));
      console.log(`Saved screenshot to ${outPath}`);
    }

    // Capture Dashboard at key viewports: 1920x1080, 1366x768, 390x844
    const dashViewports = [
      { name: '1920x1080', width: 1920, height: 1080, mobile: false, scale: 1 },
      { name: '1366x768', width: 1366, height: 768, mobile: false, scale: 1 },
      { name: '390x844', width: 390, height: 844, mobile: true, scale: 3 },
    ];

    for (const dvp of dashViewports) {
      console.log(`Capturing Dashboard at ${dvp.name}...`);
      await client.send('Emulation.setDeviceMetricsOverride', {
        width: dvp.width,
        height: dvp.height,
        deviceScaleFactor: dvp.scale,
        mobile: dvp.mobile,
      });
      await client.send('Page.navigate', { url: 'http://127.0.0.1:5173/#dashboard' });
      await sleep(2000);
      const dashShot = await client.send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(OUTPUT_DIR, `screenshot_dashboard_${dvp.name}.png`), Buffer.from(dashShot.data, 'base64'));
    }

    console.log('Done capturing all screenshots!');
    try {
      await client.send('Browser.close');
    } catch {}
    client.close();
  } catch (err) {
    console.error('Error during capture:', err);
  } finally {
    try {
      chromeProcess.kill();
    } catch {}
  }
}

run();
