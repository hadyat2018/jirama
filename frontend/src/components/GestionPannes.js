import React, { useState, useEffect } from 'react';

const GestionPannes = () => {
  const [pannes, setPannes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentPanne, setCurrentPanne] = useState({
    id: null,
    identifiant: '',
    materiel: '',
    taper: '',
    employe: '',
    departement: '',
    description: '',
    panne_de_dattes: '',
    priorite: 'Moyenne',
    statut: 'Nouveau',
    technicien: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDepartement, setFilterDepartement] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // États pour les modes de saisie
  const [materielMode, setMaterielMode] = useState('selection');
  const [typeMode, setTypeMode] = useState('selection');
  const [prioriteMode, setPrioriteMode] = useState('selection');
  const [statutMode, setStatutMode] = useState('selection');

  // URL API
  const API_URL = 'http://localhost:5000/api/pannes';

  // Liste des départements
  const departements = [
    'DIRECTEUR',
    'STAFF SUPPORT',
    'STAFF',
    'SFIN',
    'SCOMM',
    'SEXO',
    'SRH',
    'SPE',
    'SDE',
    'CMS',
    'SLA',
    'CONTENTIEUX',
    'SCC',
    'SAPPRO',
    'SECC',
    'SSI'
  ];

  // Liste des matériels (codes)
  const materiels = [
    'SRV',
    'PTB',
    'CPU',
    'ECR',
    'OND',
    'IMPL',
    'IMPLC',
    'IMPLMD',
    'IMPLHD',
    'IMPLM',
    'IMPLMC',
    'IMPM',
    'IMPT',
    'IMPGDB',
    'IMPJM',
    'IMPJ',
    'TRACEUR',
    'SCANNER',
    'CBARRE',
    'TABLETTE',
    'VPROJ',
    'ADAPT',
    'DVD EXT',
    'AUT'
  ];

  // Liste des types de matériel (descriptions complètes)
  const typesMateriel = [
    'Serveur',
    'Portable',
    'Unité centrale',
    'Ecran',
    'onduleur',
    'Imprimante Laser',
    'Imprimante Laser Couleur',
    'Imprimante laser Moyen débit',
    'Imprimante laser haut débit',
    'Imprimante laser multifonction',
    'Imprimante laser multifonction Couleur',
    'Imprimante Matricielle',
    'Imprimante Ticket (caisse)',
    'Imprimante grand débit',
    'imprimante jet d\'encre multifonction',
    'imprimante jet d\'encre',
    'Traceur',
    'Scanner',
    'Lecteur code à barre',
    'Tablette',
    'Vidéo projecteur',
    'Adaptateur',
    'Lecteur DVD Externe',
    'Autres'
  ];

  // Liste des priorités
  const priorites = ['Basse', 'Moyenne', 'Haute', 'Critique'];

  // Liste des statuts disponibles
  const statutsDisponibles = [
    'Nouveau',
    'En attente',
    'En cours',
    'Résolu',
    'Fermé'
  ];

  // Charger les données depuis API
  useEffect(() => {
    const fetchPannes = async () => {
      setLoading(true);
      try {
        const res = await fetch(API_URL);
        const data = await res.json();
        setPannes(data || []);
      } catch (err) {
        console.error(err);
        setError("Impossible de charger les pannes");
        setPannes([]);
      }
      setLoading(false);
    };

    fetchPannes();
  }, []);

  // Générer identifiant séquentiel
  const generateIdentifiant = () => {
    const maxNumber = pannes.reduce((max, panne) => {
      if (panne.identifiant && panne.identifiant.startsWith('Pan ')) {
        const number = parseInt(panne.identifiant.replace('Pan ', ''));
        return Math.max(max, number);
      }
      return max;
    }, 0);
    const nextNumber = maxNumber + 1;
    return `Pan ${nextNumber.toString().padStart(2, '0')}`;
  };

  // Ouvrir modal ajout
  const openAddModal = () => {
    setCurrentPanne({
      id: null,
      identifiant: generateIdentifiant(),
      materiel: '',
      taper: '',
      employe: '',
      departement: '',
      description: '',
      panne_de_dattes: new Date().toISOString().split('T')[0],
      priorite: 'Moyenne',
      statut: 'Nouveau',
      technicien: ''
    });
    setEditMode(false);
    setMaterielMode('selection');
    setTypeMode('selection');
    setPrioriteMode('selection');
    setStatutMode('selection');
    setShowModal(true);
  };

  // Ouvrir modal edit
  const openEditModal = (panne) => {
    setCurrentPanne({
      ...panne,
      panne_de_dattes: panne.panne_de_dattes
        ? panne.panne_de_dattes.split('T')[0]
        : '',
      statut: panne.statut || 'Nouveau'
    });
    setEditMode(true);
    setMaterielMode('selection');
    setTypeMode('selection');
    setPrioriteMode('selection');
    setStatutMode('selection');
    setShowModal(true);
  };

  // Fermer modal
  const closeModal = () => {
    setShowModal(false);
    setError('');
  };

  // Handle input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentPanne(prev => ({ ...prev, [name]: value }));
  };

  // Sauvegarder panne
  const savePanne = async (e) => {
    e.preventDefault();
    setError('');
    
    // S'assurer que le statut est bien défini
    const panneToSave = {
      ...currentPanne,
      statut: currentPanne.statut || 'Nouveau'
    };
    
    console.log('Données à enregistrer:', panneToSave);
    
    try {
      if (editMode) {
        const response = await fetch(`${API_URL}/${panneToSave.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(panneToSave)
        });
        
        if (!response.ok) {
          throw new Error('Erreur lors de la modification');
        }
        
        alert("Panne modifiée !");
      } else {
        const response = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(panneToSave)
        });
        
        if (!response.ok) {
          throw new Error('Erreur lors de la création');
        }
        
        alert("Panne créée !");
      }
      
      // Recharger les données
      const res = await fetch(API_URL);
      const data = await res.json();
      setPannes(data || []);
      closeModal();
    } catch (err) {
      console.error('Erreur:', err);
      setError("Erreur lors de l'enregistrement");
      alert("Erreur lors de l'enregistrement: " + err.message);
    }
  };

  // Supprimer panne
  const deletePanne = async (id, identifiant) => {
    if (window.confirm(`Supprimer la panne ${identifiant} ?`)) {
      try {
        await fetch(`${API_URL}/${id}`, { method: "DELETE" });
        setPannes(prev => prev.filter(p => p.id !== id));
        alert("Panne supprimée !");
      } catch (err) {
        console.error(err);
        setError("Erreur lors de la suppression");
      }
    }
  };

  // Recherche + filtre
  const filteredPannes = pannes.filter(panne => {
    const matchesSearch = !searchTerm ||
      Object.values(panne).some(value =>
        value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );
    const matchesStatus = !filterStatus || panne.statut === filterStatus;
    const matchesDepartement = !filterDepartement || panne.departement === filterDepartement;
    return matchesSearch && matchesStatus && matchesDepartement;
  });

  // CSS priorité - badges blancs
  const getPriorityClass = (priorite) => {
    return 'bg-white text-gray-800 border border-gray-300';
  };

  // CSS statut - badges blancs
  const getStatusClass = (statut) => {
    return 'bg-white text-gray-800 border border-gray-300';
  };

  return (
    <div className="bg-gray-100 min-h-screen p-4 sm:p-6 lg:p-8">
      {/* --- HEADER --- */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-600 mb-4 sm:mb-0">
          <span className="text-yellow-500 mr-2"></span>
          Gestion des Pannes
        </h1>
        <button
          className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-colors duration-200 flex items-center"
          onClick={openAddModal}
        >
          <span className="text-2xl mr-2"></span>
          Nouvelle panne
        </button>
      </div>

      {/* --- Toolbar --- */}
      <div className="flex flex-col lg:flex-row justify-between items-center mb-6 space-y-4 lg:space-y-0 lg:space-x-4">
        <div className="w-full lg:w-1/2 xl:w-1/3">
          <input
            type="text"
            placeholder="Rechercher une panne..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
          />
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            <option value="">Tous les statuts</option>
            {statutsDisponibles.map(statut => (
              <option key={statut} value={statut}>{statut}</option>
            ))}
          </select>
          <select
            value={filterDepartement}
            onChange={(e) => setFilterDepartement(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            <option value="">Tous les départements</option>
            {departements.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>
      </div>

      {/* --- Message d'erreur --- */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* --- Tableau --- */}
      <div className="bg-white shadow-lg rounded-lg overflow-x-auto">
        {loading ? (
          <div className="p-4 text-center text-gray-500">Chargement...</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-600">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">IDENTIFIANT</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Matériel</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Employé</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Département</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Date de panne</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Priorité</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Technicien</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPannes.length === 0 ? (
                <tr>
                  <td colSpan="11" className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                    Aucune panne trouvée
                  </td>
                </tr>
              ) : (
                filteredPannes.map((panne, index) => (
                  <tr key={panne.id || `panne-${index}`} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{panne.identifiant}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{panne.materiel}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{panne.taper}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{panne.employe}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{panne.departement}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs overflow-hidden text-ellipsis">{panne.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {panne.panne_de_dattes ? new Date(panne.panne_de_dattes).toLocaleDateString('fr-FR') : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityClass(panne.priorite)}`}>
                        {panne.priorite}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(panne.statut)}`}>
                        {panne.statut || 'Nouveau'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{panne.technicien || 'Non assigné'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button
                        className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded-md transition-colors duration-150"
                        onClick={() => openEditModal(panne)}
                        title="Modifier"
                      >
                        Modifier
                      </button>
                      <button
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md transition-colors duration-150"
                        onClick={() => deletePanne(panne.id, panne.identifiant)}
                        title="Supprimer"
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* --- Modal --- */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl transform transition-all scale-100 opacity-100 max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center pb-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-600">{editMode ? 'Modifier la panne' : 'Nouvelle panne'}</h2>
              <button className="text-gray-400 hover:text-gray-600 transition-colors duration-200 text-3xl" onClick={closeModal}>×</button>
            </div>
            <div className="py-4">
              <form onSubmit={savePanne}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="mb-4">
                    <label className="block text-gray-600 text-sm font-bold mb-2">Identifiant *</label>
                    <input
                      type="text"
                      name="identifiant"
                      value={currentPanne.identifiant}
                      onChange={handleInputChange}
                      required
                      readOnly
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-gray-500 bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                  
                  {/* Matériel avec toggle */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-gray-600 text-sm font-bold">Matériel *</label>
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => {
                            setMaterielMode('selection');
                            setCurrentPanne(prev => ({ ...prev, materiel: '' }));
                          }}
                          className={`px-2 py-1 text-xs rounded ${materielMode === 'selection' ? 'bg-gray-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                        >
                          Sélection
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setMaterielMode('manuel');
                            setCurrentPanne(prev => ({ ...prev, materiel: '' }));
                          }}
                          className={`px-2 py-1 text-xs rounded ${materielMode === 'manuel' ? 'bg-gray-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                        >
                          Manuel
                        </button>
                      </div>
                    </div>
                    {materielMode === 'selection' ? (
                      <select
                        name="materiel"
                        value={currentPanne.materiel}
                        onChange={handleInputChange}
                        required
                        className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-gray-500"
                      >
                        <option value="">Sélectionner un matériel</option>
                        {materiels.map(materiel => (
                          <option key={materiel} value={materiel}>{materiel}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        name="materiel"
                        value={currentPanne.materiel}
                        onChange={handleInputChange}
                        required
                        placeholder="Entrer le matériel"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-gray-500"
                      />
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Type avec toggle */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-gray-600 text-sm font-bold">Type *</label>
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => {
                            setTypeMode('selection');
                            setCurrentPanne(prev => ({ ...prev, taper: '' }));
                          }}
                          className={`px-2 py-1 text-xs rounded ${typeMode === 'selection' ? 'bg-gray-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                        >
                          Sélection
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setTypeMode('manuel');
                            setCurrentPanne(prev => ({ ...prev, taper: '' }));
                          }}
                          className={`px-2 py-1 text-xs rounded ${typeMode === 'manuel' ? 'bg-gray-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                        >
                          Manuel
                        </button>
                      </div>
                    </div>
                    {typeMode === 'selection' ? (
                      <select
                        name="taper"
                        value={currentPanne.taper}
                        onChange={handleInputChange}
                        required
                        className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-gray-500"
                      >
                        <option value="">Sélectionner un type</option>
                        {typesMateriel.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        name="taper"
                        value={currentPanne.taper}
                        onChange={handleInputChange}
                        required
                        placeholder="Entrer le type"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-gray-500"
                      />
                    )}
                  </div>

                  <div className="mb-4">
                    <label className="block text-gray-600 text-sm font-bold mb-2">Employé *</label>
                    <input
                      type="text"
                      name="employe"
                      value={currentPanne.employe}
                      onChange={handleInputChange}
                      required
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-gray-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="mb-4">
                    <label className="block text-gray-600 text-sm font-bold mb-2">Département *</label>
                    <select
                      name="departement"
                      value={currentPanne.departement}
                      onChange={handleInputChange}
                      required
                      className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                      <option value="">Sélectionner un département</option>
                      {departements.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-600 text-sm font-bold mb-2">Date de panne *</label>
                    <input
                      type="date"
                      name="panne_de_dattes"
                      value={currentPanne.panne_de_dattes}
                      onChange={handleInputChange}
                      required
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-gray-500"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-600 text-sm font-bold mb-2">Description *</label>
                  <textarea
                    name="description"
                    value={currentPanne.description}
                    onChange={handleInputChange}
                    required
                    rows="3"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-gray-500"
                  ></textarea>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Priorité avec toggle */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-gray-600 text-sm font-bold">Priorité *</label>
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => {
                            setPrioriteMode('selection');
                            setCurrentPanne(prev => ({ ...prev, priorite: 'Moyenne' }));
                          }}
                          className={`px-2 py-1 text-xs rounded ${prioriteMode === 'selection' ? 'bg-gray-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                        >
                          Sélection
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setPrioriteMode('manuel');
                            setCurrentPanne(prev => ({ ...prev, priorite: '' }));
                          }}
                          className={`px-2 py-1 text-xs rounded ${prioriteMode === 'manuel' ? 'bg-gray-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                        >
                          Manuel
                        </button>
                      </div>
                    </div>
                    {prioriteMode === 'selection' ? (
                      <select
                        name="priorite"
                        value={currentPanne.priorite}
                        onChange={handleInputChange}
                        required
                        className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-gray-500"
                      >
                        {priorites.map(priorite => (
                          <option key={priorite} value={priorite}>{priorite}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        name="priorite"
                        value={currentPanne.priorite}
                        onChange={handleInputChange}
                        required
                        placeholder="Entrer la priorité"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-gray-500"
                      />
                    )}
                  </div>

                  {/* Statut avec toggle */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-gray-600 text-sm font-bold">Statut *</label>
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => {
                            setStatutMode('selection');
                            setCurrentPanne(prev => ({ ...prev, statut: 'Nouveau' }));
                          }}
                          className={`px-2 py-1 text-xs rounded ${statutMode === 'selection' ? 'bg-gray-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                        >
                          Sélection
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setStatutMode('manuel');
                            setCurrentPanne(prev => ({ ...prev, statut: '' }));
                          }}
                          className={`px-2 py-1 text-xs rounded ${statutMode === 'manuel' ? 'bg-gray-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                        >
                          Manuel
                        </button>
                      </div>
                    </div>
                    {statutMode === 'selection' ? (
                      <select
                        name="statut"
                        value={currentPanne.statut}
                        onChange={handleInputChange}
                        required
                        className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-gray-500"
                      >
                        {statutsDisponibles.map(statut => (
                          <option key={statut} value={statut}>{statut}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        name="statut"
                        value={currentPanne.statut}
                        onChange={handleInputChange}
                        required
                        placeholder="Entrer le statut"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-gray-500"
                      />
                    )}
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-gray-600 text-sm font-bold mb-2">Technicien assigné</label>
                  <input
                    type="text"
                    name="technicien"
                    value={currentPanne.technicien}
                    onChange={handleInputChange}
                    placeholder="Entrer le nom du technicien"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-gray-500"
                  />
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg transition-colors duration-200"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
                  >
                    {editMode ? 'Modifier' : 'Créer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionPannes;