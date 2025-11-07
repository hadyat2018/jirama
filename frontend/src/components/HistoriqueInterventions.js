import React, { useEffect, useState } from 'react';

const HistoriqueInterventions = () => {
  // ✅ États
  const [loading, setLoading] = useState(false);
  const [interventions, setInterventions] = useState([]);
  const [filteredInterventions, setFilteredInterventions] = useState([]);
  const [error, setError] = useState(null);
  const [editingIntervention, setEditingIntervention] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    date_intervention: '',
    materiel: '',
    type_intervention: '',
    technicien: '',
    duree: '',
    statut: 'Terminé',
    cout: 0,
    description: '',
    pieces_utilisees: ''
  });

  // ✅ Fonction pour formater la date (afficher seulement la date)
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  };

  // ✅ Fonction de recherche
  const handleSearch = (term) => {
    setSearchTerm(term);
    if (!term) {
      setFilteredInterventions(interventions);
      return;
    }

    const filtered = interventions.filter(intervention =>
      intervention.materiel.toLowerCase().includes(term.toLowerCase()) ||
      intervention.type_intervention.toLowerCase().includes(term.toLowerCase()) ||
      intervention.technicien.toLowerCase().includes(term.toLowerCase()) ||
      intervention.statut.toLowerCase().includes(term.toLowerCase()) ||
      intervention.description.toLowerCase().includes(term.toLowerCase()) ||
      intervention.pieces_utilisees.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredInterventions(filtered);
  };

  // ✅ Charger les interventions
  const fetchInterventions = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:5000/api/historique');
      const data = await res.json();
      setInterventions(data);
      setFilteredInterventions(data);
      setLoading(false);
    } catch (error) {
      setError('Erreur lors du chargement des interventions');
      setLoading(false);
    }
  };

  // ✅ Réinitialiser formulaire
  const resetForm = () => {
    setFormData({
      date_intervention: '',
      materiel: '',
      type_intervention: '',
      technicien: '',
      duree: '',
      statut: 'Terminé',
      cout: 0,
      description: '',
      pieces_utilisees: ''
    });
    setEditingIntervention(null);
  };

  // ✅ Ouvrir modal
  const openModal = (intervention = null) => {
    if (intervention) {
      setEditingIntervention(intervention);
      setFormData(intervention);
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  // ✅ Fermer modal
  const closeModal = () => {
    resetForm();
    setShowModal(false);
  };

  // ✅ Soumettre formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let res;
      if (editingIntervention) {
        res = await fetch(`http://localhost:5000/api/historique/${editingIntervention.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      } else {
        res = await fetch('http://localhost:5000/api/historique', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      }

      if (!res.ok) throw new Error('Erreur lors de l\'enregistrement');

      await fetchInterventions();
      closeModal();
    } catch (error) {
      setError(error.message);
    }
  };

  // ✅ Supprimer
  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette intervention ?')) {
      try {
        const res = await fetch(`http://localhost:5000/api/historique/${id}`, {
          method: 'DELETE',
        });
        if (!res.ok) throw new Error('Erreur lors de la suppression');
        await fetchInterventions();
      } catch (error) {
        setError(error.message);
      }
    }
  };

  useEffect(() => {
    fetchInterventions();
  }, []);

  useEffect(() => {
    handleSearch(searchTerm);
  }, [interventions]);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-600"> Historique des interventions</h1>
        <button
          onClick={() => openModal()}
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg shadow"
        >
           Ajouter une intervention
        </button>
      </div>

      {/* ✅ Barre de recherche */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Rechercher par matériel, type, technicien, statut, description..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
        </div>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}
      {loading && <p className="text-gray-500">Chargement...</p>}

      {/* Tableau */}
      <div className="overflow-x-auto bg-white shadow-md rounded-xl">
        <table className="w-full border-collapse">
          <thead className="bg-gray-500 text-white">
            <tr>
              <th className="p-2 border">Date</th>
              <th className="p-2 border">Matériel</th>
              <th className="p-2 border">Type</th>
              <th className="p-2 border">Technicien</th>
              <th className="p-2 border">Durée</th>
              <th className="p-2 border">Statut</th>
              <th className="p-2 border">Coût</th>
              <th className="p-2 border">Pièces utilisées</th>
              <th className="p-2 border">Description</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInterventions.map((i) => (
              <tr key={i.id} className="hover:bg-gray-100">
                <td className="p-2 border">{formatDate(i.date_intervention)}</td>
                <td className="p-2 border">{i.materiel}</td>
                <td className="p-2 border">{i.type_intervention}</td>
                <td className="p-2 border">{i.technicien}</td>
                <td className="p-2 border">{i.duree}</td>
                <td className="p-2 border">{i.statut}</td>
                <td className="p-2 border">{Number(i.cout).toLocaleString()} Ar</td>
                <td className="p-2 border">{i.pieces_utilisees}</td>
                <td className="p-2 border">{i.description}</td>
                <td className="p-2 border text-center">
                  <button
                    onClick={() => openModal(i)}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded-lg mr-2"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDelete(i.id)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg"
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
            {filteredInterventions.length === 0 && !loading && (
              <tr>
                <td colSpan="10" className="text-center p-4 text-gray-500">
                  {searchTerm ? `Aucune intervention trouvée pour "${searchTerm}"` : 'Aucune intervention trouvée'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ✅ Modal d'ajout / modification */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-2xl relative">
            <h2 className="text-xl font-semibold mb-4 text-gray-600">
              {editingIntervention ? ' Modifier intervention' : ' Nouvelle intervention'}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="date"
                value={formData.date_intervention}
                onChange={(e) => setFormData({ ...formData, date_intervention: e.target.value })}
                required
                className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
              />
              <input
                type="text"
                placeholder="Matériel"
                value={formData.materiel}
                onChange={(e) => setFormData({ ...formData, materiel: e.target.value })}
                required
                className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
              />
              <input
                type="text"
                placeholder="Type d'intervention"
                value={formData.type_intervention}
                onChange={(e) => setFormData({ ...formData, type_intervention: e.target.value })}
                required
                className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
              />
              <input
                type="text"
                placeholder="Technicien"
                value={formData.technicien}
                onChange={(e) => setFormData({ ...formData, technicien: e.target.value })}
                required
                className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
              />
              <input
                type="text"
                placeholder="Durée"
                value={formData.duree}
                onChange={(e) => setFormData({ ...formData, duree: e.target.value })}
                className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
              />
              <select
                value={formData.statut}
                onChange={(e) => setFormData({ ...formData, statut: e.target.value })}
                className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
              >
                <option value="Terminé">Terminé</option>
                <option value="En cours">En cours</option>
                <option value="Annulé">Annulé</option>
              </select>
              <input
                type="number"
                placeholder="Coût (en Ariary)"
                value={formData.cout}
                onChange={(e) => setFormData({ ...formData, cout: e.target.value })}
                className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
              />
              <input
                type="text"
                placeholder="Pièces utilisées"
                value={formData.pieces_utilisees}
                onChange={(e) => setFormData({ ...formData, pieces_utilisees: e.target.value })}
                className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
              />
              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="border border-gray-300 rounded-lg p-2 col-span-1 md:col-span-2 focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
              />
              <div className="col-span-1 md:col-span-2 flex justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg mr-2"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
                >
                  {editingIntervention ? 'Mettre à jour' : 'Ajouter'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoriqueInterventions;