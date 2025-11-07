import React, { useState, useEffect } from 'react';

const GestionEmployes = () => {
  const [employes, setEmployes] = useState([]);
  const [allEmployes, setAllEmployes] = useState([]);
  const [fonctions, setFonctions] = useState([]);
  const [sites, setSites] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentEmploye, setCurrentEmploye] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartement, setFilterDepartement] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // États pour la sélection multiple
  const [selectedEmployes, setSelectedEmployes] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  
  // Nouveaux états pour l'import Excel
  const [showImportModal, setShowImportModal] = useState(false);
  const [importData, setImportData] = useState([]);
  const [importPreview, setImportPreview] = useState([]);
  const [importErrors, setImportErrors] = useState([]);
  const [showTextImport, setShowTextImport] = useState(false);
  const [textImportData, setTextImportData] = useState('');

  // Liste des départements disponibles
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
    'Contentieux',
    'SCC',
    'SAPPRO',
    'SECC',
    'SSI'
  ];

  const [formData, setFormData] = useState({
    matricule: '',
    nom_complet: '',
    fonction: '',
    departement: '',
    site: '',
    email: '',
    statut: 'Actif'
  });

  // Configuration de l'API
  const API_BASE_URL = 'http://localhost:5000/api';

  // Fonction pour faire les appels API
  const apiCall = async (url, options = {}) => {
    try {
      const response = await fetch(`${API_BASE_URL}${url}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la requête');
      }

      return data;
    } catch (error) {
      console.error('Erreur API:', error);
      throw error;
    }
  };

  // Fonctions pour la sélection multiple
  const handleSelectEmploye = (employeId) => {
    const newSelected = new Set(selectedEmployes);
    if (newSelected.has(employeId)) {
      newSelected.delete(employeId);
    } else {
      newSelected.add(employeId);
    }
    setSelectedEmployes(newSelected);
    setSelectAll(newSelected.size === employes.length && employes.length > 0);
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedEmployes(new Set());
      setSelectAll(false);
    } else {
      const allIds = new Set(employes.map(emp => emp.id));
      setSelectedEmployes(allIds);
      setSelectAll(true);
    }
  };

  const clearSelection = () => {
    setSelectedEmployes(new Set());
    setSelectAll(false);
  };

  const handleBulkDelete = async () => {
    try {
      setLoading(true);
      setError('');

      const deletePromises = Array.from(selectedEmployes).map(id =>
        apiCall(`/employes/${id}`, { method: 'DELETE' })
      );

      await Promise.all(deletePromises);

      setSuccess(`${selectedEmployes.size} employé(s) supprimé(s) avec succès`);
      clearSelection();
      setShowBulkDeleteModal(false);
      await loadEmployes();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Erreur lors de la suppression en lot: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Charger les données de configuration
  const loadConfigData = async () => {
    try {
      const response = await apiCall('/employes/config/data');
      if (response.success) {
        setFonctions(response.data.fonctions || []);
        setSites(response.data.sites || []);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données de configuration:', error);
      // Fallback vers les données par défaut
      setFonctions([]);
      setSites(['Antananarivo', 'Mahajanga', 'Toamasina', 'Antsirabe', 'Fianarantsoa', 'Toliara', 'Antsiranana', 'Morondava']);
    }
  };

  // Charger tous les employés avec filtrage automatique
  const loadEmployes = async (search = '', departement = '') => {
    try {
      setLoading(true);
      setError('');
      
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (departement) params.append('departement', departement);
      
      const queryString = params.toString();
      const url = `/employes${queryString ? `?${queryString}` : ''}`;
      
      const response = await apiCall(url);
      
      if (response.success) {
        setEmployes(response.data);
        if (!search && !departement) {
          setAllEmployes(response.data);
        }
        // Nettoyer la sélection si les employés ont changé
        clearSelection();
      }
    } catch (error) {
      setError('Erreur lors du chargement des employés: ' + error.message);
      setEmployes([]);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour traiter le fichier Excel (sans XLSX - utilise FileReader pour CSV)
  const handleExcelImport = (file) => {
    const fileName = file.name.toLowerCase();
    
    // Vérifier le type de fichier
    if (!fileName.endsWith('.csv') && !fileName.endsWith('.xlsx') && !fileName.endsWith('.xls')) {
      setError('Format de fichier non supporté. Veuillez utiliser un fichier CSV ou Excel.');
      return;
    }

    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        let data;
        
        if (fileName.endsWith('.csv')) {
          // Traitement pour CSV
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
          // Pour Excel, on simule le traitement avec du texte séparé par tabulations
          setError('Pour les fichiers Excel (.xlsx, .xls), veuillez d\'abord les convertir en format CSV. Ou collez directement les données dans le champ de texte ci-dessous.');
          
          // Afficher une zone de texte pour saisie manuelle
          setShowTextImport(true);
          return;
        }

        // Mapper les colonnes vers les champs de l'application
        const mappedData = data.map((row, index) => {
          const mappedRow = {
            id: `import_${index}`,
            matricule: row['Matricule'] || row['matricule'] || row['MATRICULE'] || '',
            nom_complet: row['Nom_complet'] || row['Nom complet'] || row['nom_complet'] || row['Nom'] || row['NOM'] || '',
            fonction: row['Fonction'] || row['fonction'] || row['FONCTION'] || '',
            departement: row['Departement'] || row['Département'] || row['departement'] || row['DEPARTEMENT'] || '',
            site: row['Site'] || row['site'] || row['SITE'] || '',
            email: row['Email'] || row['email'] || row['EMAIL'] || '',
            statut: row['Statut'] || row['statut'] || row['STATUT'] || 'Actif'
          };
          
          return mappedRow;
        });

        // Valider les données importées
        const validationErrors = [];
        const validData = mappedData.filter((item, index) => {
          const errors = [];
          
          if (!item.matricule) errors.push(`Ligne ${index + 2}: Matricule manquant`);
          if (!item.nom_complet) errors.push(`Ligne ${index + 2}: Nom complet manquant`);
          if (!item.fonction) errors.push(`Ligne ${index + 2}: Fonction manquante`);
          if (!item.departement) errors.push(`Ligne ${index + 2}: Département manquant`);
          if (!item.site) errors.push(`Ligne ${index + 2}: Site manquant`);
          if (item.departement && !departements.includes(item.departement)) {
            errors.push(`Ligne ${index + 2}: Département "${item.departement}" non valide`);
          }
          
          if (errors.length > 0) {
            validationErrors.push(...errors);
            return false;
          }
          
          return true;
        });

        setImportData(validData);
        setImportPreview(mappedData.slice(0, 10)); // Aperçu des 10 premiers
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

  // Fonction pour traiter le texte collé manuellement
  const handleTextImport = (textData) => {
    try {
      const lines = textData.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        setError('Les données doivent contenir au moins une ligne d\'en-tête et une ligne de données.');
        return;
      }
      
      // Détecter le séparateur (virgule, point-virgule, ou tabulation)
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

      // Mapper les colonnes vers les champs de l'application
      const mappedData = data.map((row, index) => {
        const mappedRow = {
          id: `import_${index}`,
          matricule: row['Matricule'] || row['matricule'] || row['MATRICULE'] || '',
          nom_complet: row['Nom_complet'] || row['Nom complet'] || row['nom_complet'] || row['Nom'] || row['NOM'] || '',
          fonction: row['Fonction'] || row['fonction'] || row['FONCTION'] || '',
          departement: row['Departement'] || row['Département'] || row['departement'] || row['DEPARTEMENT'] || '',
          site: row['Site'] || row['site'] || row['SITE'] || '',
          email: row['Email'] || row['email'] || row['EMAIL'] || '',
          statut: row['Statut'] || row['statut'] || row['STATUT'] || 'Actif'
        };
        
        return mappedRow;
      });

      // Valider les données importées
      const validationErrors = [];
      const validData = mappedData.filter((item, index) => {
        const errors = [];
        
        if (!item.matricule) errors.push(`Ligne ${index + 2}: Matricule manquant`);
        if (!item.nom_complet) errors.push(`Ligne ${index + 2}: Nom complet manquant`);
        if (!item.fonction) errors.push(`Ligne ${index + 2}: Fonction manquante`);
        if (!item.departement) errors.push(`Ligne ${index + 2}: Département manquant`);
        if (!item.site) errors.push(`Ligne ${index + 2}: Site manquant`);
        if (item.departement && !departements.includes(item.departement)) {
          errors.push(`Ligne ${index + 2}: Département "${item.departement}" non valide`);
        }
        
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

  // Fonction pour confirmer l'import
  const confirmImport = async () => {
    try {
      setLoading(true);
      let importedCount = 0;
      let errorCount = 0;

      for (const employe of importData) {
        try {
          const { id, ...employeData } = employe;
          await apiCall('/employes', {
            method: 'POST',
            body: JSON.stringify(employeData)
          });
          importedCount++;
        } catch (error) {
          errorCount++;
          console.error(`Erreur import employé ${employe.matricule}:`, error);
        }
      }

      setSuccess(`Import terminé: ${importedCount} employés ajoutés, ${errorCount} erreurs`);
      setShowImportModal(false);
      setImportData([]);
      setImportPreview([]);
      setImportErrors([]);
      await loadEmployes();

    } catch (error) {
      setError('Erreur lors de l\'import: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Initialisation
  useEffect(() => {
    loadConfigData();
    loadEmployes();
  }, []);

  // Effet pour la recherche automatique
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadEmployes(searchTerm, filterDepartement);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, filterDepartement]);

  // Mise à jour de selectAll quand employes change
  useEffect(() => {
    if (employes.length === 0) {
      setSelectAll(false);
    } else {
      setSelectAll(selectedEmployes.size === employes.length);
    }
  }, [employes.length, selectedEmployes.size]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const resetForm = () => {
    setFormData({
      matricule: '',
      nom_complet: '',
      fonction: '',
      departement: '',
      site: '',
      email: '',
      statut: 'Actif'
    });
    setCurrentEmploye(null);
    setEditMode(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');

      if (editMode && currentEmploye) {
        // Mise à jour
        const response = await apiCall(`/employes/${currentEmploye.id}`, {
          method: 'PUT',
          body: JSON.stringify(formData)
        });

        if (response.success) {
          setSuccess('Employé mis à jour avec succès');
          await loadEmployes();
        }
      } else {
        // Ajout
        const response = await apiCall('/employes', {
          method: 'POST',
          body: JSON.stringify(formData)
        });

        if (response.success) {
          setSuccess('Employé ajouté avec succès');
          await loadEmployes();
        }
      }
      
      setShowModal(false);
      resetForm();
      
      // Effacer le message de succès après 3 secondes
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (employe) => {
    setCurrentEmploye(employe);
    setFormData({
      matricule: employe.matricule || '',
      nom_complet: employe.nom_complet || '',
      fonction: employe.fonction || '',
      departement: employe.departement || '',
      site: employe.site || '',
      email: employe.email || '',
      statut: employe.statut || 'Actif'
    });
    setEditMode(true);
    setShowModal(true);
  };

  const handleDelete = async (id, matricule) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer l'employé ${matricule} ?`)) {
      try {
        setLoading(true);
        setError('');

        const response = await apiCall(`/employes/${id}`, {
          method: 'DELETE'
        });

        if (response.success) {
          setSuccess('Employé supprimé avec succès');
          await loadEmployes();
          setTimeout(() => setSuccess(''), 3000);
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
    setError('');
  };

  const closeImportModal = () => {
    setShowImportModal(false);
    setImportData([]);
    setImportPreview([]);
    setImportErrors([]);
  };

  // Styles intégrés avec Times New Roman
  const styles = {
    container: {
      padding: '20px',
      backgroundColor: '#f8f9fa',
      minHeight: '100vh',
      fontFamily: 'Times New Roman, serif'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '30px',
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    title: {
      display: 'flex',
      alignItems: 'center',
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#2c3e50'
    },
    icon: {
      fontSize: '28px',
      marginRight: '10px'
    },
    headerButtons: {
      display: 'flex',
      gap: '10px'
    },
    addButton: {
      display: 'flex',
      alignItems: 'center',
      backgroundColor: loading ? '#6c757d' : '#6c757d',
      color: 'white',
      border: 'none',
      padding: '12px 20px',
      borderRadius: '6px',
      cursor: loading ? 'not-allowed' : 'pointer',
      fontSize: '16px',
      fontWeight: '500'
    },
    importButton: {
      display: 'flex',
      alignItems: 'center',
      backgroundColor: loading ? '#17a2b8' : '#17a2b8',
      color: 'white',
      border: 'none',
      padding: '12px 20px',
      borderRadius: '6px',
      cursor: loading ? 'not-allowed' : 'pointer',
      fontSize: '16px',
      fontWeight: '500'
    },
    bulkDeleteButton: {
      display: 'flex',
      alignItems: 'center',
      backgroundColor: loading ? '#dc3545' : '#dc3545',
      color: 'white',
      border: 'none',
      padding: '12px 20px',
      borderRadius: '6px',
      cursor: loading || selectedEmployes.size === 0 ? 'not-allowed' : 'pointer',
      fontSize: '16px',
      fontWeight: '500',
      opacity: selectedEmployes.size === 0 ? 0.6 : 1
    },
    hiddenInput: {
      display: 'none'
    },
    searchContainer: {
      display: 'flex',
      gap: '15px',
      marginBottom: '20px',
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      flexWrap: 'wrap',
      alignItems: 'center'
    },
    selectionInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '15px',
      marginBottom: '20px',
      backgroundColor: '#e7f3ff',
      padding: '15px 20px',
      borderRadius: '8px',
      border: '1px solid #b3d9ff',
      fontSize: '14px',
      color: '#0c5460'
    },
    clearSelectionButton: {
      backgroundColor: 'transparent',
      border: '1px solid #6c757d',
      color: '#6c757d',
      padding: '6px 12px',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '12px',
      fontFamily: 'Times New Roman, serif'
    },
    input: {
      flex: 1,
      padding: '10px 15px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      fontSize: '14px',
      minWidth: '200px',
      fontFamily: 'Times New Roman, serif'
    },
    select: {
      padding: '10px 15px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      fontSize: '14px',
      minWidth: '150px',
      fontFamily: 'Times New Roman, serif'
    },
    tableContainer: {
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      overflow: 'auto'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      minWidth: '900px',
      fontFamily: 'Times New Roman, serif'
    },
    tableHeader: {
      backgroundColor: '#6c757d',
      color: 'white'
    },
    th: {
      padding: '15px 10px',
      textAlign: 'left',
      fontWeight: '600',
      fontSize: '14px',
      whiteSpace: 'nowrap'
    },
    thCheckbox: {
      padding: '15px 10px',
      textAlign: 'center',
      fontWeight: '600',
      fontSize: '14px',
      width: '50px'
    },
    td: {
      padding: '12px 10px',
      borderBottom: '1px solid #eee',
      fontSize: '14px'
    },
    tdCheckbox: {
      padding: '12px 10px',
      borderBottom: '1px solid #eee',
      textAlign: 'center',
      width: '50px'
    },
    checkbox: {
      width: '16px',
      height: '16px',
      cursor: 'pointer'
    },
    actionButton: {
      padding: '6px 12px',
      border: 'none',
      borderRadius: '4px',
      cursor: loading ? 'not-allowed' : 'pointer',
      fontSize: '12px',
      fontWeight: '500',
      marginRight: '5px',
      opacity: loading ? 0.6 : 1,
      fontFamily: 'Times New Roman, serif'
    },
    editButton: {
      backgroundColor: '#6c757d',
      color: 'white'
    },
    deleteButton: {
      backgroundColor: '#007bff',
      color: 'white'
    },
    modal: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    },
    modalContent: {
      backgroundColor: 'white',
      padding: '30px',
      borderRadius: '8px',
      width: '90%',
      maxWidth: '800px',
      maxHeight: '90vh',
      overflow: 'auto',
      fontFamily: 'Times New Roman, serif'
    },
    modalHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px',
      borderBottom: '1px solid #eee',
      paddingBottom: '10px'
    },
    modalTitle: {
      fontSize: '20px',
      fontWeight: 'bold',
      color: '#6c757d'
    },
    closeButton: {
      background: 'none',
      border: 'none',
      fontSize: '24px',
      cursor: 'pointer',
      color: '#999',
      fontFamily: 'Times New Roman, serif'
    },
    formGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '15px',
      marginBottom: '20px'
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column'
    },
    label: {
      marginBottom: '5px',
      fontWeight: '500',
      color: '#6c757d',
      fontSize: '14px'
    },
    formInput: {
      padding: '10px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      fontSize: '14px',
      fontFamily: 'Times New Roman, serif'
    },
    formSelect: {
      padding: '10px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      fontSize: '14px',
      fontFamily: 'Times New Roman, serif'
    },
    modalActions: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '10px',
      marginTop: '20px'
    },
    submitButton: {
      backgroundColor: loading ? '#6c757d' : '#6c757d',
      color: 'white',
      border: 'none',
      padding: '12px 24px',
      borderRadius: '4px',
      cursor: loading ? 'not-allowed' : 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      fontFamily: 'Times New Roman, serif'
    },
    cancelButton: {
      backgroundColor: '#6c757d',
      color: 'white',
      border: 'none',
      padding: '12px 24px',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      fontFamily: 'Times New Roman, serif'
    },
    confirmButton: {
      backgroundColor: '#28a745',
      color: 'white',
      border: 'none',
      padding: '12px 24px',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      fontFamily: 'Times New Roman, serif'
    },
    dangerButton: {
      backgroundColor: '#dc3545',
      color: 'white',
      border: 'none',
      padding: '12px 24px',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      fontFamily: 'Times New Roman, serif'
    },
    alert: {
      padding: '12px 20px',
      borderRadius: '4px',
      marginBottom: '20px',
      fontSize: '14px',
      fontWeight: '500'
    },
    alertSuccess: {
      backgroundColor: '#d4edda',
      color: '#155724',
      border: '1px solid #c3e6cb'
    },
    alertError: {
      backgroundColor: '#f8d7da',
      color: '#721c24',
      border: '1px solid #f5c6cb'
    },
    alertWarning: {
      backgroundColor: '#fff3cd',
      color: '#856404',
      border: '1px solid #ffeaa7'
    },
    badge: {
      padding: '4px 8px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '500'
    },
    badgeActif: {
      backgroundColor: '#d4edda',
      color: '#155724'
    },
    badgeInactif: {
      backgroundColor: '#f8d7da',
      color: '#721c24'
    },
    noData: {
      textAlign: 'center',
      padding: '40px',
      color: '#6c757d',
      fontSize: '16px'
    },
    importInfo: {
      backgroundColor: '#e7f3ff',
      border: '1px solid #b3d9ff',
      borderRadius: '4px',
      padding: '15px',
      marginBottom: '20px',
      fontSize: '14px'
    },
    errorList: {
      backgroundColor: '#f8d7da',
      border: '1px solid #f5c6cb',
      borderRadius: '4px',
      padding: '15px',
      marginBottom: '20px'
    },
    errorItem: {
      fontSize: '13px',
      color: '#721c24',
      marginBottom: '5px'
    }
  };

  return (
    <div style={styles.container}>
      {/* Messages d'alerte */}
      {success && (
        <div style={{...styles.alert, ...styles.alertSuccess}}>
          {success}
        </div>
      )}
      
      {error && (
        <div style={{...styles.alert, ...styles.alertError}}>
          {error}
        </div>
      )}

      {/* En-tête */}
      <div style={styles.header}>
        <h1 style={styles.title}>
          <span style={styles.icon}></span>
          Gestion des Employés
        </h1>
        <div style={styles.headerButtons}>
          <input
            type="file"
            id="excel-import"
            style={styles.hiddenInput}
            accept=".xlsx,.xls,.csv"
            onChange={(e) => {
              if (e.target.files[0]) {
                handleExcelImport(e.target.files[0]);
                e.target.value = '';
              }
            }}
          />
          <button 
            style={styles.importButton} 
            onClick={() => document.getElementById('excel-import').click()}
            disabled={loading}
          >
            <span style={{marginRight: '8px'}}></span>
            Importer Excel
          </button>
          {selectedEmployes.size > 0 && (
            <button 
              style={styles.bulkDeleteButton} 
              onClick={() => setShowBulkDeleteModal(true)}
              disabled={loading}
            >
              <span style={{marginRight: '8px'}}></span>
              Supprimer ({selectedEmployes.size})
            </button>
          )}
          <button 
            style={styles.addButton} 
            onClick={openAddModal}
            disabled={loading}
          >
            <span style={{marginRight: '8px'}}></span>
            Nouveau Employé
          </button>
        </div>
      </div>

      {/* Information sur la sélection */}
      {selectedEmployes.size > 0 && (
        <div style={styles.selectionInfo}>
          <span>
            <strong>{selectedEmployes.size}</strong> employé(s) sélectionné(s)
          </span>
          <button 
            style={styles.clearSelectionButton}
            onClick={clearSelection}
          >
            Désélectionner tout
          </button>
        </div>
      )}

      {/* Barre de recherche et filtres */}
      <div style={styles.searchContainer}>
        <input
          type="text"
          placeholder="Rechercher par matricule ou nom complet..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.input}
        />
        <select
          value={filterDepartement}
          onChange={(e) => setFilterDepartement(e.target.value)}
          style={styles.select}
        >
          <option value="">Tous les départements</option>
          {departements.map((departement) => (
            <option key={departement} value={departement}>
              {departement}
            </option>
          ))}
        </select>
      </div>

      {/* Tableau des employés */}
      <div style={styles.tableContainer}>
        {loading ? (
          <div style={styles.noData}>Chargement des données...</div>
        ) : employes.length === 0 ? (
          <div>
            <table style={styles.table}>
              <thead style={styles.tableHeader}>
                <tr>
                  <th style={styles.thCheckbox}>
                    <input
                      type="checkbox"
                      style={styles.checkbox}
                      checked={selectAll}
                      onChange={handleSelectAll}
                      disabled={employes.length === 0}
                    />
                  </th>
                  <th style={styles.th}>Matricule</th>
                  <th style={styles.th}>Nom et Prénom</th>
                  <th style={styles.th}>Fonction</th>
                  <th style={styles.th}>Département</th>
                  <th style={styles.th}>Site</th>
                  <th style={styles.th}>Email</th>
                  <th style={styles.th}>Statut</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
            </table>
            <div style={styles.noData}>
              {error ? 'Erreur lors du chargement des données.' : 'Aucun employé trouvé. Cliquez sur "Nouveau Employé" pour commencer.'}
            </div>
          </div>
        ) : (
          <table style={styles.table}>
            <thead style={styles.tableHeader}>
              <tr>
                <th style={styles.thCheckbox}>
                  <input
                    type="checkbox"
                    style={styles.checkbox}
                    checked={selectAll}
                    onChange={handleSelectAll}
                  />
                </th>
                <th style={styles.th}>Matricule</th>
                <th style={styles.th}>Nom et Prénom</th>
                <th style={styles.th}>Fonction</th>
                <th style={styles.th}>Département</th>
                <th style={styles.th}>Site</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Statut</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employes.map((employe) => (
                <tr key={employe.id}>
                  <td style={styles.tdCheckbox}>
                    <input
                      type="checkbox"
                      style={styles.checkbox}
                      checked={selectedEmployes.has(employe.id)}
                      onChange={() => handleSelectEmploye(employe.id)}
                    />
                  </td>
                  <td style={styles.td}>{employe.matricule}</td>
                  <td style={styles.td}>{employe.nom_complet}</td>
                  <td style={styles.td}>{employe.fonction}</td>
                  <td style={styles.td}>{employe.departement}</td>
                  <td style={styles.td}>{employe.site}</td>
                  <td style={styles.td}>{employe.email || '-'}</td>
                  <td style={styles.td}>
                    <span
                      style={{
                        ...styles.badge,
                        ...(employe.statut === 'Actif' ? styles.badgeActif : styles.badgeInactif)
                      }}
                    >
                      {employe.statut}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <button
                      style={{...styles.actionButton, ...styles.editButton}}
                      onClick={() => handleEdit(employe)}
                      disabled={loading}
                    >
                      Modifier
                    </button>
                    <button
                      style={{...styles.actionButton, ...styles.deleteButton}}
                      onClick={() => handleDelete(employe.id, employe.matricule)}
                      disabled={loading}
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal d'ajout/modification */}
      {showModal && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                {editMode ? 'Modifier un employé' : 'Ajouter un nouvel employé'}
              </h2>
              <button style={styles.closeButton} onClick={closeModal}>
                ×
              </button>
            </div>

            <div>
              <div style={styles.formGrid}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Matricule *</label>
                  <input
                    type="text"
                    name="matricule"
                    value={formData.matricule}
                    onChange={handleInputChange}
                    style={styles.formInput}
                    required
                    disabled={loading}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Nom et Prénom *</label>
                  <input
                    type="text"
                    name="nom_complet"
                    value={formData.nom_complet}
                    onChange={handleInputChange}
                    style={styles.formInput}
                    placeholder="Ex: RAKOTO Jean Pierre"
                    required
                    disabled={loading}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Fonction *</label>
                  <input
                    type="text"
                    name="fonction"
                    value={formData.fonction}
                    onChange={handleInputChange}
                    style={styles.formInput}
                    placeholder="Saisir la fonction"
                    required
                    disabled={loading}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Département *</label>
                  <select
                    name="departement"
                    value={formData.departement}
                    onChange={handleInputChange}
                    style={styles.formSelect}
                    required
                    disabled={loading}
                  >
                    <option value="">Sélectionner un département</option>
                    {departements.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Site *</label>
                  <select
                    name="site"
                    value={formData.site}
                    onChange={handleInputChange}
                    style={styles.formSelect}
                    required
                    disabled={loading}
                  >
                    <option value="">Sélectionner un site</option>
                    {sites.map((site) => (
                      <option key={site} value={site}>
                        {site}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    style={styles.formInput}
                    disabled={loading}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Statut *</label>
                  <select
                    name="statut"
                    value={formData.statut}
                    onChange={handleInputChange}
                    style={styles.formSelect}
                    required
                    disabled={loading}
                  >
                    <option value="Actif">Actif</option>
                    <option value="Inactif">Inactif</option>
                  </select>
                </div>
              </div>

              <div style={styles.modalActions}>
                <button type="button" style={styles.cancelButton} onClick={closeModal} disabled={loading}>
                  Annuler
                </button>
                <button type="button" style={styles.submitButton} onClick={handleSubmit} disabled={loading}>
                  {loading ? (editMode ? 'Mise à jour...' : 'Ajout...') : (editMode ? 'Mettre à jour' : 'Ajouter')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmation de suppression en lot */}
      {showBulkDeleteModal && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Confirmer la suppression en lot</h2>
              <button style={styles.closeButton} onClick={() => setShowBulkDeleteModal(false)}>
                ×
              </button>
            </div>

            <div>
              <div style={styles.importInfo}>
                <p><strong>Attention :</strong> Vous êtes sur le point de supprimer <strong>{selectedEmployes.size}</strong> employé(s).</p>
                <p>Cette action est irréversible. Êtes-vous sûr de vouloir continuer ?</p>
              </div>

              <div style={{marginBottom: '20px'}}>
                <h4>Employés sélectionnés pour suppression :</h4>
                <div style={{maxHeight: '200px', overflow: 'auto', border: '1px solid #ddd', borderRadius: '4px', padding: '10px'}}>
                  {employes
                    .filter(emp => selectedEmployes.has(emp.id))
                    .map(emp => (
                      <div key={emp.id} style={{marginBottom: '5px', fontSize: '14px'}}>
                        • {emp.matricule} - {emp.nom_complet} ({emp.departement})
                      </div>
                    ))
                  }
                </div>
              </div>

              <div style={styles.modalActions}>
                <button 
                  style={styles.cancelButton} 
                  onClick={() => setShowBulkDeleteModal(false)}
                  disabled={loading}
                >
                  Annuler
                </button>
                <button 
                  style={styles.dangerButton} 
                  onClick={handleBulkDelete}
                  disabled={loading}
                >
                  {loading ? 'Suppression...' : `Supprimer ${selectedEmployes.size} employé(s)`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'import Excel/CSV */}
      {showImportModal && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Importer des employés depuis CSV/Excel</h2>
              <button style={styles.closeButton} onClick={closeImportModal}>
                ×
              </button>
            </div>

            <div>
              {importErrors.length > 0 && (
                <div style={styles.errorList}>
                  <h4 style={{marginTop: 0, color: '#721c24'}}>Erreurs de validation :</h4>
                  {importErrors.map((error, index) => (
                    <div key={index} style={styles.errorItem}>{error}</div>
                  ))}
                </div>
              )}

              {importData.length > 0 && (
                <div style={styles.importInfo}>
                  <h4 style={{marginTop: 0}}>Données prêtes à importer :</h4>
                  <p>{importData.length} employé(s) valide(s) trouvé(s)</p>
                </div>
              )}

              {importPreview.length > 0 && (
                <div>
                  <h4>Aperçu des données (10 premiers éléments) :</h4>
                  <div style={{overflow: 'auto', maxHeight: '300px'}}>
                    <table style={styles.table}>
                      <thead style={styles.tableHeader}>
                        <tr>
                          <th style={styles.th}>Matricule</th>
                          <th style={styles.th}>Nom complet</th>
                          <th style={styles.th}>Fonction</th>
                          <th style={styles.th}>Département</th>
                          <th style={styles.th}>Site</th>
                          <th style={styles.th}>Email</th>
                          <th style={styles.th}>Statut</th>
                        </tr>
                      </thead>
                      <tbody>
                        {importPreview.map((item, index) => (
                          <tr key={index}>
                            <td style={styles.td}>{item.matricule}</td>
                            <td style={styles.td}>{item.nom_complet}</td>
                            <td style={styles.td}>{item.fonction}</td>
                            <td style={styles.td}>{item.departement}</td>
                            <td style={styles.td}>{item.site}</td>
                            <td style={styles.td}>{item.email}</td>
                            <td style={styles.td}>{item.statut}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div style={styles.modalActions}>
                <button style={styles.cancelButton} onClick={closeImportModal} disabled={loading}>
                  Annuler
                </button>
                {importData.length > 0 && (
                  <button 
                    style={styles.confirmButton} 
                    onClick={confirmImport} 
                    disabled={loading}
                  >
                    {loading ? 'Import en cours...' : `Importer ${importData.length} employé(s)`}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal pour saisie manuelle de données */}
      {showTextImport && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Coller les données Excel</h2>
              <button style={styles.closeButton} onClick={() => setShowTextImport(false)}>
                ×
              </button>
            </div>

            <div>
              <div style={styles.importInfo}>
                <h4 style={{marginTop: 0}}>Instructions :</h4>
                <p>1. Ouvrez votre fichier Excel</p>
                <p>2. Sélectionnez toutes les données (en-têtes inclus)</p>
                <p>3. Copiez (Ctrl+C) et collez dans la zone ci-dessous</p>
                <p>4. Les colonnes acceptées : Matricule, Nom_complet (ou Nom), Fonction, Departement, Site, Email, Statut</p>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Données Excel (copiées-collées) :</label>
                <textarea
                  value={textImportData}
                  onChange={(e) => setTextImportData(e.target.value)}
                  style={{
                    ...styles.formInput,
                    height: '200px',
                    resize: 'vertical'
                  }}
                  placeholder="Collez ici vos données Excel..."
                />
              </div>

              <div style={styles.modalActions}>
                <button style={styles.cancelButton} onClick={() => setShowTextImport(false)}>
                  Annuler
                </button>
                <button 
                  style={styles.confirmButton} 
                  onClick={() => handleTextImport(textImportData)}
                  disabled={!textImportData.trim()}
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

export default GestionEmployes;