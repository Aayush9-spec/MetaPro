# Marketplace Frontend

A React frontend for a decentralized marketplace that interacts with an EVM-compatible smart contract (example uses Flow EVM). The app supports wallet connection (MetaMask), listing items, buying items, transferring ownership, theme toggle, animated UI and a persistent purchase history.

## Project layout

```
marketplace-frontend
├── public/
│   └── index.html
├── src/
│   ├── App.jsx            # Main application + logic
│   ├── index.jsx          # App entry
│   ├── MarketPlace.json   # Contract ABI
│   ├── styles.css         # Global styles and theme
│   └── components/
│       ├── ItemCard.jsx
│       └── WalletConnect.jsx
├── package.json
└── README.md
```

## Features

- Connect with MetaMask (window.ethereum)
- List items for sale (name + price)
- Buy items (calls contract with value)
- Transfer items to other addresses
- Search items and animated cards
- Dark / Light theme toggle (persisted)
- Purchase history (saved to localStorage)

## Prerequisites

- Node.js (LTS recommended: v16 or v18). Newer Node versions may require the OpenSSL legacy flag for webpack.
- npm
- MetaMask (or another injected EVM wallet) configured to the network hosting the contract.

## Run locally

1. Install dependencies

```bash
cd /path/to/marketplace-frontend
npm install
```

2. Start the dev server

If you encounter an OpenSSL related webpack error (ERR_OSSL_EVP_UNSUPPORTED) on Node 17+, run:

```bash
kill $(lsof -ti:3000) 2>/dev/null || true
export NODE_OPTIONS=--openssl-legacy-provider
npm start
```

Open http://localhost:3000 in your browser.

## Configuration

- Contract address: currently defined in `src/App.jsx` as `contractAddress`. To make this configurable, create a `.env` file and add:

```
REACT_APP_CONTRACT_ADDRESS=0xYourAddressHere
```

Then update `src/App.jsx` to read `process.env.REACT_APP_CONTRACT_ADDRESS`.

## Build

```bash
npm run build
```

The production-ready static files are generated in the `build/` folder.

## Deployment options

Choose a static host and upload the contents of `build/`.

- Netlify
   - Connect your Git repo or drag-and-drop `build/` in Netlify’s deploy UI. Use build command `npm run build` and publish directory `build`.
    - Example `netlify.toml` (added to repo):

```toml
[build]
   command = "npm run build"
   publish = "build"

[build.environment]
   REACT_APP_CONTRACT_ADDRESS = "0xYourContractAddressHere"
```

   - In Netlify UI: Site settings → Build & deploy → Environment, add `REACT_APP_CONTRACT_ADDRESS` with the value for your contract.

- Vercel
   - Vercel auto-detects CRA. Connect the repo and set the build step to `npm run build`.
    - You can add `vercel.json` (included in repo) to configure the static build behavior. Set environment variables in the Vercel dashboard under Project Settings → Environment Variables. Example `vercel.json` in repo:

```json
{
   "version": 2,
   "builds": [
      { "src": "package.json", "use": "@vercel/static-build", "config": { "distDir": "build" } }
   ],
   "routes": [
      { "src": "/(.*)", "dest": "/index.html" }
   ]
}
```

   - In Vercel UI: Project → Settings → Environment Variables, add `REACT_APP_CONTRACT_ADDRESS`.

- GitHub Pages
   - Install `gh-pages` and add scripts to `package.json`:

```json
"predeploy": "npm run build",
"deploy": "gh-pages -d build"
```

Then run `npm run deploy`.

- Docker
   - Serve the `build/` folder with nginx (example Dockerfile):

```Dockerfile
FROM nginx:alpine
COPY build/ /usr/share/nginx/html
EXPOSE 80
```

Build and run:

```bash
npm run build
docker build -t marketplace-frontend .
docker run -p 8080:80 marketplace-frontend
```

## Troubleshooting

- OpenSSL / Webpack crypto error: set `NODE_OPTIONS=--openssl-legacy-provider` or use Node 16 LTS.
- `react-dom/client` errors: this repo uses React 17. If you upgrade to React 18, update `src/index.jsx` to use the new root API.
- Contract interaction fails: confirm MetaMask network and contract address/ABI match your deployed contract.

## Security

- Never commit private keys or secrets to the repo.
- In production, review `npm audit` results and update dependencies.

## Next steps / improvements

- Move `contractAddress` to env variables and support different RPC endpoints.
- Add CI/CD deploy script for Netlify or Vercel.
- Add tests (unit + E2E) and better error handling around contract calls.

---

If you want I can update the code to read the contract address from `.env` and add a simple CI deploy configuration for Netlify or Vercel — tell me which provider you prefer and I'll add the exact configuration.
