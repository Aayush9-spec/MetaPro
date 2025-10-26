# Marketplace Frontend

## Overview
This project is a decentralized marketplace built using React and Ethereum smart contracts. Users can connect their wallets, list items for sale, buy items, and transfer ownership of items within the marketplace.

## Project Structure
```
marketplace-frontend
├── public
│   └── index.html          # Main HTML file
├── src
│   ├── App.jsx             # Main application component
│   ├── index.jsx           # Entry point for the React application
│   ├── MarketPlace.json     # ABI for the deployed smart contract
│   ├── styles.css          # CSS styles for the application
│   └── components
│       ├── ItemCard.jsx    # Component for displaying individual items
│       └── WalletConnect.jsx # Component for wallet connection
├── package.json            # npm configuration file
├── .gitignore              # Files to ignore by Git
└── README.md               # Project documentation
```

## Setup Instructions
1. **Clone the repository:**
   ```
   git clone <repository-url>
   cd marketplace-frontend
   ```

2. **Install dependencies:**
   ```
   npm install
   ```

3. **Start the development server:**
   ```
   npm start
   ```

4. **Open your browser:**
   Navigate to `http://localhost:3000` to view the application.

## Usage
- Connect your wallet using the "Connect Wallet" button.
- List items for sale by entering the item name and price.
- Browse available items and purchase them directly.
- Transfer ownership of items to other wallet addresses.

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any improvements or features.

## License
This project is licensed under the MIT License.