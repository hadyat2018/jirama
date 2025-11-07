import React, { useEffect, useState } from "react";

// Composant pour ajouter un nouveau stock
function AjouterStock({ onBack, onStockAdded, stocks }) {
  // Générer automatiquement l'identifiant
  const genererIdentifiant = () => {
    if (stocks.length === 0) return "ART001";
    
    // Extraire les numéros des identifiants existants
    const numeros = stocks
      .map(s => {
        const match = s.identifiant.match(/ART(\d+)/);
        return match ? parseInt(match[1]) : 0;
      })
      .filter(n => n > 0);
    
    const maxNumero = numeros.length > 0 ? Math.max(...numeros) : 0;
    const nouveauNumero = maxNumero + 1;
    
    return `ART${nouveauNumero.toString().padStart(3, '0')}`;
  };

  const [form, setForm] = useState({ 
    identifiant: genererIdentifiant(), 
    nom: "", 
    quantite: "", 
    quantite_min: "", 
    quantite_max: "",
    statut: "Stock suffisant"
  });

  useEffect(() => {
    setForm(prev => ({ ...prev, identifiant: genererIdentifiant() }));
  }, [stocks]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    fetch("http://localhost:5000/api/stocks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
      .then(() => {
        setForm({ identifiant: genererIdentifiant(), nom: "", quantite: "", quantite_min: "", quantite_max: "", statut: "Stock suffisant" });
        onStockAdded();
        onBack();
      })
      .catch((err) => console.error("Erreur ajout:", err));
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Nouveau stock</h1>
        <button 
          onClick={onBack}
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          ← Retour
        </button>
      </div>

      <div className="bg-white shadow-lg rounded-xl p-8 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Identifiant * (Auto-généré)
            </label>
            <input
              type="text"
              name="identifiant"
              placeholder="Auto-généré"
              value={form.identifiant}
              onChange={handleChange}
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-100"
              readOnly
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom 
            </label>
            <input
              type="text"
              name="nom"
              placeholder="Saisir le nom"
              value={form.nom}
              onChange={handleChange}
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantité 
            </label>
            <input
              type="number"
              name="quantite"
              placeholder="Saisir la quantité"
              value={form.quantite}
              onChange={handleChange}
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantité minimum 
            </label>
            <input
              type="number"
              name="quantite_min"
              placeholder="Saisir la quantité minimum"
              value={form.quantite_min}
              onChange={handleChange}
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantité maximum 
            </label>
            <input
              type="number"
              name="quantite_max"
              placeholder="Saisir la quantité maximum"
              value={form.quantite_max}
              onChange={handleChange}
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Statut 
            </label>
            <select
              name="statut"
              value={form.statut}
              onChange={handleChange}
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="Stock insuffisant">Stock insuffisant</option>
              <option value="Stock moyen">Stock moyen</option>
              <option value="Stock suffisant">Stock suffisant</option>
            </select>
          </div>

          <div className="md:col-span-2 flex gap-4 pt-6">
            <button 
              onClick={handleSubmit}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium"
            >
              Enregistrer
            </button>
            <button 
              onClick={onBack}
              className="bg-gray-400 hover:bg-gray-500 text-white px-8 py-3 rounded-lg font-medium"
            >
              Annuler
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Fonction utilitaire pour déterminer le statut basé sur la quantité
function determinerStatut(stock) {
  if (stock.statut) {
    return stock.statut;
  }
  if (stock.quantite <= stock.quantite_min) {
    return "Stock insuffisant";
  } else if (stock.quantite <= (stock.quantite_min * 1.5)) {
    return "Stock moyen";
  } else {
    return "Stock suffisant";
  }
}

// Composant pour la consultation des stocks
function ConsultationStock({ stocks, onBack }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const filteredStocks = stocks.filter(stock => {
    const matchesSearch = stock.nom.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         stock.identifiant.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === "all") return matchesSearch;
    if (filterStatus === "critical") return matchesSearch && determinerStatut(stock) === "Stock insuffisant";
    if (filterStatus === "actions") return matchesSearch && determinerStatut(stock) === "Stock moyen";
    if (filterStatus === "ok") return matchesSearch && determinerStatut(stock) === "Stock suffisant";
    return matchesSearch;
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Consultation des Stocks</h1>
        <button 
          onClick={onBack}
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          ← Retour
        </button>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white shadow-lg rounded-xl p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rechercher
            </label>
            <input
              type="text"
              placeholder="Rechercher par nom ou identifiant..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filtrer par statut
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous les stocks</option>
              <option value="ok">Stock suffisant</option>
              <option value="actions">Stock moyen</option>
              <option value="critical">Stock insuffisant</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tableau des stocks */}
      <div className="overflow-x-auto bg-white shadow-lg rounded-xl p-6">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-4 border font-semibold">Identifiant</th>
              <th className="p-4 border font-semibold">Nom du Produit</th>
              <th className="p-4 border font-semibold">Quantité Actuelle</th>
              <th className="p-4 border font-semibold">Seuil Min</th>
              <th className="p-4 border font-semibold">Seuil Max</th>
              <th className="p-4 border font-semibold">Statut</th>
              <th className="p-4 border font-semibold">Niveau de Stock</th>
            </tr>
          </thead>
          <tbody>
            {filteredStocks.map((stock) => {
              const percentageStock = ((stock.quantite / stock.quantite_max) * 100).toFixed(1);
              const statut = determinerStatut(stock);
              return (
                <tr key={stock.id} className="hover:bg-gray-50">
                  <td className="p-4 border font-mono text-sm">{stock.identifiant}</td>
                  <td className="p-4 border font-medium">{stock.nom}</td>
                  <td className="p-4 border text-center">
                    <span className={`px-2 py-1 rounded font-bold ${
                      statut === "Stock insuffisant" ? 'bg-red-100 text-red-800' : 
                      statut === "Stock moyen" ? 'bg-orange-100 text-orange-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {stock.quantite}
                    </span>
                  </td>
                  <td className="p-4 border text-center text-orange-600 font-medium">{stock.quantite_min}</td>
                  <td className="p-4 border text-center text-blue-600 font-medium">{stock.quantite_max}</td>
                  <td className="p-4 border text-center">
                    {statut === "Stock insuffisant" ? (
                      <span className="px-3 py-1 bg-red-500 text-white rounded-full text-xs font-bold">STOCK INSUFFISANT</span>
                    ) : statut === "Stock moyen" ? (
                      <span className="px-3 py-1 bg-orange-500 text-white rounded-full text-xs font-bold">STOCK MOYEN</span>
                    ) : (
                      <span className="px-3 py-1 bg-green-500 text-white rounded-full text-xs font-bold">STOCK SUFFISANT</span>
                    )}
                  </td>
                  <td className="p-4 border">
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full transition-all ${
                          percentageStock <= 25 ? 'bg-red-500' :
                          percentageStock <= 50 ? 'bg-orange-500' : 
                          'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(Math.max(percentageStock, 0), 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-600 mt-1 block">{Math.min(percentageStock, 100)}% du max</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        
        {filteredStocks.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Aucun stock trouvé avec les critères sélectionnés
          </div>
        )}
      </div>
    </div>
  );
}

// Composant pour les retraits
function RetraitStock({ stocks, onBack, onStockUpdated }) {
  const [selectedStock, setSelectedStock] = useState("");
  const [quantiteRetrait, setQuantiteRetrait] = useState("");
  const [motifRetrait, setMotifRetrait] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredStocks = stocks.filter(stock => 
    stock.nom.toLowerCase().includes(searchTerm.toLowerCase()) || 
    stock.identifiant.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stockSelectionne = stocks.find(s => s.id.toString() === selectedStock);

  const handleRetrait = (e) => {
    e.preventDefault();
    
    if (!selectedStock || !quantiteRetrait || !motifRetrait) {
      alert("Veuillez remplir tous les champs");
      return;
    }

    const stock = stocks.find(s => s.id.toString() === selectedStock);
    const nouvelleQuantite = parseInt(stock.quantite) - parseInt(quantiteRetrait);

    if (nouvelleQuantite < 0) {
      alert("Quantité insuffisante en stock");
      return;
    }

    // Mise à jour du stock
    fetch(`http://localhost:5000/api/stocks/${selectedStock}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...stock,
        quantite: nouvelleQuantite
      }),
    })
      .then(() => {
        // Enregistrement du mouvement (optionnel - nécessite une API pour les mouvements)
        const mouvement = {
          stock_id: selectedStock,
          type: "sortie",
          quantite: parseInt(quantiteRetrait),
          motif: motifRetrait,
          date: new Date().toISOString()
        };
        
        // Réinitialiser le formulaire
        setSelectedStock("");
        setQuantiteRetrait("");
        setMotifRetrait("");
        setSearchTerm("");
        
        onStockUpdated();
        alert("Retrait effectué avec succès");
      })
      .catch((err) => {
        console.error("Erreur retrait:", err);
        alert("Erreur lors du retrait");
      });
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Retrait de Stock</h1>
        <button 
          onClick={onBack}
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          ← Retour
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Formulaire de retrait */}
        <div className="bg-white shadow-lg rounded-xl p-6">
          <h2 className="text-xl font-bold mb-6 text-gray-800">Effectuer un Retrait</h2>
          
          <form onSubmit={handleRetrait} className="space-y-6">
            {/* Recherche et sélection du produit */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rechercher un produit
              </label>
              <input
                type="text"
                placeholder="Rechercher par nom ou identifiant..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 mb-3"
              />
              
              <select
                value={selectedStock}
                onChange={(e) => setSelectedStock(e.target.value)}
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">-- Sélectionner un produit --</option>
                {filteredStocks.map(stock => (
                  <option key={stock.id} value={stock.id}>
                    {stock.identifiant} - {stock.nom} (Stock: {stock.quantite})
                  </option>
                ))}
              </select>
            </div>

            {/* Informations du stock sélectionné */}
            {stockSelectionne && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 mb-2">Informations du produit</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><strong>Nom:</strong> {stockSelectionne.nom}</div>
                  <div><strong>Stock actuel:</strong> {stockSelectionne.quantite}</div>
                  <div><strong>Seuil min:</strong> {stockSelectionne.quantite_min}</div>
                  <div><strong>Seuil max:</strong> {stockSelectionne.quantite_max}</div>
                </div>
                {determinerStatut(stockSelectionne) === "Stock insuffisant" && (
                  <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded text-red-700 text-sm">
                    ⚠️ Attention: Ce produit a un stock insuffisant!
                  </div>
                )}
              </div>
            )}

            {/* Quantité à retirer */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantité à retirer 
              </label>
              <input
                type="number"
                min="1"
                max={stockSelectionne?.quantite || ""}
                value={quantiteRetrait}
                onChange={(e) => setQuantiteRetrait(e.target.value)}
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
              {stockSelectionne && quantiteRetrait && (
                <div className="mt-2 text-sm text-gray-600">
                  Stock restant après retrait: {stockSelectionne.quantite - parseInt(quantiteRetrait || 0)}
                </div>
              )}
            </div>

            {/* Motif du retrait */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motif du retrait 
              </label>
              <select
                value={motifRetrait}
                onChange={(e) => setMotifRetrait(e.target.value)}
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">-- Sélectionner un motif --</option>
                <option value="Vente">Vente</option>
                <option value="Utilisation interne">Utilisation interne</option>
                <option value="Périmé">Produit périmé</option>
                <option value="Défectueux">Produit défectueux</option>
                <option value="Echange">Echange</option>
                <option value="Reparation">Reparation</option>
                <option value="Autre">Autre</option>
              </select>
            </div>

            <div className="flex gap-4 pt-4">
              <button 
                type="submit"
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-medium flex-1"
              >
                Effectuer le Retrait
              </button>
              <button 
                type="button"
                onClick={() => {
                  setSelectedStock("");
                  setQuantiteRetrait("");
                  setMotifRetrait("");
                  setSearchTerm("");
                }}
                className="bg-gray-400 hover:bg-gray-500 text-white px-8 py-3 rounded-lg font-medium"
              >
                Réinitialiser
              </button>
            </div>
          </form>
        </div>

        {/* Liste des stocks disponibles */}
        <div className="bg-white shadow-lg rounded-xl p-6">
          <h2 className="text-xl font-bold mb-6 text-gray-800">Stocks Disponibles</h2>
          <div className="max-h-96 overflow-y-auto">
            {filteredStocks.map((stock) => {
              const statut = determinerStatut(stock);
              return (
                <div 
                  key={stock.id} 
                  className={`border rounded-lg p-4 mb-3 cursor-pointer hover:bg-gray-50 ${
                    selectedStock === stock.id.toString() ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                  onClick={() => setSelectedStock(stock.id.toString())}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-gray-800">{stock.nom}</h4>
                      <p className="text-sm text-gray-600">ID: {stock.identifiant}</p>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${
                        statut === "Stock insuffisant" ? 'text-red-600' : 
                        statut === "Stock moyen" ? 'text-orange-600' :
                        'text-green-600'
                      }`}>
                        {stock.quantite}
                      </div>
                      <div className="text-xs text-gray-500">
                        Min: {stock.quantite_min}
                      </div>
                    </div>
                  </div>
                  {statut === "Stock insuffisant" && (
                    <div className="mt-2 text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                      Stock insuffisant!
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// Composant principal
export default function GestionStock() {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ 
    id: null, 
    identifiant: "", 
    nom: "", 
    quantite: "", 
    quantite_min: "", 
    quantite_max: "",
    statut: "Stock suffisant"
  });
  const [editing, setEditing] = useState(false);
  const [currentView, setCurrentView] = useState("dashboard");

  // Charger les données
  const fetchStocks = () => {
    fetch("http://localhost:5000/api/stocks")
      .then((res) => res.json())
      .then((data) => {
        setStocks(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erreur :", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchStocks();
  }, []);

  // Navigation entre les vues
  if (currentView === "add") {
    return (
      <AjouterStock 
        onBack={() => setCurrentView("dashboard")}
        onStockAdded={fetchStocks}
        stocks={stocks}
      />
    );
  }

  if (currentView === "consultation") {
    return (
      <ConsultationStock 
        stocks={stocks}
        onBack={() => setCurrentView("dashboard")}
      />
    );
  }

  if (currentView === "retrait") {
    return (
      <RetraitStock 
        stocks={stocks}
        onBack={() => setCurrentView("dashboard")}
        onStockUpdated={fetchStocks}
      />
    );
  }

  // Vue principale (dashboard)
  const totalStocks = stocks.length;
  const criticalStocks = stocks.filter((s) => determinerStatut(s) === "Stock insuffisant").length;
  const actionStocks = stocks.filter((s) => determinerStatut(s) === "Stock moyen").length;
  const okStocks = stocks.filter((s) => determinerStatut(s) === "Stock suffisant").length;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    fetch(`http://localhost:5000/api/stocks/${form.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
      .then(() => {
        fetchStocks();
        resetForm();
      })
      .catch((err) => console.error("Erreur maj:", err));
  };

  const handleDelete = (id) => {
    if (window.confirm("Voulez-vous vraiment supprimer ce stock ?")) {
      fetch(`http://localhost:5000/api/stocks/${id}`, { method: "DELETE" })
        .then(() => fetchStocks())
        .catch((err) => console.error("Erreur suppression:", err));
    }
  };

  const handleEdit = (stock) => {
    setForm({
      ...stock,
      statut: stock.statut || determinerStatut(stock)
    });
    setEditing(true);
  };

  const resetForm = () => {
    setForm({ 
      id: null, 
      identifiant: "", 
      nom: "", 
      quantite: "", 
      quantite_min: "", 
      quantite_max: "",
      statut: "Stock suffisant"
    });
    setEditing(false);
  };

  if (loading) {
    return <p className="text-center mt-10 text-gray-600">Chargement...</p>;
  }

  return (
    <div className="p-6">
      {/* En-tête avec navigation */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Gestion des Stocks</h1>
        <div className="flex gap-3">
          <button 
            onClick={() => setCurrentView("consultation")}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium"
          >
            Consultation
          </button>
          <button 
            onClick={() => setCurrentView("retrait")}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium"
          >
            Retrait
          </button>
          <button 
            onClick={() => setCurrentView("add")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium"
          >
            Nouveau
          </button>
        </div>
      </div>

      {/* Tableau de bord */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
        <div className="bg-blue-500 text-white p-6 rounded-2xl shadow-md text-center">
          <h2 className="text-lg font-bold">Total Produits</h2>
          <p className="text-3xl font-extrabold">{totalStocks}</p>
        </div>
        <div className="bg-red-500 text-white p-6 rounded-2xl shadow-md text-center">
          <h2 className="text-lg font-bold">Stock Insuffisant</h2>
          <p className="text-3xl font-extrabold">{criticalStocks}</p>
        </div>
        <div className="bg-orange-500 text-white p-6 rounded-2xl shadow-md text-center">
          <h2 className="text-lg font-bold">Stock Moyen</h2>
          <p className="text-3xl font-extrabold">{actionStocks}</p>
        </div>
        <div className="bg-green-500 text-white p-6 rounded-2xl shadow-md text-center">
          <h2 className="text-lg font-bold">Stock Suffisant</h2>
          <p className="text-3xl font-extrabold">{okStocks}</p>
        </div>
        <div className="bg-purple-500 text-white p-6 rounded-2xl shadow-md text-center">
          <h2 className="text-lg font-bold">Taux Critique</h2>
          <p className="text-3xl font-extrabold">
            {totalStocks > 0 ? Math.round((criticalStocks / totalStocks) * 100) : 0}%
          </p>
        </div>
      </div>

      {/* Alertes stocks critiques */}
      {criticalStocks > 0 && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-red-500 text-xl">⚠️</span>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                <strong>Attention!</strong> {criticalStocks} produit(s) avec stock insuffisant nécessite(nt) un réapprovisionnement urgent.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Formulaire de modification */}
      {editing && (
        <div className="bg-white shadow rounded-2xl p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Modifier un stock</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              name="identifiant"
              placeholder="Identifiant"
              value={form.identifiant}
              onChange={handleChange}
              className="border p-2 rounded bg-gray-100"
              readOnly
              required
            />
            <input
              type="text"
              name="nom"
              placeholder="Nom"
              value={form.nom}
              onChange={handleChange}
              className="border p-2 rounded"
              required
            />
            <input
              type="number"
              name="quantite"
              placeholder="Quantité"
              value={form.quantite}
              onChange={handleChange}
              className="border p-2 rounded"
              required
            />
            <input
              type="number"
              name="quantite_min"
              placeholder="Quantité min"
              value={form.quantite_min}
              onChange={handleChange}
              className="border p-2 rounded"
              required
            />
            <input
              type="number"
              name="quantite_max"
              placeholder="Quantité max"
              value={form.quantite_max}
              onChange={handleChange}
              className="border p-2 rounded"
              required
            />
            <select
              name="statut"
              value={form.statut}
              onChange={handleChange}
              className="border p-2 rounded"
              required
            >
              <option value="Stock insuffisant">Stock insuffisant</option>
              <option value="Stock moyen">Stock moyen</option>
              <option value="Stock suffisant">Stock suffisant</option>
            </select>
            <div className="flex gap-2 md:col-span-2">
              <button 
                onClick={handleSubmit}
                className="bg-green-600 text-white px-4 py-2 rounded"
              >
                Mettre à jour
              </button>
              <button 
                onClick={resetForm}
                className="bg-gray-400 text-white px-4 py-2 rounded"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tableau principal */}
      <div className="overflow-x-auto bg-white shadow rounded-2xl p-6">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-3 border">Identifiant</th>
              <th className="p-3 border">Nom</th>
              <th className="p-3 border">Quantité</th>
              <th className="p-3 border">Min</th>
              <th className="p-3 border">Max</th>
              <th className="p-3 border">Statut</th>
              <th className="p-3 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {stocks.map((stock) => {
              const statut = determinerStatut(stock);
              return (
                <tr key={stock.id} className={`${
                  statut === "Stock insuffisant" ? "bg-red-100" : 
                  statut === "Stock moyen" ? "bg-orange-100" :
                  "bg-green-100"
                }`}>
                  <td className="p-3 border">{stock.identifiant}</td>
                  <td className="p-3 border">{stock.nom}</td>
                  <td className="p-3 border">{stock.quantite}</td>
                  <td className="p-3 border">{stock.quantite_min}</td>
                  <td className="p-3 border">{stock.quantite_max}</td>
                  <td className="p-3 border font-semibold">
                    {statut === "Stock insuffisant" ? (
                      <span className="text-red-600">Stock insuffisant</span>
                    ) : statut === "Stock moyen" ? (
                      <span className="text-orange-600">Stock moyen</span>
                    ) : (
                      <span className="text-green-600">Stock suffisant</span>
                    )}
                  </td>
                  <td className="p-3 border flex gap-2">
                    <button onClick={() => handleEdit(stock)} className="bg-blue-500 text-white px-3 py-1 rounded">
                      Modifier
                    </button>
                    <button onClick={() => handleDelete(stock.id)} className="bg-red-500 text-white px-3 py-1 rounded">
                      Supprimer
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}