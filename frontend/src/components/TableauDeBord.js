import React, { useState, useMemo, useEffect } from 'react';

const TableauDeBord = () => {
  // États
  const [filtreActif, setFiltreActif] = useState('tous');
  const [materiels, setMateriels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Récupération des données depuis l'API
  useEffect(() => {
    const fetchMateriels = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('http://localhost:5000/api/tableau-bord/materiels');
        
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Vérifier que data est un tableau
        if (!Array.isArray(data)) {
          throw new Error('Format de données invalide');
        }
        
        setMateriels(data);
      } catch (err) {
        console.error('Erreur lors de la récupération des matériels:', err);
        setError(err.message);
        setMateriels([]); // Définir un tableau vide en cas d'erreur
      } finally {
        setLoading(false);
      }
    };

    fetchMateriels();
  }, []); // Dépendances vides pour ne s'exécuter qu'au montage

  // Calcul des statistiques basé sur les données réelles avec vérifications
  const stats = useMemo(() => {
    if (!Array.isArray(materiels) || materiels.length === 0) {
      return {
        totalMateriels: 0,
        fonctionnels: 0,
        enPanne: 0,
        enMaintenance: 0
      };
    }

    const totalMateriels = materiels.length;
    const fonctionnels = materiels.filter(m => m && m.etat === 'Fonctionnel').length;
    const enPanne = materiels.filter(m => m && m.etat === 'En panne').length;
    const enMaintenance = materiels.filter(m => m && m.etat === 'En maintenance').length;
    
    return {
      totalMateriels,
      fonctionnels,
      enPanne,
      enMaintenance
    };
  }, [materiels]);

  // Filtrage des matériels avec une vérification de sécurité
  const materielsFiltres = useMemo(() => {
    if (!Array.isArray(materiels) || materiels.length === 0) {
      return [];
    }

    switch (filtreActif) {
      case 'fonctionnels':
        return materiels.filter(m => m && m.etat === 'Fonctionnel');
      case 'en-panne':
        return materiels.filter(m => m && m.etat === 'En panne');
      case 'en-maintenance':
        return materiels.filter(m => m && m.etat === 'En maintenance');
      default:
        return materiels;
    }
  }, [materiels, filtreActif]);

  // Fonction pour obtenir la couleur du badge selon l'état
  const getBadgeColor = (etat) => {
    if (!etat) return 'bg-gray-100 text-gray-800';
    
    switch (etat) {
      case 'Fonctionnel':
        return 'bg-green-100 text-green-800';
      case 'En panne':
        return 'bg-red-100 text-red-800';
      case 'En maintenance':
        return 'bg-orange-100 text-orange-800';
      case 'Hors service':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Options de filtre - calculées avec useMemo pour éviter les re-rendus
  const filtres = useMemo(() => [
    { id: 'tous', label: 'Tous les matériels', count: stats.totalMateriels },
    { id: 'fonctionnels', label: 'Fonctionnels', count: stats.fonctionnels },
    { id: 'en-panne', label: 'En panne', count: stats.enPanne },
    { id: 'en-maintenance', label: 'En maintenance', count: stats.enMaintenance }
  ], [stats]);

  // État de chargement
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
          <span className="ml-3 text-gray-600">Chargement des données...</span>
        </div>
      </div>
    );
  }

  // État d'erreur
  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-500 text-2xl font-bold">✕</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Erreur de chargement</h3>
            <p className="text-gray-600">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center space-x-3 mb-6">
        <h2 className="text-xl font-bold text-gray-900">Tableau de bord</h2>
      </div>

      {/* Statistiques cliquables */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div 
          onClick={() => setFiltreActif('tous')}
          className={`bg-gradient-to-r from-gray-500 to-gray-600 p-6 rounded-lg text-white cursor-pointer transform transition-transform hover:scale-105 ${
            filtreActif === 'tous' ? 'ring-4 ring-gray-300' : ''
          }`}
        >
          <h3 className="text-3xl font-bold mb-2">{stats.totalMateriels}</h3>
          <p className="text-gray-100">Total matériels</p>
        </div>
        
        <div 
          onClick={() => setFiltreActif('fonctionnels')}
          className={`bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-lg text-white cursor-pointer transform transition-transform hover:scale-105 ${
            filtreActif === 'fonctionnels' ? 'ring-4 ring-green-300' : ''
          }`}
        >
          <h3 className="text-3xl font-bold mb-2">{stats.fonctionnels}</h3>
          <p className="text-green-100">Fonctionnels</p>
        </div>
        
        <div 
          onClick={() => setFiltreActif('en-panne')}
          className={`bg-gradient-to-r from-red-500 to-red-600 p-6 rounded-lg text-white cursor-pointer transform transition-transform hover:scale-105 ${
            filtreActif === 'en-panne' ? 'ring-4 ring-red-300' : ''
          }`}
        >
          <h3 className="text-3xl font-bold mb-2">{stats.enPanne}</h3>
          <p className="text-red-100">En panne</p>
        </div>
        
        <div 
          onClick={() => setFiltreActif('en-maintenance')}
          className={`bg-gradient-to-r from-orange-500 to-orange-600 p-6 rounded-lg text-white cursor-pointer transform transition-transform hover:scale-105 ${
            filtreActif === 'en-maintenance' ? 'ring-4 ring-orange-300' : ''
          }`}
        >
          <h3 className="text-3xl font-bold mb-2">{stats.enMaintenance}</h3>
          <p className="text-orange-100">En maintenance</p>
        </div>
      </div>

      {/* Section des filtres */}
      <div className="flex flex-wrap items-center gap-3 mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">Filtrer par :</span>
        </div>
        
        {filtres.map((filtre) => (
          <button
            key={filtre.id}
            onClick={() => setFiltreActif(filtre.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filtreActif === filtre.id
                ? 'bg-gray-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-300'
            }`}
          >
            {filtre.label} ({filtre.count})
          </button>
        ))}
        
        {filtreActif !== 'tous' && (
          <button
            onClick={() => setFiltreActif('tous')}
            className="flex items-center space-x-1 px-3 py-2 text-red-600 hover:bg-red-50 rounded-full text-sm"
          >
            <span>✕ Réinitialiser</span>
          </button>
        )}
      </div>

      {/* Tableau des matériels filtrés */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {filtreActif === 'tous' ? 'Tous les matériels' : 
             filtreActif === 'fonctionnels' ? 'Matériels fonctionnels' :
             filtreActif === 'en-panne' ? 'Matériels en panne' :
             'Matériels en maintenance'}
          </h3>
          <span className="text-sm text-gray-500">
            {materielsFiltres.length} résultat{materielsFiltres.length > 1 ? 's' : ''}
          </span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-600 text-white">
                <th className="px-6 py-3 text-left font-semibold">Code</th>
                <th className="px-6 py-3 text-left font-semibold">Type</th>
                <th className="px-6 py-3 text-left font-semibold">Marque</th>
                <th className="px-6 py-3 text-left font-semibold">Modèle</th>
                <th className="px-6 py-3 text-left font-semibold">N° Série</th>
                <th className="px-6 py-3 text-left font-semibold">Employé</th>
                <th className="px-6 py-3 text-left font-semibold">Département</th>
                <th className="px-6 py-3 text-left font-semibold">État</th>
              </tr>
            </thead>
            <tbody>
              {materielsFiltres.length > 0 ? (
                materielsFiltres.map((materiel) => (
                  <tr key={`materiel-${materiel.id || materiel.code}`} className={materielsFiltres.indexOf(materiel) % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="px-6 py-4 text-gray-900 font-medium">{materiel.code || 'N/A'}</td>
                    <td className="px-6 py-4 text-gray-600">{materiel.type || 'N/A'}</td>
                    <td className="px-6 py-4 text-gray-600">{materiel.marque || 'N/A'}</td>
                    <td className="px-6 py-4 text-gray-600">{materiel.modele || 'N/A'}</td>
                    <td className="px-6 py-4 text-gray-600">{materiel.numero_serie || 'N/A'}</td>
                    <td className="px-6 py-4 text-gray-600">{materiel.employe || 'N/A'}</td>
                    <td className="px-6 py-4 text-gray-600">{materiel.departement || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getBadgeColor(materiel.etat)}`}>
                        {materiel.etat || 'Inconnu'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr key="no-data">
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                    Aucun matériel trouvé pour ce filtre
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TableauDeBord;