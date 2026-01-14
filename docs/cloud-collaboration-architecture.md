# Free Lightweight Non-Profit Cloud Collaboration Architecture

This guide describes how to set up a free, lightweight, non-profit cloud solution for collaboration on a GitHub static site, supporting multiple admins, several users, secret key storage, and web-based user admin. It uses Azure AD OAuth2 login, serverless backend, and Airtable/Notion for secure data storage.

---

## 1. Create a GitHub Repository and Enable GitHub Pages

- Create a new repository for your site.
- In repository settings, enable GitHub Pages (choose main branch or /docs folder).
- Add your static site files (HTML, JS, CSS).

---

## 1A. Use pnpm for Package Management

This project uses [pnpm](https://pnpm.io/) for fast and efficient package management.

### Setup pnpm

1. Install pnpm globally (if not already installed):

```sh
npm install -g pnpm
```

2. Install project dependencies:

```sh
pnpm install
```

3. Add new dependencies:

```sh
pnpm add <package-name>
```

4. Run scripts (replace `start` with your script name):

```sh
pnpm start
```

5. Remove dependencies:

```sh
pnpm remove <package-name>
```

See [pnpm documentation](https://pnpm.io/) for more details.

---

## 2. Set Up Azure for Data Storage

This project uses Azure Table Storage for secure, scalable, and low-cost data storage.

### Azure Table Storage Setup (Free Tier)

1. Go to [Azure Portal](https://portal.azure.com/) and sign in.
2. Click **Create a resource** > search for **Storage account** > click **Create**.
3. Fill in the details:

- Subscription: Select your free subscription
- Resource Group: Create or select one
- Storage account name: Unique name (e.g., mycollabstorage)
- Region: Choose a region close to you
- Performance: Standard
- Redundancy: Locally-redundant storage (LRS)

4. Click **Review + create**, then **Create**.
5. Once deployed, go to your storage account > **Tables** > **+ Table** to create tables for your data (e.g., Users, AdminRoles, Documents).
6. In your Azure App Service, add your storage account connection string as an environment variable (e.g., `AZURE_STORAGE_CONNECTION_STRING`).
7. Use the [@azure/data-tables](https://www.npmjs.com/package/@azure/data-tables) npm package in your backend code to read/write data:

```js
const { TableClient } = require("@azure/data-tables");
const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
const tableClient = TableClient.fromConnectionString(connectionString, "Users");
// Example: Add a user
await tableClient.createEntity({
  partitionKey: "user",
  rowKey: "user1",
  name: "Alice",
  email: "alice@example.com",
});
```

8. Store sensitive data (API keys, secrets) in Azure App Service environment variables.
9. Share access with other admins by granting them access to the storage account in Azure Portal.

See [Azure Table Storage documentation](https://learn.microsoft.com/en-us/azure/storage/tables/table-storage-overview) for more details.

---

## 3. Set Up Azure for Serverless Functions

### Azure App Service Setup (Free Tier)

1. Go to [Azure Portal](https://portal.azure.com/) and sign in or create a Microsoft account.
2. Click "Start free" to activate your free Azure account.
3. In the portal, click **Create a resource** > search for **Web App** > click **Create**.
4. Fill in the details:

- Subscription: Select your free subscription
- Resource Group: Create or select one (e.g., "my-free-apps")
- Name: Unique app name (e.g., myfreewebapp123)
- Publish: Code
- Runtime stack: Node.js, Python, .NET, etc.
- Region: Choose a region close to you

5. For **App Service Plan**, click **Create new**, name it, and select the **F1 (Free)** tier.
6. Click **Review + create**, then **Create**.
7. Once deployed, go to your Web App and select **Deployment Center**.
8. Choose **GitHub** as the source, authorize Azure to access your GitHub account, and select your repository and branch.
9. Complete the setup; Azure will auto-deploy on every push to your selected branch.
10. To set environment variables, go to your Web App > **Configuration** > **Application settings** > **New application setting**.
11. Enter the variable name and value (e.g., `AIRTABLE_API_KEY`, `AZURE_OAUTH_CLIENT_ID`).
12. Click **Save** and restart your app to apply changes.
13. Monitor usage in **Cost Management + Billing** to stay within free limits.

---

## 4. Configure Environment Variables

### Why Use Environment Variables?

Environment variables allow you to securely store API keys, database IDs, and secrets outside your code. This keeps sensitive information safe and makes it easy to update credentials without changing your codebase.

### Azure App Service Setup

1. Go to your Web App in the Azure Portal.
2. Click **Configuration** in the left menu.
3. Under **Application settings**, click **New application setting**.
4. Enter the variable name (e.g., `AIRTABLE_API_KEY`, `AIRTABLE_BASE_ID`, `NOTION_TOKEN`, `NOTION_DATABASE_ID`, `AZURE_OAUTH_CLIENT_ID`, `AZURE_OAUTH_CLIENT_SECRET`).
5. Enter the value (your actual API key, base/database ID, or secret).
6. Click **OK** and then **Save**.
7. Restart your app to apply the new environment variables.
8. In your app code, access variables using `process.env.VARIABLE_NAME`.

### Best Practices

- Never commit secrets or API keys to your code repository.
- Use descriptive variable names.
- Update/revoke credentials in the dashboard if compromised.
- Only give access to environment variable management to trusted admins.

---

## 5. Implement Azure AD OAuth2 Login on Your Site

### Step-by-Step Setup

1. **Register Your App in Azure AD:**
   - Go to [Azure Portal](https://portal.azure.com/).
   - Navigate to **Azure Active Directory > App registrations**.
   - Click **New registration**.
   - Enter a name for your app.
   - Set your redirect URI (e.g., `https://your-site.netlify.app/callback`).
   - Click **Register**.
   - Note your **Application (client) ID** and **Directory (tenant) ID**.
   - Go to **Certificates & secrets** and create a new client secret. Note the value.

2. **Add a Login Button to Your Site:**
   - In your HTML, add a button or link:
     ```html
     <a
       href="https://login.microsoftonline.com/YOUR_TENANT_ID/oauth2/v2.0/authorize?client_id=YOUR_CLIENT_ID&response_type=code&redirect_uri=YOUR_REDIRECT_URI&response_mode=query&scope=openid+profile+email"
       >Login with Microsoft Account</a
     >
     ```
   - Replace `YOUR_TENANT_ID`, `YOUR_CLIENT_ID`, and `YOUR_REDIRECT_URI` with your actual values.

3. **Handle the Redirect After Login:**
   - After login, the user is redirected to your site with a `code` parameter in the URL.
   - In your frontend JavaScript, extract the code:
     ```js
     const urlParams = new URLSearchParams(window.location.search);
     const code = urlParams.get("code");
     if (code) {
       // Send code to backend for token exchange
     }
     ```

4. **Send the Code to Your Backend Function:**
   - Use fetch or AJAX to send the code to your Netlify/Vercel function:
     ```js
     fetch('/.netlify/functions/auth', {
       method: 'POST',
       body: JSON.stringify({ code }),
       headers: { 'Content-Type': 'application/json' }
     })
     .then(res => res.json())
     .then data => {
       // Store access token, update UI, etc.
     });
     ```

5. **Backend: Exchange Code for Access Token:**
   - In your serverless function, exchange the code for an access token:
     ```js
     // Example Netlify function (auth.js)
     const fetch = require("node-fetch");
     exports.handler = async (event) => {
       const { code } = JSON.parse(event.body);
       const res = await fetch(
         "https://login.microsoftonline.com/YOUR_TENANT_ID/oauth2/v2.0/token",
         {
           method: "POST",
           headers: { "Content-Type": "application/x-www-form-urlencoded" },
           body: new URLSearchParams({
             grant_type: "authorization_code",
             code,
             redirect_uri: process.env.AZURE_OAUTH_REDIRECT_URI,
             client_id: process.env.AZURE_OAUTH_CLIENT_ID,
             client_secret: process.env.AZURE_OAUTH_CLIENT_SECRET,
             scope: "openid profile email",
           }),
         },
       );
       const tokenData = await res.json();
       // Validate token, check user info, return token to frontend
       return {
         statusCode: 200,
         body: JSON.stringify(tokenData),
       };
     };
     ```

6. **Frontend: Store Token and Update UI:**
   - Store the access token in localStorage/sessionStorage.
   - Use the token for authenticated requests to your backend functions.
   - Update the UI to show user/admin features based on authentication status.

7. **Security Notes:**
   - Never expose your client secret in frontend code.
   - Always validate tokens in backend functions.
   - Use HTTPS for all requests.

---

## 5A. Website-Based Admins and Authorized Users with Azure AD

### Overview

You can manage your list of authorized users and admins directly from your website by leveraging Azure AD groups or application roles. This allows admins to add/remove users or assign admin roles via the site UI, with changes reflected in Azure AD.

### Step-by-Step Setup

1. **Configure Azure AD Groups or App Roles:**
   - In Azure Portal, go to **Azure Active Directory > Groups**.
   - Create a group for admins (e.g., `CollabAdmins`) and one for users (e.g., `CollabUsers`).
   - Alternatively, define application roles in your app registration's **App roles** section (for more granular control).

2. **Assign Users to Groups/Roles:**
   - In Azure Portal, add users to the appropriate groups or assign app roles.
   - (Optional) Enable self-service group management so designated admins can add/remove users from groups via the Azure AD access panel.

3. **Expose Group/Role Claims in Tokens:**
   - In your app registration, go to **Token configuration**.
   - Add a **Group claim** or **Role claim** to the ID token and access token.
   - This allows your backend to see which groups/roles a user belongs to.

4. **Frontend: Admin UI for User Management:**
   - Build an admin page where authorized admins can:
     - View the current list of users and their roles/groups.
     - Add or remove users (by email or Azure AD object ID).
     - Assign or revoke admin rights.
   - When an admin makes a change, send a request to your backend function.

5. **Backend: Update Azure AD via Microsoft Graph API:**
   - In your serverless function, use the [Microsoft Graph API](https://docs.microsoft.com/en-us/graph/api/resources/users?view=graph-rest-1.0) to:
     - List users and their group memberships.
     - Add or remove users from groups.
     - Assign or revoke app roles.
   - Authenticate your backend with an Azure AD app registration that has the necessary permissions (e.g., `GroupMember.ReadWrite.All`, `User.Read.All`).
   - Example: Add a user to a group
     ```js
     // Pseudocode for Netlify/Vercel function
     const fetch = require("node-fetch");
     exports.handler = async (event) => {
       const { userId, groupId } = JSON.parse(event.body);
       const token = await getAppAccessToken(); // Use client credentials flow
       const res = await fetch(
         `https://graph.microsoft.com/v1.0/groups/${groupId}/members/$ref`,
         {
           method: "POST",
           headers: {
             Authorization: `Bearer ${token}`,
             "Content-Type": "application/json",
           },
           body: JSON.stringify({
             "@odata.id": `https://graph.microsoft.com/v1.0/directoryObjects/${userId}`,
           }),
         },
       );
       return { statusCode: res.status, body: await res.text() };
     };
     ```

6. **Security Notes:**
   - Only allow users in the admin group/role to access the admin UI and backend functions for user management.
   - Use access tokens with the correct scopes for Microsoft Graph API.
   - Log all admin actions for audit purposes.

7. **User Experience:**
   - Admins can manage users and roles from the website.
   - Changes are reflected in Azure AD and enforced in authentication tokens.
   - Your backend checks group/role claims in tokens to authorize access to features.

---

## 6. Backend: Token Exchange and Verification

- In your serverless function:
  - Receive the code from the frontend.
  - Exchange the code for an access token using the Azure AD OAuth2 token endpoint.
  - Verify the token (JWT validation or introspection endpoint).
  - Check user/admin status in Airtable/Notion database.

---

## 7. Backend: Read/Write Data with Role-Based Access

- Implement functions to:
  - Read/write collaboration data (documents, messages, etc.).
  - Check user roles (admin/user) from the database.
  - Allow admins to manage users and assign roles.
  - Store secret keys securely in Airtable/Notion (only accessible to admins).

---

## 8. Frontend: User/Admin Interface

- Show/hide admin features based on user role (from backend response).
- Allow admins to add/remove users, assign roles, and manage secret keys via web UI.
- Allow users to collaborate, view shared data, and submit content.

---

## 9. Security Best Practices

- Never expose API keys or secrets in frontend code.
- All sensitive operations and token verification happen in serverless functions.
- Use HTTPS for all requests.
- Store secret keys in Airtable/Notion with restricted access (admins only).

---

## 10. Testing and Deployment

- Test login flow, data read/write, and admin features.
- Deploy your site via GitHub Pages and backend via Netlify/Vercel.
- Invite users and admins to use the site.

---

### Example Folder Structure

```
/ (GitHub Pages static site)
  index.html
  app.js
/api/
  auth.js
  readData.js
  writeData.js
  admin.js
```

---

### Example User Flow

1. User visits site, clicks “Login”, authenticates via Azure AD OAuth2.
2. Backend exchanges code for token, verifies user, checks role.
3. User sees collaboration features; admins see user management and secret key controls.
4. All data is stored securely in Airtable/Notion, managed via backend functions.

---

If you want sample code for any part (OAuth2 flow, serverless function, Airtable/Notion integration, admin UI), let me know!
