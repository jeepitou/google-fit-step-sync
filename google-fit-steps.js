const fs = require('fs');
const { google } = require('googleapis');
const readline = require('readline');
const { exec } = require('child_process');
const path = require('path');
const clipboardy = require('clipboardy');

// === CONFIGURATION ===
const CLIENT_ID = 'YOUR_CLIENT_ID'; // Replace with your actual client ID
const CLIENT_SECRET = 'YOUR_CLIENT_SECRET'; // Replace with your actual client secret
const REDIRECT_URI = 'http://localhost';
const TOKEN_PATH = 'token.json';

const WOW_SAVEDVARIABLES_PATH = path.join(
  process.env.HOME || process.env.USERPROFILE,
  'Downloads',
  'WoW',
  'WTF',
  'Account',
  'JEEPITOU',
  'SavedVariables',
  'StepLimiter.lua'
);

const SCOPES = ['https://www.googleapis.com/auth/fitness.activity.read'];

// === AUTHORIZATION ===
async function authorize() {
  const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

  if (fs.existsSync(TOKEN_PATH)) {
    const token = JSON.parse(fs.readFileSync(TOKEN_PATH));
    oAuth2Client.setCredentials(token);
    return oAuth2Client;
  }

  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    response_type: 'code',
    prompt: 'consent',
  });

  console.log('Authorize this app by visiting this URL:\n', authUrl);
  exec(`start ${authUrl}`);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question('Paste the code from Google here: ', async (code) => {
      rl.close();
      const { tokens } = await oAuth2Client.getToken(code);
      oAuth2Client.setCredentials(tokens);
      fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
      resolve(oAuth2Client);
    });
  });
}

// === GET STEPS FROM GOOGLE FIT ===
async function getStepsToday(auth) {
  const fitness = google.fitness({ version: 'v1', auth });
  const now = new Date();
  const startTimeMillis = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const endTimeMillis = now.getTime();

  const res = await fitness.users.dataset.aggregate({
    userId: 'me',
    requestBody: {
      aggregateBy: [{ dataTypeName: 'com.google.step_count.delta' }],
      bucketByTime: { durationMillis: 86400000 },
      startTimeMillis,
      endTimeMillis,
    },
  });

  let steps = 0;
  const buckets = res.data.bucket || [];
  for (const bucket of buckets) {
    for (const dataset of bucket.dataset) {
      for (const point of dataset.point) {
        for (const value of point.value) {
          steps += value.intVal || 0;
        }
      }
    }
  }
  return steps;
}



// === MAIN LOOP ===
(async () => {
  try {
    const auth = await authorize();
    console.log("✅ Authorized with Google.");


    let lastSteps = null;
    const poll = async () => {
      const steps = await getStepsToday(auth);
      if (steps !== lastSteps) {
        console.log(`[${new Date().toLocaleTimeString()}] 🦶 Total steps today: ${steps}`);
        const wowCmd = `/stepadd ${steps}`;
        console.log(`📋 Copied to clipboard (via clip): ${wowCmd}`);
        lastSteps = steps;
      }
    };

    await poll();
    setInterval(poll, 3000);

  } catch (err) {
    console.error("❌ Error:", err.message);
  }
})();
