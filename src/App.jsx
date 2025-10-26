import { useState, useEffect } from "react";
import { ethers } from "ethers";
import MarketPlaceABI from "./MarketPlace.json";
import ItemCard from "./components/ItemCard";

const contractAddress = "0xe9420DC12546ACB7ae36FeAb7739dF5a2adC2180";

function App() {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem("theme") || "dark";
    } catch (e) {
      return "dark";
    }
  });

  useEffect(() => {
    try {
      document.documentElement.setAttribute("data-theme", theme);
      localStorage.setItem("theme", theme);
    } catch (e) {
      /* ignore */
    }
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  const [account, setAccount] = useState("");
  const [balance, setBalance] = useState("");
  const [contract, setContract] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [ownerAddress, setOwnerAddress] = useState("");
  const [purchaseHistory, setPurchaseHistory] = useState(() => {
    try {
      const raw = localStorage.getItem("purchaseHistory");
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    if (!window.ethereum) alert("Please install MetaMask!");
  }, []);

  const connectWallet = async () => {
    if (!window.ethereum) return alert("MetaMask not installed!");
    try {
      // ethers v5 Web3Provider
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const userAddress = await signer.getAddress();
      setAccount(userAddress);

      const balanceWei = await provider.getBalance(userAddress);
      setBalance(ethers.utils.formatEther(balanceWei));

      const marketContract = new ethers.Contract(contractAddress, MarketPlaceABI, signer);
      setContract(marketContract);

      await loadAllItems(marketContract);
    } catch (err) {
      console.error("Wallet connection failed:", err);
    }
  };

  const loadAllItems = async (marketContract) => {
    if (!marketContract) return;
    try {
      setLoading(true);
      const countBN = await marketContract.itemCount();
      const count = countBN.toNumber();
      const itemList = [];
      for (let i = 1; i <= count; i++) {
        const item = await marketContract.items(i);
        itemList.push(item);
      }
      setItems(itemList);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.error("Failed to load items:", err);
    }
  };

  const listItem = async () => {
    if (!contract) return alert("Connect wallet first");
    if (!name || !price) return alert("Enter name and price");

    try {
  const tx = await contract.ListItems(name, ethers.utils.parseEther(price), { gasLimit: 500000 });
      await tx.wait();
      await loadAllItems(contract);
      setName("");
      setPrice("");
    } catch (err) {
      console.error("Failed to list item:", err);
    }
  };

  const buyItem = async (id, itemPrice) => {
    if (!contract) return alert("Connect wallet first");
    try {
      const tx = await contract.buyItem(id, { value: itemPrice, gasLimit: 500000 });
      const txHash = tx.hash;
      await tx.wait();
      // record purchase in history (find item name)
      try {
        const idStr = id && id.toString ? id.toString() : String(id);
        const item = items.find((it) => (it.Id && it.Id.toString ? it.Id.toString() : String(it.Id)) === idStr);
        const record = {
          id: idStr,
          name: item ? item.name : "-",
          price: ethers.utils.formatEther(itemPrice),
          txHash,
          date: new Date().toISOString(),
        };
        const next = [record, ...purchaseHistory].slice(0, 100);
        setPurchaseHistory(next);
        try {
          localStorage.setItem("purchaseHistory", JSON.stringify(next));
        } catch (e) {
          /* ignore storage errors */
        }
      } catch (e) {
        console.warn("Could not record purchase", e);
      }

      await loadAllItems(contract);
    } catch (err) {
      console.error("Failed to buy item:", err);
    }
  };

  const clearHistory = () => {
    setPurchaseHistory([]);
    try {
      localStorage.removeItem("purchaseHistory");
    } catch (e) {
      /* ignore */
    }
  };

  const transferItem = async (id, toAddress) => {
    if (!contract) return alert("Connect wallet first");
    if (!toAddress) return alert("Enter recipient address");
    try {
      const tx = await contract.transferItem(id, toAddress, { gasLimit: 500000 });
      await tx.wait();
      await loadAllItems(contract);
    } catch (err) {
      console.error("Failed to transfer item:", err);
    }
  };

  const getItemsByOwner = async () => {
    if (!contract) return alert("Connect wallet first");
    if (!ownerAddress) return alert("Enter owner address");
    try {
      const ids = await contract.getItemByOwner(ownerAddress);
      const ownedItems = [];
      for (let id of ids) {
        const item = await contract.items(id);
        ownedItems.push(item);
      }
      setItems(ownedItems);
    } catch (err) {
      console.error("Failed to get items by owner:", err);
    }
  };

  return (
    <div className="container">
      <div className="header">
        <h2 className="title">Flow Marketplace (Simplified)</h2>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button className="btn ghost" onClick={toggleTheme} title="Toggle theme" aria-label="Toggle theme">
            {theme === "dark" ? (
              <>
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
                Light
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M6.76 4.84l-1.8-1.79L3.17 4.84l1.79 1.79 1.8-1.79zM1 13h3v-2H1v2zm10 9h2v-3h-2v3zm7.03-2.03l1.79 1.79 1.79-1.79-1.79-1.79-1.79 1.79zM20 11v2h3v-2h-3zM4.22 19.78l1.79-1.79-1.79-1.79L2.43 18l1.79 1.78zM11 1h2v3h-2V1zm7.78 4.22l-1.79 1.79 1.79 1.79 1.79-1.79-1.79-1.79z"/></svg>
                Dark
              </>
            )}
          </button>

          <input
            className="input"
            placeholder="Search items..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ width: 220 }}
          />

          {account ? (
            <div className="wallet-info">
              <p><b>Address:</b> {account}</p>
              <p><b>Balance:</b> {balance} FLOW / ETH</p>
            </div>
          ) : (
            <button className="btn" onClick={connectWallet} aria-label="Connect Wallet">
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M21 7H3a1 1 0 00-1 1v10a2 2 0 002 2h16a2 2 0 002-2V8a1 1 0 00-1-1zm-1 10H4V9h16v8zM7 11h10v2H7z"/></svg>
              Connect
            </button>
          )}
        </div>
      </div>

      <div className="section">
        <h3>List Item</h3>
        <div className="form-row">
          <input
            className="input"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            className="input small"
            placeholder="Price in FLOW/ETH"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
          <button className="btn" onClick={listItem}>List Item</button>
        </div>
      </div>

      <div className="section">
        <h3>All Items</h3>
        {loading ? (
          <div className="items-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <div className="item-card skeleton" key={`skeleton-${i}`}>
                <div className="skeleton-title" />
                <div className="skeleton-line" />
                <div className="skeleton-line short" />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className="muted">No items available</p>
        ) : (
          <div className="items-grid">
            {items
              .filter((it) => (it.name || "").toLowerCase().includes(query.toLowerCase()))
              .map((item, idx) => (
                <ItemCard
                  key={item.Id ? item.Id.toString() : idx}
                  item={item}
                  account={account}
                  buyItem={buyItem}
                  transferItem={transferItem}
                  index={idx}
                />
              ))}
          </div>
        )}
      </div>

      <div className="section">
        <h3>Purchase History</h3>
        {purchaseHistory.length === 0 ? (
          <div className="secondary muted">No purchases yet</div>
        ) : (
          <div style={{ marginBottom: 12 }}>
            <button className="btn ghost" onClick={clearHistory}>Clear History</button>
          </div>
        )}
        {purchaseHistory.length > 0 && (
          <div className="items-grid">
            {purchaseHistory.map((p) => (
              <div className="item-card" key={p.txHash}>
                <div className="item-meta">
                  <div>
                    <div className="muted">ID: {p.id}</div>
                    <div>{p.name}</div>
                  </div>
                  <div className="item-price">{p.price} FLOW</div>
                </div>
                <div className="muted">Tx: <span style={{wordBreak:'break-all'}}>{p.txHash}</span></div>
                <div className="muted">When: {new Date(p.date).toLocaleString()}</div>
              </div>
            ))}
          </div>
        )}

        <h3>Get Items by Owner</h3>
        <div className="form-row">
          <input
            className="input"
            placeholder="Owner address"
            value={ownerAddress}
            onChange={(e) => setOwnerAddress(e.target.value)}
          />
          <button className="btn ghost" onClick={getItemsByOwner}>Get Items</button>
        </div>
      </div>
    </div>
  );
}

export default App;