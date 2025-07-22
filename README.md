# Step Session Tracker NodeJS App

This NodeJS app tracks your real-world steps and lets you use them as a resource in your own projects (e.g., games, productivity tools, etc.).

## Features
- Sync your step count from Google Fit (or other sources)
- Track available steps, session steps, daily steps, and total steps
- Set a session baseline and update steps during your session
- Simple CLI commands to add, update, and view steps

## Requirements
- Node.js v16 or newer
- Google Fit API credentials (client ID and secret)
- `token.json` file for OAuth2 authentication

## Setup
1. Clone the repository:
   ```sh
   git clone <repo-url>
   cd <project-folder>
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Set up Google Fit API credentials:
   - Create a project in Google Cloud Console
   - Enable the Google Fit API 
   - Download your OAuth2 credentials and save as `token.json` in the project root

## Usage
- Run the app:
  ```sh
  node google-fit-steps.js
  ```

## License
MIT

## Credits
- Uses Google Fit API
