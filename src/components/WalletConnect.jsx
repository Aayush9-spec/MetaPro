import { useState, useEffect } from "react";
import { BrowserProvider } from "ethers";

function WalletConnect({ setAccount, setBalance, setContract, loadAllItems }) {
  const [error, setError] = useState("");

  useEffect(() => {
    if (!window.ethereum) {
      setError("Please install MetaMask!");
    }
  }, []);

  const connectWallet = async () => {
    if (!window.ethereum) return setError("MetaMask not installed!");
    try {
      const provider = new BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const userAddress = accounts[0];
      setAccount(userAddress);

      const balanceWei = await provider.getBalance(userAddress);
      setBalance(formatEther(balanceWei));

      const marketContract = new Contract(contractAddress, MarketPlaceABI, signer);
      setContract(marketContract);
      await loadAllItems(marketContract);
    } catch (err) {
      console.error("Wallet connection failed:", err);
      setError("Wallet connection failed. Please try again.");
    }
  };

  return (
    <div>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <button onClick={connectWallet}>Connect Wallet</button>
    </div>
  );
}

export default WalletConnect;