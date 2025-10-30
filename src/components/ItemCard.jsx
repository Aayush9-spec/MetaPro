import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { ethers } from "ethers";

export default function ItemCard({ item, account, buyItem, transferItem, index = 0 }) {
  const [toAddress, setToAddress] = useState("");
  const [mounted, setMounted] = useState(false);

  // staggered mount for entrance animation
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), Math.min(300, index * 60));
    return () => clearTimeout(t);
  }, [index]);

  const idStr = item.Id ? item.Id.toString() : "-";
  const priceStr = item.price ? ethers.utils.formatEther(item.price) : "0";

  const isOwner = item.owner && account && item.owner.toLowerCase() === account.toLowerCase();
  const canBuy = item.owner && account && item.owner.toLowerCase() !== account.toLowerCase() && !item.isSold;

  return (
  <div className={`item-card ${mounted ? "enter" : ""}`} style={{ animationDelay: `${index * 60}ms` }}>
      <div className="item-meta">
        <div>
          <div className="muted">ID: {idStr}</div>
          <div>{item.name}</div>
        </div>
        <div className="item-price">{priceStr} FLOW</div>
      </div>

      <div className="muted">Seller: {item.seller}</div>
      <div className="muted">Owner: {item.owner}</div>
      <div className="muted">Sold: {item.isSold ? "Yes" : "No"}</div>

      <div className="item-actions">
        {canBuy && (
          <button className="btn" onClick={() => buyItem(item.Id, item.price)} aria-label={`Buy item ${idStr}`}>
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M7 4h-2l-1 2H2v2h1l3.6 7.59-1.35 2.44A1 1 0 0 0 5.2 19h12v-2H6.42a.25.25 0 0 1-.23-.14L7.1 16h7.45a1 1 0 0 0 .92-.63l2.58-6.97A1 1 0 0 0 17.1 7H6.21l-.94-2z"/></svg>
            Buy
          </button>
        )}

        {isOwner && (
          <div style={{ width: "100%" }}>
            <div className="transfer-row">
              <input
                className="transfer-input"
                placeholder="Transfer to"
                value={toAddress}
                onChange={(e) => setToAddress(e.target.value)}
              />
              <button
                className="btn ghost"
                onClick={() => {
                  transferItem(item.Id, toAddress);
                  setToAddress("");
                }}
                aria-label={`Transfer item ${idStr}`}
              >
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M13 5l7 7-7 7v-4H4v-6h9V5z"/></svg>
                Transfer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

ItemCard.propTypes = {
  item: PropTypes.shape({
    Id: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.object]),
    name: PropTypes.string,
    price: PropTypes.any,
    seller: PropTypes.string,
    owner: PropTypes.string,
    isSold: PropTypes.bool,
  }).isRequired,
  account: PropTypes.string,
  buyItem: PropTypes.func.isRequired,
  transferItem: PropTypes.func.isRequired,
  index: PropTypes.number,
};