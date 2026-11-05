export const assetApi = (authFetch) => ({
  index: () => authFetch("/api/assets").then((res) => res.json()),
  store: (data) =>
    authFetch("/api/assets", {
      method: "POST",
      body: JSON.stringify(data),
    }).then((res) => res.json()),
  update: (id, data) =>
    authFetch(`/api/assets/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }).then((res) => res.json()),
  destroy: (id) =>
    authFetch(`/api/assets/${id}`, {
      method: "DELETE",
    }).then((res) => res.json()),
  getPortfolioSummary: () =>
    authFetch("/api/portfolio-summary").then((res) => res.json()),
  getCryptoMarket: (page = 1, search = "", perPage = 100) =>
    authFetch(`/api/market/crypto?page=${page}&per_page=${perPage}${search ? `&search=${search}` : ""}`).then((res) => res.json()),
  getStockMarket: (page = 1, search = "", category = "all", perPage = 20) =>
    authFetch(`/api/market/stocks?page=${page}&per_page=${perPage}&category=${category}${search ? `&search=${search}` : ""}`).then((res) => res.json()),
  searchStock: (query) =>
    authFetch(`/api/market/stocks/search?q=${query}`).then((res) => res.json()),
  getCryptoDetails: (id) =>
    authFetch(`/api/market/crypto/${id}`).then((res) => res.json()),
  getHistory: (params) => {
    const query = new URLSearchParams(params).toString();
    return authFetch(`/api/assets/history?${query}`).then((res) => res.json());
  },
  getGlobalHistory: () =>
    authFetch(`/api/assets/all-history`).then((res) => res.json()),
  deletePurchase: (id) =>
    authFetch(`/api/assets/purchase/${id}`, { method: "DELETE" }).then((res) => res.json()),
});
