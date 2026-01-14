// testGoogleAccess.js
// Standalone test for Google Secret Manager access and config for UnitManagementTools
// Usage: node testGoogleAccess.js

import fs from "fs";
import path from "path";
import open from "open";
import http from "http";
import { URLSearchParams } from "url";
import { google } from "googleapis";
import { SecretManagerServiceClient } from "@google-cloud/secret-manager";

// ES module __dirname workaround
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load config from data/googleDrive.json
const configPath = path.join(__dirname, "..", "data", "googleDrive.json");
let config;
try {
  config = JSON.parse(fs.readFileSync(configPath, "utf8"));
} catch (err) {
  console.error("Failed to load googleDrive.json:", err);
  process.exit(1);
}

const clientId = config.web.client_id;
const authUri = config.web.auth_uri;
const tokenUri = config.web.token_uri;
const secretResource = config.web.name;

// Use a local redirect URI for OAuth2
const localPort = 51739;
const redirectUri = `http://localhost:${localPort}`;

// Add cloud-platform scope for Secret Manager
const scopes = [
  "https://www.googleapis.com/auth/cloud-platform",
  ...(config.web.scopes ? [config.web.scopes] : []),
].join(" ");

// Step 1: Start OAuth2 flow
const state = Math.random().toString(36).substring(2);
const authUrl = `${authUri}?response_type=code&client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}&state=${state}&access_type=offline&prompt=consent`;

const server = http.createServer((req, res) => {
  (async () => {
    const urlObj = new URL(req.url, `http://localhost:${localPort}`);
    const code = urlObj.searchParams.get("code");
    const returnedState = urlObj.searchParams.get("state");
    if (code && returnedState === state) {
      res.end("Authentication successful! You can close this tab.");
      server.close();
      try {
        const { google } = require("googleapis");
        const {
          SecretManagerServiceClient,
        } = require("@google-cloud/secret-manager");
        // Step 2: Exchange code for access token using googleapis
        const oauth2Client = new google.auth.OAuth2(
          clientId,
          "", // client_secret not needed for installed apps with PKCE, but can be added if available
          redirectUri,
        );
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);
        if (!tokens.access_token)
          throw new Error("Failed to obtain access token.");

        // Step 3: Use @google-cloud/secret-manager with the OAuth2 token
        const smClient = new SecretManagerServiceClient({
          credentials: {
            client_email: "", // Not needed for user OAuth2
            private_key: "", // Not needed for user OAuth2
          },
          projectId: config.web.project_id,
          auth: oauth2Client,
        });

        // Try to access the secret using the REST API for diagnostics
        const fetch = (await import("node-fetch")).default;
        console.log("\nTesting access to Google Secret Manager (REST API)...");
        const secretRes = await fetch(
          `https://secretmanager.googleapis.com/v1/${secretResource}:access`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${tokens.access_token}`,
              Accept: "application/json",
            },
          },
        );
        if (!secretRes.ok) {
          const errText = await secretRes.text();
          throw new Error(
            `Secret access failed (REST): ${secretRes.status} ${secretRes.statusText}\n${errText}`,
          );
        }
        const secretData = await secretRes.json();
        console.log("Secret access successful (REST)!");
        console.log("Secret payload (base64):", secretData.payload.data);

        // Try to access the secret using the client library
        try {
          console.log(
            "\nTesting access to Google Secret Manager (client library)...",
          );
          const [version] = await smClient.accessSecretVersion({
            name: secretResource,
          });
          const payload = version.payload.data.toString("utf8");
          console.log("Secret access successful (client library)!");
          console.log("Secret payload (utf8):", payload);
        } catch (err) {
          console.error("Client library access failed:", err.message);
        }
      } catch (err) {
        console.error("Error:", err.message);
      }
    } else {
      res.end("Authentication failed or canceled.");
      server.close();
      console.error("Error: No code or state mismatch.");
    }
  })();
});

server.listen(localPort, () => {
  console.log("Opening browser for Google sign-in...");
  open(authUrl);
  console.log("If your browser does not open, visit this URL:");
  console.log(authUrl);
  console.log(
    `\nAfter signing in, you will be redirected to http://localhost:${localPort}`,
  );
});
