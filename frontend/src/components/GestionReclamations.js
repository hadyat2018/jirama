import React, { useState, useEffect } from 'react';

const GestionReclamations = () => {
  const [reclamations, setReclamations] = useState([]);
  const [filteredReclamations, setFilteredReclamations] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingReclamation, setEditingReclamation] = useState(null);
  const [viewingReclamation, setViewingReclamation] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatut, setFilterStatut] = useState('');
  const [filterPriorite, setFilterPriorite] = useState('');
  const [filterDepartement, setFilterDepartement] = useState('');
  const [loading, setLoading] = useState(false);

  const [modeMateriels, setModeMateriels] = useState('selection');
  const [modeTypes, setModeTypes] = useState('selection');
  const [modePriorite, setModePriorite] = useState('selection');
  const [modeStatut, setModeStatut] = useState('selection');
  const [modeDepartement, setModeDepartement] = useState('selection');

  const [typesReclamations] = useState([
    'Panne matérielle',
    'Problème logiciel',
    'Maintenance préventive',
    'Installation',
    'Configuration réseau',
    'Récupération de données'
  ]);

  const [materiels] = useState([
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
    'processeur',
    'ordinateur',
    'écran',
    'souris',
    'clavier',
    'Autres'
  ]);

  const [departements] = useState([
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
    'Contentieux',
    'SCC',
    'SAPPRO',
    'SECC',
    'SSI'
  ]);

  const [formData, setFormData] = useState({
    numero: '',
    date_reclamation: new Date().toISOString().split('T')[0],
    materiel_concerne: '',
    employe_demandeur: '',
    departement: '',
    type_reclamation: '',
    priorite: 'Moyenne',
    statut: 'Nouveau',
    technicien_assigne: '',
    description_probleme: ''
  });

  const priorites = ['Basse', 'Moyenne', 'Haute', 'Critique'];
  const statuts = ['Nouveau', 'En attente', 'En cours', 'Terminé', 'Annulé'];

  useEffect(() => {
    fetchReclamations();
  }, []);

  useEffect(() => {
    filterReclamations();
  }, [reclamations, searchTerm, filterStatut, filterPriorite, filterDepartement]);

  const fetchReclamations = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/reclamations");
      const data = await response.json();
      setReclamations(data);
    } catch (error) {
      console.error("Erreur lors du chargement:", error);
      alert("Erreur lors du chargement des réclamations");
    }
    setLoading(false);
  };

  const filterReclamations = () => {
    let filtered = reclamations;

    if (searchTerm) {
      filtered = filtered.filter(rec =>
        rec.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rec.materiel_concerne.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rec.employe_demandeur.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (rec.departement && rec.departement.toLowerCase().includes(searchTerm.toLowerCase())) ||
        rec.description_probleme.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatut) {
      filtered = filtered.filter(rec => rec.statut === filterStatut);
    }

    if (filterPriorite) {
      filtered = filtered.filter(rec => rec.priorite === filterPriorite);
    }

    if (filterDepartement) {
      filtered = filtered.filter(rec => rec.departement === filterDepartement);
    }

    setFilteredReclamations(filtered);
  };

  const generateReclamationNumber = () => {
    const count = reclamations.length + 1;
    return `Rec ${count.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.materiel_concerne || !formData.employe_demandeur || !formData.departement || 
        !formData.type_reclamation || !formData.description_probleme || !formData.technicien_assigne) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const newReclamation = {
      ...formData,
      numero: formData.numero || generateReclamationNumber(),
      date_creation: new Date().toISOString(),
      date_resolution: formData.statut === 'Terminé' ? new Date().toISOString() : null
    };

    try {
      if (editingReclamation) {
        await fetch(`http://localhost:5000/api/reclamations/${editingReclamation.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newReclamation),
        });
        setReclamations(reclamations.map(rec => 
          rec.id === editingReclamation.id 
            ? { ...newReclamation, id: editingReclamation.id } 
            : rec
        ));
        alert("Réclamation modifiée avec succès");
      } else {
        const response = await fetch("http://localhost:5000/api/reclamations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newReclamation),
        });
        const saved = await response.json();
        setReclamations([...reclamations, saved]);
        alert("Réclamation créée avec succès");
        
        sendEmail(newReclamation);
      }
      resetForm();
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur lors de la sauvegarde");
    }
  };

  const sendEmail = (reclamation) => {
    const emailSubject = encodeURIComponent(`Nouvelle Réclamation - ${reclamation.numero}`);
    const emailBody = encodeURIComponent(
      `Nouvelle réclamation enregistrée:\n\n` +
      `Numéro: ${reclamation.numero}\n` +
      `Date: ${new Date(reclamation.date_reclamation).toLocaleDateString('fr-FR')}\n` +
      `Matériel concerné: ${reclamation.materiel_concerne}\n` +
      `Employé demandeur: ${reclamation.employe_demandeur}\n` +
      `Département: ${reclamation.departement}\n` +
      `Type de réclamation: ${reclamation.type_reclamation}\n` +
      `Priorité: ${reclamation.priorite}\n` +
      `Statut: ${reclamation.statut}\n` +
      `Technicien: ${reclamation.technicien_assigne}\n` +
      `Description du problème: ${reclamation.description_probleme}\n`
    );
    
    const emailRecipients = 'hadyatali246@gmail.com,tsamuel@jirama.mg,michel.miladera@jirama.mg,jiramaoumou@gmail.com';
    window.location.href = `mailto:${emailRecipients}?subject=${emailSubject}&body=${emailBody}`;
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette réclamation ?')) {
      try {
        await fetch(`http://localhost:5000/api/reclamations/${id}`, { method: "DELETE" });
        setReclamations(reclamations.filter(rec => rec.id !== id));
        alert("Réclamation supprimée avec succès");
      } catch (error) {
        console.error("Erreur:", error);
        alert("Erreur lors de la suppression");
      }
    }
  };

  const handleEdit = (reclamation) => {
    setEditingReclamation(reclamation);
    setFormData({
      numero: reclamation.numero,
      date_reclamation: new Date(reclamation.date_reclamation).toISOString().split('T')[0],
      materiel_concerne: reclamation.materiel_concerne,
      employe_demandeur: reclamation.employe_demandeur,
      departement: reclamation.departement || '',
      type_reclamation: reclamation.type_reclamation,
      priorite: reclamation.priorite,
      statut: reclamation.statut,
      technicien_assigne: reclamation.technicien_assigne || '',
      description_probleme: reclamation.description_probleme
    });
    setShowModal(true);
  };

  const handleView = (reclamation) => {
    setViewingReclamation(reclamation);
    setShowViewModal(true);
  };

  const resetForm = () => {
    setFormData({
      numero: '',
      date_reclamation: new Date().toISOString().split('T')[0],
      materiel_concerne: '',
      employe_demandeur: '',
      departement: '',
      type_reclamation: '',
      priorite: 'Moyenne',
      statut: 'Nouveau',
      technicien_assigne: '',
      description_probleme: ''
    });
    setEditingReclamation(null);
    setShowModal(false);
    setModeMateriels('selection');
    setModeTypes('selection');
    setModePriorite('selection');
    setModeStatut('selection');
    setModeDepartement('selection');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Critique': return 'bg-red-100 text-red-800 border-red-200';
      case 'Haute': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Moyenne': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Basse': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Nouveau': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Terminé': return 'bg-green-100 text-green-800 border-green-200';
      case 'En cours': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'En attente': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Annulé': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 p-6" style={{ fontFamily: "'Times New Roman', serif" }}>
      <div className="bg-white rounded-2xl p-8 mb-8 shadow-xl border border-gray-200">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-600 to-gray-700 bg-clip-text text-transparent mb-2">
          Gestion des Réclamations
        </h1>
        <p className="text-gray-600 text-lg">
          Suivi et traitement des demandes de dépannage
        </p>
      </div>

      <div className="bg-white rounded-2xl p-6 mb-8 shadow-lg border border-gray-100">
        <div className="flex flex-wrap gap-4 items-center">
          <button 
            onClick={() => setShowModal(true)}
            className="bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-300 hover:border-gray-400 px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
          >
            + Nouvelle réclamation
          </button>

          <div className="relative flex-1 min-w-64">
            <input 
              type="text" 
              placeholder="Rechercher une réclamation..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
            />
          </div>

          <select 
            value={filterStatut} 
            onChange={(e) => setFilterStatut(e.target.value)}
            className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent bg-gray-50 hover:bg-white transition-all duration-200"
          >
            <option value="">Tous les statuts</option>
            {statuts.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <select 
            value={filterPriorite} 
            onChange={(e) => setFilterPriorite(e.target.value)}
            className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent bg-gray-50 hover:bg-white transition-all duration-200"
          >
            <option value="">Toutes les priorités</option>
            {priorites.map(p => <option key={p} value={p}>{p}</option>)}
          </select>

          <select 
            value={filterDepartement} 
            onChange={(e) => setFilterDepartement(e.target.value)}
            className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent bg-gray-50 hover:bg-white transition-all duration-200"
          >
            <option value="">Tous les départements</option>
            {departements.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-600 to-gray-700">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">N° Réclamation</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Matériel</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Employé</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Département</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Type</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Description</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Priorité</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Statut</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Technicien</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-white">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="11" className="px-6 py-12 text-center text-gray-500">
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin w-5 h-5 border-2 border-gray-500 border-t-transparent rounded-full"></div>
                      Chargement...
                    </div>
                  </td>
                </tr>
              ) : filteredReclamations.length === 0 ? (
                <tr>
                  <td colSpan="11" className="px-6 py-12 text-center text-gray-500">
                    Aucune réclamation trouvée
                  </td>
                </tr>
              ) : (
                filteredReclamations.map((rec) => (
                  <tr key={rec.id} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-6 py-4 font-medium text-gray-900">{rec.numero}</td>
                    <td className="px-6 py-4 text-gray-600">{formatDate(rec.date_reclamation)}</td>
                    <td className="px-6 py-4 text-gray-800 font-medium">{rec.materiel_concerne}</td>
                    <td className="px-6 py-4 text-gray-600">{rec.employe_demandeur}</td>
                    <td className="px-6 py-4 text-gray-600">{rec.departement || '-'}</td>
                    <td className="px-6 py-4 text-gray-600">{rec.type_reclamation}</td>
                    <td className="px-6 py-4 text-gray-600 max-w-xs truncate">{rec.description_probleme}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(rec.priorite)}`}>
                        {rec.priorite}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(rec.statut)}`}>
                        {rec.statut}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 font-medium">{rec.technicien_assigne}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 justify-center">
                        <button 
                          onClick={() => handleView(rec)}
                          className="px-3 py-1 text-sm text-green-600 hover:bg-green-100 rounded-lg transition-colors duration-200 font-medium"
                        >
                          Voir
                        </button>
                        <button 
                          onClick={() => handleEdit(rec)}
                          className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200 font-medium"
                        >
                          Modifier
                        </button>
                        <button 
                          onClick={() => handleDelete(rec.id)}
                          className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-100 rounded-lg transition-colors duration-200 font-medium"
                        >
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingReclamation ? "Modifier la réclamation" : "Nouvelle réclamation"}
                </h2>
                <button 
                  onClick={resetForm}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors duration-200 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Numéro (auto-généré)
                  </label>
                  <input 
                    type="text" 
                    placeholder={editingReclamation ? formData.numero : generateReclamationNumber()}
                    value={formData.numero}
                    readOnly
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-600 cursor-not-allowed"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date de réclamation
                  </label>
                  <input 
                    type="date" 
                    value={formData.date_reclamation}
                    onChange={(e) => setFormData({ ...formData, date_reclamation: e.target.value })} 
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Matériel concerné *
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setModeMateriels('selection')}
                      className={`px-3 py-1 text-xs rounded-lg transition-all ${
                        modeMateriels === 'selection' 
                          ? 'bg-gray-600 text-white' 
                          : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                      }`}
                    >
                      Sélection
                    </button>
                    <button
                      type="button"
                      onClick={() => setModeMateriels('manuel')}
                      className={`px-3 py-1 text-xs rounded-lg transition-all ${
                        modeMateriels === 'manuel' 
                          ? 'bg-gray-600 text-white' 
                          : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                      }`}
                    >
                      Manuel
                    </button>
                  </div>
                </div>
                {modeMateriels === 'selection' ? (
                  <select 
                    value={formData.materiel_concerne}
                    onChange={(e) => setFormData({ ...formData, materiel_concerne: e.target.value })} 
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="">Sélectionner le matériel...</option>
                    {materiels.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                ) : (
                  <input 
                    type="text" 
                    placeholder="Saisir le matériel manuellement" 
                    value={formData.materiel_concerne}
                    onChange={(e) => setFormData({ ...formData, materiel_concerne: e.target.value })} 
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200"
                  />
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Employé demandeur *
                  </label>
                  <input 
                    type="text" 
                    placeholder="Nom de l'employé" 
                    value={formData.employe_demandeur}
                    onChange={(e) => setFormData({ ...formData, employe_demandeur: e.target.value })} 
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Département *
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setModeDepartement('selection')}
                        className={`px-3 py-1 text-xs rounded-lg transition-all ${
                          modeDepartement === 'selection' 
                            ? 'bg-gray-600 text-white' 
                            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                        }`}
                      >
                        Sélection
                      </button>
                      <button
                        type="button"
                        onClick={() => setModeDepartement('manuel')}
                        className={`px-3 py-1 text-xs rounded-lg transition-all ${
                          modeDepartement === 'manuel' 
                            ? 'bg-gray-600 text-white' 
                            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                        }`}
                      >
                        Manuel
                      </button>
                    </div>
                  </div>
                  {modeDepartement === 'selection' ? (
                    <select 
                      value={formData.departement}
                      onChange={(e) => setFormData({ ...formData, departement: e.target.value })} 
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="">Sélectionner le département...</option>
                      {departements.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  ) : (
                    <input 
                      type="text" 
                      placeholder="Saisir le département manuellement" 
                      value={formData.departement}
                      onChange={(e) => setFormData({ ...formData, departement: e.target.value })} 
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200"
                    />
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Type de réclamation *
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setModeTypes('selection')}
                      className={`px-3 py-1 text-xs rounded-lg transition-all ${
                        modeTypes === 'selection' 
                          ? 'bg-gray-600 text-white' 
                          : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                      }`}
                    >
                      Sélection
                    </button>
                    <button
                      type="button"
                      onClick={() => setModeTypes('manuel')}
                      className={`px-3 py-1 text-xs rounded-lg transition-all ${
                        modeTypes === 'manuel' 
                          ? 'bg-gray-600 text-white' 
                          : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                      }`}
                    >
                      Manuel
                    </button>
                  </div>
                </div>
                {modeTypes === 'selection' ? (
                  <select 
                    value={formData.type_reclamation}
                    onChange={(e) => setFormData({ ...formData, type_reclamation: e.target.value })} 
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="">Sélectionner le type...</option>
                    {typesReclamations.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                ) : (
                  <input 
                    type="text" 
                    placeholder="Saisir le type manuellement" 
                    value={formData.type_reclamation}
                    onChange={(e) => setFormData({ ...formData, type_reclamation: e.target.value })} 
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200"
                  />
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Priorité *
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setModePriorite('selection')}
                        className={`px-3 py-1 text-xs rounded-lg transition-all ${
                          modePriorite === 'selection' 
                            ? 'bg-gray-600 text-white' 
                            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                        }`}
                      >
                        Sélection
                      </button>
                      <button
                        type="button"
                        onClick={() => setModePriorite('manuel')}
                        className={`px-3 py-1 text-xs rounded-lg transition-all ${
                          modePriorite === 'manuel' 
                            ? 'bg-gray-600 text-white' 
                            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                        }`}
                      >
                        Manuel
                      </button>
                    </div>
                  </div>
                  {modePriorite === 'selection' ? (
                    <select 
                      value={formData.priorite}
                      onChange={(e) => setFormData({ ...formData, priorite: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200"
                    >
                      {priorites.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  ) : (
                    <input 
                      type="text" 
                      placeholder="Saisir la priorité" 
                      value={formData.priorite}
                      onChange={(e) => setFormData({ ...formData, priorite: e.target.value })} 
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200"
                    />
                  )}
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Statut *
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setModeStatut('selection')}
                        className={`px-3 py-1 text-xs rounded-lg transition-all ${
                          modeStatut === 'selection' 
                            ? 'bg-gray-600 text-white' 
                            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                        }`}
                      >
                        Sélection
                      </button>
                      <button
                        type="button"
                        onClick={() => setModeStatut('manuel')}
                        className={`px-3 py-1 text-xs rounded-lg transition-all ${
                          modeStatut === 'manuel' 
                            ? 'bg-gray-600 text-white' 
                            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                        }`}
                      >
                        Manuel
                      </button>
                    </div>
                  </div>
                  {modeStatut === 'selection' ? (
                    <select 
                      value={formData.statut}
                      onChange={(e) => setFormData({ ...formData, statut: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200"
                    >
                      {statuts.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  ) : (
                    <input 
                      type="text" 
                      placeholder="Saisir le statut" 
                      value={formData.statut}
                      onChange={(e) => setFormData({ ...formData, statut: e.target.value })} 
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200"
                    />
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Technicien *
                </label>
                <input 
                  type="text" 
                  placeholder="Nom du technicien"
                  value={formData.technicien_assigne}
                  onChange={(e) => setFormData({ ...formData, technicien_assigne: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description du problème *
                </label>
                <textarea 
                  placeholder="Décrivez le problème rencontré en détail..." 
                  value={formData.description_probleme}
                  onChange={(e) => setFormData({ ...formData, description_probleme: e.target.value })} 
                  required
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200 resize-none"
                />
              </div>

              <div className="flex gap-4 pt-4 border-t border-gray-200">
                <button 
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white py-3 px-6 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  {editingReclamation ? "Modifier" : "Créer"}
                </button>
                <button 
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-6 rounded-xl font-medium transition-all duration-200"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showViewModal && viewingReclamation && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
            <div className="bg-gradient-to-r from-gray-600 to-gray-700 p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Détails de la réclamation</h2>
                <button 
                  onClick={() => setShowViewModal(false)}
                  className="p-2 hover:bg-white/20 rounded-xl transition-colors duration-200 text-white text-2xl"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-sm font-medium text-gray-500 mb-1">Numéro</p>
                  <p className="text-lg font-semibold text-gray-900">{viewingReclamation.numero}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-sm font-medium text-gray-500 mb-1">Date</p>
                  <p className="text-lg font-semibold text-gray-900">{formatDate(viewingReclamation.date_reclamation)}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-sm font-medium text-gray-500 mb-1">Matériel concerné</p>
                  <p className="text-lg font-semibold text-gray-900">{viewingReclamation.materiel_concerne}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-sm font-medium text-gray-500 mb-1">Employé demandeur</p>
                  <p className="text-lg font-semibold text-gray-900">{viewingReclamation.employe_demandeur}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-sm font-medium text-gray-500 mb-1">Département</p>
                  <p className="text-lg font-semibold text-gray-900">{viewingReclamation.departement || '-'}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-sm font-medium text-gray-500 mb-1">Type de réclamation</p>
                  <p className="text-lg font-semibold text-gray-900">{viewingReclamation.type_reclamation}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-sm font-medium text-gray-500 mb-1">Technicien</p>
                  <p className="text-lg font-semibold text-gray-900">{viewingReclamation.technicien_assigne}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-sm font-medium text-gray-500 mb-1">Priorité</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(viewingReclamation.priorite)}`}>
                    {viewingReclamation.priorite}
                  </span>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl">
                <p className="text-sm font-medium text-gray-500 mb-1">Statut</p>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(viewingReclamation.statut)}`}>
                  {viewingReclamation.statut}
                </span>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl">
                <p className="text-sm font-medium text-gray-500 mb-2">Description du problème</p>
                <p className="text-gray-900 leading-relaxed">{viewingReclamation.description_probleme}</p>
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-200">
                <button 
                  onClick={() => setShowViewModal(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-6 rounded-xl font-medium transition-all duration-200"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionReclamations;