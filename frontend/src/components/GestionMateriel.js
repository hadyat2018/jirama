import React, { useState, useEffect } from 'react';

const GestionMateriel = () => {
  const [materiels, setMateriels] = useState([]);
  const [filteredMateriels, setFilteredMateriels] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [currentMateriel, setCurrentMateriel] = useState({
    code: '',
    type: '',
    marque: '',
    modele: '',
    numero_serie: '',
    employe: '',
    departement: '',
    etat: 'Fonctionnel',
    caracteristique: '',
    fonction: ''
  });
  const [loading, setLoading] = useState(false);
  
  const [showImportModal, setShowImportModal] = useState(false);
  const [importData, setImportData] = useState([]);
  const [importPreview, setImportPreview] = useState([]);
  const [importErrors, setImportErrors] = useState([]);
  const [showTextImport, setShowTextImport] = useState(false);
  const [textImportData, setTextImportData] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  const [selectedMateriels, setSelectedMateriels] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  // Nouveaux états pour la saisie manuelle
  const [inputMode, setInputMode] = useState('selection'); // 'selection' ou 'manual'

  const codesTypes = [
    'SRV', 'PTB', 'CPU', 'ECR', 'OND', 'IMPL', 'IMPLC', 'IMPLMD', 'IMPLHD',
    'IMPLM', 'IMPLMC', 'IMPM', 'IMPT', 'IMPGDB', 'IMPJM', 'IMPJ', 'TRACEUR',
    'SCANNER', 'CBARRE', 'TABLETTE', 'VPROJ', 'ADAPT', 'DVD EXT', 'AUT'
  ];

  const typesMateriel = [
    'Serveur', 'Portable', 'Unité centrale', 'Ecran', 'onduleur',
    'Imprimante Laser', 'Imprimante Laser Couleur', 'Imprimante laser Moyen débit',
    'Imprimante laser haut débit', 'Imprimante laser multifonction',
    'Imprimante laser multifonction Couleur', 'Imprimante Matricielle',
    'Imprimante Ticket (caisse)', 'Imprimante grand débit',
    'imprimante jet d\'encre multifonction', 'imprimante jet d\'encre',
    'Traceur', 'Scanner', 'Lecteur code à barre', 'Tablette',
    'Vidéo projecteur', 'Adaptateur', 'Lecteur DVD Externe',
    'processeur', 'PTB', 'ordinateur', 'écran', 'souris', 'clavier', 'Autres'
  ];

  const etatsDisponibles = ['Fonctionnel', 'En panne', 'En maintenance', 'Hors service'];
  
  const departementsDisponibles = [
    'DIRECTEUR', 'STAFF SUPPORT', 'STAFF', 'SFIN', 'SCOMM', 'SEXO',
    'SRH', 'SPE', 'SDE', 'CMS','SECC', 'SLA','SSI', 'contentieux', 'SCC', 'SAPPRO'
  ];

  useEffect(() => {
    fetchMateriels();
  }, []);

  useEffect(() => {
    filterMateriels();
  }, [materiels, searchTerm, selectedType, selectedStatus]);

  useEffect(() => {
    setSelectedMateriels([]);
    setSelectAll(false);
  }, [filteredMateriels.length]);

  const fetchMateriels = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/materiels');
      if (response.ok) {
        const data = await response.json();
        setMateriels(data);
      } else {
        console.error('Erreur lors du chargement des matériels');
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterMateriels = () => {
    let filtered = materiels;

    if (searchTerm) {
      filtered = filtered.filter(materiel =>
        materiel.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        materiel.marque.toLowerCase().includes(searchTerm.toLowerCase()) ||
        materiel.modele.toLowerCase().includes(searchTerm.toLowerCase()) ||
        materiel.employe.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (materiel.caracteristique && materiel.caracteristique.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (materiel.fonction && materiel.fonction.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedType) {
      filtered = filtered.filter(materiel => materiel.type === selectedType);
    }

    if (selectedStatus) {
      filtered = filtered.filter(materiel => materiel.etat === selectedStatus);
    }

    setFilteredMateriels(filtered);
  };

  const handleSelectMateriel = (id) => {
    setSelectedMateriels(prev => {
      if (prev.includes(id)) {
        return prev.filter(itemId => itemId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedMateriels([]);
    } else {
      setSelectedMateriels(filteredMateriels.map(m => m.id));
    }
    setSelectAll(!selectAll);
  };

  const handleDeleteSelected = async () => {
    if (selectedMateriels.length === 0) {
      alert('Veuillez sélectionner au moins un matériel à supprimer');
      return;
    }

    if (window.confirm(`Êtes-vous sûr de vouloir supprimer ${selectedMateriels.length} matériel(s) ?`)) {
      setLoading(true);
      let successCount = 0;
      let errorCount = 0;

      try {
        for (const id of selectedMateriels) {
          try {
            const response = await fetch(`http://localhost:5000/api/materiels/${id}`, {
              method: 'DELETE',
            });

            if (response.ok) {
              successCount++;
            } else {
              errorCount++;
            }
          } catch (error) {
            errorCount++;
            console.error(`Erreur suppression matériel ${id}:`, error);
          }
        }

        setSuccess(`${successCount} matériel(s) supprimé(s) avec succès${errorCount > 0 ? `, ${errorCount} erreur(s)` : ''}`);
        setSelectedMateriels([]);
        setSelectAll(false);
        await fetchMateriels();
        
        setTimeout(() => setSuccess(''), 3000);

      } catch (error) {
        setError('Erreur lors de la suppression: ' + error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const url = modalMode === 'add' 
        ? 'http://localhost:5000/api/materiels'
        : `http://localhost:5000/api/materiels/${currentMateriel.id}`;
      
      const method = modalMode === 'add' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(currentMateriel),
      });

      if (response.ok) {
        setShowModal(false);
        fetchMateriels();
        resetForm();
        alert(modalMode === 'add' ? 'Matériel ajouté avec succès' : 'Matériel modifié avec succès');
      } else {
        alert('Erreur lors de l\'enregistrement');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce matériel ?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/materiels/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          fetchMateriels();
          alert('Matériel supprimé avec succès');
        } else {
          alert('Erreur lors de la suppression');
        }
      } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur de connexion');
      }
    }
  };

  const openAddModal = () => {
    setModalMode('add');
    setInputMode('selection'); // Par défaut en mode sélection
    setCurrentMateriel({
      code: '',
      type: '',
      marque: '',
      modele: '',
      numero_serie: '',
      employe: '',
      departement: '',
      etat: 'Fonctionnel',
      caracteristique: '',
      fonction: ''
    });
    setShowModal(true);
  };

  const openEditModal = (materiel) => {
    setModalMode('edit');
    setInputMode('selection'); // Par défaut en mode sélection pour l'édition
    setCurrentMateriel(materiel);
    setShowModal(true);
  };

  const resetForm = () => {
    setCurrentMateriel({
      code: '',
      type: '',
      marque: '',
      modele: '',
      numero_serie: '',
      employe: '',
      departement: '',
      etat: 'Fonctionnel',
      caracteristique: '',
      fonction: ''
    });
    setInputMode('selection');
  };

  const handleExcelImport = (file) => {
    const fileName = file.name.toLowerCase();
    
    if (!fileName.endsWith('.csv') && !fileName.endsWith('.xlsx') && !fileName.endsWith('.xls')) {
      setError('Format de fichier non supporté. Veuillez utiliser un fichier CSV ou Excel.');
      return;
    }

    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        let data;
        
        if (fileName.endsWith('.csv')) {
          const text = e.target.result;
          const lines = text.split('\n').filter(line => line.trim());
          
          if (lines.length < 2) {
            setError('Le fichier CSV doit contenir au moins une ligne d\'en-tête et une ligne de données.');
            return;
          }
          
          const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
          data = lines.slice(1).map(line => {
            const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
            const row = {};
            headers.forEach((header, index) => {
              row[header] = values[index] || '';
            });
            return row;
          });
        } else {
          setError('Pour les fichiers Excel (.xlsx, .xls), veuillez d\'abord les convertir en format CSV. Ou collez directement les données dans le champ de texte ci-dessous.');
          setShowTextImport(true);
          return;
        }

        const mappedData = data.map((row, index) => {
          const mappedRow = {
            id: `import_${index}`,
            code: row['Code'] || row['code'] || row['CODE'] || '',
            type: row['Type'] || row['type'] || row['TYPE'] || '',
            marque: row['Marque'] || row['marque'] || row['MARQUE'] || '',
            modele: row['Modele'] || row['Modèle'] || row['modele'] || row['MODELE'] || '',
            numero_serie: row['Numero_serie'] || row['N° Série'] || row['numero_serie'] || row['NUMERO_SERIE'] || '',
            employe: row['Employe'] || row['Employé'] || row['employe'] || row['EMPLOYE'] || '',
            departement: row['Departement'] || row['Département'] || row['departement'] || row['DEPARTEMENT'] || '',
            etat: row['Etat'] || row['État'] || row['etat'] || row['ETAT'] || 'Fonctionnel',
            caracteristique: row['Caracteristique'] || row['Caractéristique'] || row['caracteristique'] || '',
            fonction: row['Fonction'] || row['fonction'] || row['FONCTION'] || ''
          };
          
          return mappedRow;
        });

        const validationErrors = [];
        const validData = mappedData.filter((item, index) => {
          const errors = [];
          
          if (!item.code) errors.push(`Ligne ${index + 2}: Code manquant`);
          if (!item.type) errors.push(`Ligne ${index + 2}: Type manquant`);
          if (!item.marque) errors.push(`Ligne ${index + 2}: Marque manquante`);
          if (!item.modele) errors.push(`Ligne ${index + 2}: Modèle manquant`);
          if (!item.numero_serie) errors.push(`Ligne ${index + 2}: N° Série manquant`);
          if (!item.employe) errors.push(`Ligne ${index + 2}: Employé manquant`);
          if (!item.departement) errors.push(`Ligne ${index + 2}: Département manquant`);
          
          if (errors.length > 0) {
            validationErrors.push(...errors);
            return false;
          }
          
          return true;
        });

        setImportData(validData);
        setImportPreview(mappedData.slice(0, 10));
        setImportErrors(validationErrors);
        setShowImportModal(true);

      } catch (error) {
        setError('Erreur lors de la lecture du fichier: ' + error.message);
      }
    };

    if (fileName.endsWith('.csv')) {
      reader.readAsText(file, 'UTF-8');
    } else {
      reader.readAsArrayBuffer(file);
    }
  };

  const handleTextImport = (textData) => {
    try {
      const lines = textData.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        setError('Les données doivent contenir au moins une ligne d\'en-tête et une ligne de données.');
        return;
      }
      
      let separator = ',';
      if (lines[0].includes('\t')) separator = '\t';
      else if (lines[0].includes(';')) separator = ';';
      
      const headers = lines[0].split(separator).map(h => h.trim().replace(/"/g, ''));
      const data = lines.slice(1).map(line => {
        const values = line.split(separator).map(v => v.trim().replace(/"/g, ''));
        const row = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        return row;
      });

      const mappedData = data.map((row, index) => {
        const mappedRow = {
          id: `import_${index}`,
          code: row['Code'] || row['code'] || row['CODE'] || '',
          type: row['Type'] || row['type'] || row['TYPE'] || '',
          marque: row['Marque'] || row['marque'] || row['MARQUE'] || '',
          modele: row['Modele'] || row['Modèle'] || row['modele'] || row['MODELE'] || '',
          numero_serie: row['Numero_serie'] || row['N° Série'] || row['numero_serie'] || row['NUMERO_SERIE'] || '',
          employe: row['Employe'] || row['Employé'] || row['employe'] || row['EMPLOYE'] || '',
          departement: row['Departement'] || row['Département'] || row['departement'] || row['DEPARTEMENT'] || '',
          etat: row['Etat'] || row['État'] || row['etat'] || row['ETAT'] || 'Fonctionnel',
          caracteristique: row['Caracteristique'] || row['Caractéristique'] || row['caracteristique'] || '',
          fonction: row['Fonction'] || row['fonction'] || row['FONCTION'] || ''
        };
        
        return mappedRow;
      });

      const validationErrors = [];
      const validData = mappedData.filter((item, index) => {
        const errors = [];
        
        if (!item.code) errors.push(`Ligne ${index + 2}: Code manquant`);
        if (!item.type) errors.push(`Ligne ${index + 2}: Type manquant`);
        if (!item.marque) errors.push(`Ligne ${index + 2}: Marque manquante`);
        if (!item.modele) errors.push(`Ligne ${index + 2}: Modèle manquant`);
        if (!item.numero_serie) errors.push(`Ligne ${index + 2}: N° Série manquant`);
        if (!item.employe) errors.push(`Ligne ${index + 2}: Employé manquant`);
        if (!item.departement) errors.push(`Ligne ${index + 2}: Département manquant`);
        
        if (errors.length > 0) {
          validationErrors.push(...errors);
          return false;
        }
        
        return true;
      });

      setImportData(validData);
      setImportPreview(mappedData.slice(0, 10));
      setImportErrors(validationErrors);
      setShowTextImport(false);
      setShowImportModal(true);
      setTextImportData('');

    } catch (error) {
      setError('Erreur lors du traitement des données: ' + error.message);
    }
  };

  const confirmImport = async () => {
    try {
      setLoading(true);
      let importedCount = 0;
      let errorCount = 0;

      for (const materiel of importData) {
        try {
          const { id, ...materielData } = materiel;
          const response = await fetch('http://localhost:5000/api/materiels', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(materielData)
          });
          
          if (response.ok) {
            importedCount++;
          } else {
            errorCount++;
          }
        } catch (error) {
          errorCount++;
          console.error(`Erreur import matériel ${materiel.code}:`, error);
        }
      }

      setSuccess(`Import terminé: ${importedCount} matériels ajoutés, ${errorCount} erreurs`);
      setShowImportModal(false);
      setImportData([]);
      setImportPreview([]);
      setImportErrors([]);
      await fetchMateriels();
      
      setTimeout(() => setSuccess(''), 3000);

    } catch (error) {
      setError('Erreur lors de l\'import: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const closeImportModal = () => {
    setShowImportModal(false);
    setImportData([]);
    setImportPreview([]);
    setImportErrors([]);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen" style={{ fontFamily: 'Times New Roman, serif' }}>
      {success && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          {success}
        </div>
      )}
      
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="mb-8">
        <h2 className="text-3xl font-semibold text-gray-800">
          Gestion du matériel
        </h2>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 mb-6 flex justify-between items-center">
        <div className="flex gap-4 items-center">
          <input
            type="text"
            placeholder="Rechercher un matériel..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none w-80"
            style={{ fontFamily: 'Times New Roman, serif' }}
          />
          
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none bg-white"
            style={{ fontFamily: 'Times New Roman, serif' }}
          >
            <option value="">Tous les types</option>
            {typesMateriel.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none bg-white"
            style={{ fontFamily: 'Times New Roman, serif' }}
          >
            <option value="">Tous les états</option>
            {etatsDisponibles.map(etat => (
              <option key={etat} value={etat}>{etat}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          <input
            type="file"
            id="excel-import"
            className="hidden"
            accept=".xlsx,.xls,.csv"
            onChange={(e) => {
              if (e.target.files[0]) {
                handleExcelImport(e.target.files[0]);
                e.target.value = '';
              }
            }}
          />
          <button 
            onClick={() => document.getElementById('excel-import').click()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            disabled={loading}
            style={{ fontFamily: 'Times New Roman, serif' }}
          >
            Importer Excel
          </button>
          
          <button 
            onClick={openAddModal}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
            style={{ fontFamily: 'Times New Roman, serif' }}
          >
            Nouveau matériel
          </button>
        </div>
      </div>

      {selectedMateriels.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg shadow-sm p-4 mb-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-red-800 font-medium" style={{ fontFamily: 'Times New Roman, serif' }}>
              {selectedMateriels.length} matériel(s) sélectionné(s)
            </span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setSelectedMateriels([]);
                setSelectAll(false);
              }}
              className="px-4 py-2 bg-white border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors"
              style={{ fontFamily: 'Times New Roman, serif' }}
            >
              Annuler
            </button>
            <button
              onClick={handleDeleteSelected}
              disabled={loading}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              style={{ fontFamily: 'Times New Roman, serif' }}
            >
              Supprimer la sélection
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
          <p className="mt-4 text-gray-600" style={{ fontFamily: 'Times New Roman, serif' }}>Chargement...</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden overflow-x-auto">
          <table className="w-full min-w-[1400px]" style={{ fontFamily: 'Times New Roman, serif' }}>
            <thead className="bg-gray-600 text-white">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAll}
                    className="w-4 h-4 cursor-pointer"
                  />
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">Code</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Type</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Marque</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Modèle</th>
                <th className="px-4 py-3 text-left text-sm font-medium">N° Série</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Employé</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Département</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Caractéristique</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Fonction</th>
                <th className="px-4 py-3 text-left text-sm font-medium">État</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredMateriels.map((materiel) => (
                <tr key={materiel.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedMateriels.includes(materiel.id)}
                      onChange={() => handleSelectMateriel(materiel.id)}
                      className="w-4 h-4 cursor-pointer"
                    />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">{materiel.code}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{materiel.type}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{materiel.marque}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{materiel.modele}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{materiel.numero_serie}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{materiel.employe}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{materiel.departement}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{materiel.caracteristique || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{materiel.fonction || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      materiel.etat === 'Fonctionnel' ? 'bg-gray-100 text-gray-800' :
                      materiel.etat === 'En panne' ? 'bg-red-100 text-red-800' :
                      materiel.etat === 'En maintenance' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {materiel.etat}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => openEditModal(materiel)}
                        className="px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 transition-colors"
                      >
                        Modifier
                      </button>
                      <button 
                        onClick={() => handleDelete(materiel.id)}
                        className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                      >
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900" style={{ fontFamily: 'Times New Roman, serif' }}>
                {modalMode === 'add' ? 'Ajouter un matériel' : 'Modifier le matériel'}
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Mode de saisie */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3" style={{ fontFamily: 'Times New Roman, serif' }}>
                  Mode de saisie :
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="inputMode"
                      value="selection"
                      checked={inputMode === 'selection'}
                      onChange={(e) => setInputMode(e.target.value)}
                      className="w-4 h-4 mr-2"
                    />
                    <span style={{ fontFamily: 'Times New Roman, serif' }}>Par sélection (liste déroulante)</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="inputMode"
                      value="manual"
                      checked={inputMode === 'manual'}
                      onChange={(e) => setInputMode(e.target.value)}
                      className="w-4 h-4 mr-2"
                    />
                    <span style={{ fontFamily: 'Times New Roman, serif' }}>Saisie manuelle</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" style={{ fontFamily: 'Times New Roman, serif' }}>Code:</label>
                  {inputMode === 'selection' ? (
                    <select
                      value={currentMateriel.code}
                      onChange={(e) => setCurrentMateriel({...currentMateriel, code: e.target.value})}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none bg-white"
                      style={{ fontFamily: 'Times New Roman, serif' }}
                    >
                      <option value="">Sélectionner un code</option>
                      {codesTypes.map(code => (
                        <option key={code} value={code}>{code}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={currentMateriel.code}
                      onChange={(e) => setCurrentMateriel({...currentMateriel, code: e.target.value})}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none"
                      style={{ fontFamily: 'Times New Roman, serif' }}
                      placeholder="Saisir le code"
                    />
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" style={{ fontFamily: 'Times New Roman, serif' }}>Type:</label>
                  {inputMode === 'selection' ? (
                    <select
                      value={currentMateriel.type}
                      onChange={(e) => setCurrentMateriel({...currentMateriel, type: e.target.value})}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none bg-white"
                      style={{ fontFamily: 'Times New Roman, serif' }}
                    >
                      <option value="">Sélectionner un type</option>
                      {typesMateriel.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={currentMateriel.type}
                      onChange={(e) => setCurrentMateriel({...currentMateriel, type: e.target.value})}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none"
                      style={{ fontFamily: 'Times New Roman, serif' }}
                      placeholder="Saisir le type"
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" style={{ fontFamily: 'Times New Roman, serif' }}>Marque:</label>
                  <input
                    type="text"
                    value={currentMateriel.marque}
                    onChange={(e) => setCurrentMateriel({...currentMateriel, marque: e.target.value})}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none"
                    style={{ fontFamily: 'Times New Roman, serif' }}
                    placeholder="Ex: HP, Dell, Lenovo..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" style={{ fontFamily: 'Times New Roman, serif' }}>Modèle:</label>
                  <input
                    type="text"
                    value={currentMateriel.modele}
                    onChange={(e) => setCurrentMateriel({...currentMateriel, modele: e.target.value})}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none"
                    style={{ fontFamily: 'Times New Roman, serif' }}
                    placeholder="Ex: ThinkPad T480, Pavilion 15..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" style={{ fontFamily: 'Times New Roman, serif' }}>N° Série:</label>
                  <input
                    type="text"
                    value={currentMateriel.numero_serie}
                    onChange={(e) => setCurrentMateriel({...currentMateriel, numero_serie: e.target.value})}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none"
                    style={{ fontFamily: 'Times New Roman, serif' }}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" style={{ fontFamily: 'Times New Roman, serif' }}>Employé:</label>
                  <input
                    type="text"
                    value={currentMateriel.employe}
                    onChange={(e) => setCurrentMateriel({...currentMateriel, employe: e.target.value})}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none"
                    style={{ fontFamily: 'Times New Roman, serif' }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" style={{ fontFamily: 'Times New Roman, serif' }}>Département:</label>
                  {inputMode === 'selection' ? (
                    <select
                      value={currentMateriel.departement}
                      onChange={(e) => setCurrentMateriel({...currentMateriel, departement: e.target.value})}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none bg-white"
                      style={{ fontFamily: 'Times New Roman, serif' }}
                    >
                      <option value="">Sélectionner un département</option>
                      {departementsDisponibles.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={currentMateriel.departement}
                      onChange={(e) => setCurrentMateriel({...currentMateriel, departement: e.target.value})}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none"
                      style={{ fontFamily: 'Times New Roman, serif' }}
                      placeholder="Saisir le département"
                    />
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" style={{ fontFamily: 'Times New Roman, serif' }}>État:</label>
                  {inputMode === 'selection' ? (
                    <select
                      value={currentMateriel.etat}
                      onChange={(e) => setCurrentMateriel({...currentMateriel, etat: e.target.value})}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none bg-white"
                      style={{ fontFamily: 'Times New Roman, serif' }}
                    >
                      {etatsDisponibles.map(etat => (
                        <option key={etat} value={etat}>{etat}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={currentMateriel.etat}
                      onChange={(e) => setCurrentMateriel({...currentMateriel, etat: e.target.value})}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none"
                      style={{ fontFamily: 'Times New Roman, serif' }}
                      placeholder="Saisir l'état"
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" style={{ fontFamily: 'Times New Roman, serif' }}>Caractéristique:</label>
                  <textarea
                    value={currentMateriel.caracteristique}
                    onChange={(e) => setCurrentMateriel({...currentMateriel, caracteristique: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none resize-vertical"
                    style={{ fontFamily: 'Times New Roman, serif' }}
                    placeholder="Décrire les caractéristiques techniques..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" style={{ fontFamily: 'Times New Roman, serif' }}>Fonction:</label>
                  <textarea
                    value={currentMateriel.fonction}
                    onChange={(e) => setCurrentMateriel({...currentMateriel, fonction: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none resize-vertical"
                    style={{ fontFamily: 'Times New Roman, serif' }}
                    placeholder="Décrire la fonction du matériel..."
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                  style={{ fontFamily: 'Times New Roman, serif' }}
                >
                  Annuler
                </button>
                <button 
                  type="button" 
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
                  style={{ fontFamily: 'Times New Roman, serif' }}
                >
                  {loading ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900" style={{ fontFamily: 'Times New Roman, serif' }}>
                Importer des matériels depuis CSV/Excel
              </h3>
              <button 
                onClick={closeImportModal}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6" style={{ fontFamily: 'Times New Roman, serif' }}>
              {importErrors.length > 0 && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h4 className="font-semibold text-red-800 mb-2">Erreurs de validation :</h4>
                  <div className="max-h-40 overflow-y-auto">
                    {importErrors.map((err, index) => (
                      <div key={index} className="text-sm text-red-700 mb-1">{err}</div>
                    ))}
                  </div>
                </div>
              )}

              {importData.length > 0 && (
                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">Données prêtes à importer :</h4>
                  <p className="text-blue-700">{importData.length} matériel(s) valide(s) trouvé(s)</p>
                </div>
              )}

              {importPreview.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">Aperçu des données (10 premiers éléments) :</h4>
                  <div className="overflow-x-auto max-h-96 border border-gray-200 rounded-lg">
                    <table className="w-full min-w-max">
                      <thead className="bg-gray-100 sticky top-0">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">Code</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">Type</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">Marque</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">Modèle</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">N° Série</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">Employé</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">Département</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">État</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {importPreview.map((item, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-3 py-2 text-sm text-gray-900">{item.code}</td>
                            <td className="px-3 py-2 text-sm text-gray-900">{item.type}</td>
                            <td className="px-3 py-2 text-sm text-gray-900">{item.marque}</td>
                            <td className="px-3 py-2 text-sm text-gray-900">{item.modele}</td>
                            <td className="px-3 py-2 text-sm text-gray-900">{item.numero_serie}</td>
                            <td className="px-3 py-2 text-sm text-gray-900">{item.employe}</td>
                            <td className="px-3 py-2 text-sm text-gray-900">{item.departement}</td>
                            <td className="px-3 py-2 text-sm text-gray-900">{item.etat}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                <button 
                  onClick={closeImportModal} 
                  disabled={loading}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                  style={{ fontFamily: 'Times New Roman, serif' }}
                >
                  Annuler
                </button>
                {importData.length > 0 && (
                  <button 
                    onClick={confirmImport} 
                    disabled={loading}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    style={{ fontFamily: 'Times New Roman, serif' }}
                  >
                    {loading ? 'Import en cours...' : `Importer ${importData.length} matériel(s)`}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showTextImport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900" style={{ fontFamily: 'Times New Roman, serif' }}>
                Coller les données Excel
              </h3>
              <button 
                onClick={() => setShowTextImport(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6" style={{ fontFamily: 'Times New Roman, serif' }}>
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">Instructions :</h4>
                <ol className="text-sm text-blue-700 space-y-1 ml-4 list-decimal">
                  <li>Ouvrez votre fichier Excel</li>
                  <li>Sélectionnez toutes les données (en-têtes inclus)</li>
                  <li>Copiez (Ctrl+C) et collez dans la zone ci-dessous</li>
                  <li>Les colonnes acceptées : Code, Type, Marque, Modele (ou Modèle), Numero_serie (ou N° Série), Employe (ou Employé), Departement (ou Département), Etat (ou État), Caracteristique, Fonction</li>
                </ol>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Données Excel (copiées-collées) :
                </label>
                <textarea
                  value={textImportData}
                  onChange={(e) => setTextImportData(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none resize-vertical"
                  style={{ fontFamily: 'Times New Roman, serif' }}
                  rows={12}
                  placeholder="Collez ici vos données Excel..."
                />
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                <button 
                  onClick={() => setShowTextImport(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                  style={{ fontFamily: 'Times New Roman, serif' }}
                >
                  Annuler
                </button>
                <button 
                  onClick={() => handleTextImport(textImportData)}
                  disabled={!textImportData.trim()}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  style={{ fontFamily: 'Times New Roman, serif' }}
                >
                  Traiter les données
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionMateriel;