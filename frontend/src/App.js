// src/App.js

import React, { useState } from 'react';

// Import des composants
import TableauDeBord from './components/TableauDeBord';
import GestionMateriel from './components/GestionMateriel';
import GestionPannes from './components/GestionPannes';
import GestionEmployes from './components/GestionEmployes';
import GestionReclamations from './components/GestionReclamations';
import HistoriqueInterventions from './components/HistoriqueInterventions';
import GestionStock from './components/GestionStock';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null); // 'employee' ou 'admin'
  const [role, setRole] = useState('employee');
  const [password, setPassword] = useState('');

  // Codes d'accès (vous pouvez les stocker ailleurs pour plus de sécurité)
  const ACCESS_CODES = {
    employee: '1234',
    admin: '4321'
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (role === 'employee' && password === ACCESS_CODES.employee) {
      setIsLoggedIn(true);
      setUserRole('employee');
    } else if ((role === 'chef' || role === 'technicien') && password === ACCESS_CODES.admin) {
      setIsLoggedIn(true);
      setUserRole('admin');
    } else {
      alert("Identifiants incorrects. Veuillez réessayer.");
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole(null);
    setPassword('');
    setRole('employee');
  };

  // Définition des onglets en fonction du rôle de l'utilisateur
  const getTabs = () => {
    if (userRole === 'employee') {
      // Les employés n'ont accès qu'aux réclamations
      return [
        { id: 'reclamations', label: 'Réclamations', component: GestionReclamations },
      ];
    }

    if (userRole === 'admin') {
      return [
        { id: 'tableau', label: 'Tableau de bord', component: TableauDeBord },
        { id: 'pannes', label: 'Pannes', component: GestionPannes },
        { id: 'reclamations', label: 'Réclamations', component: GestionReclamations },
        { id: 'materiel', label: 'Matériel', component: GestionMateriel },
        { id: 'employes', label: 'Employés', component: GestionEmployes },
        { id: 'historique', label: 'Historique', component: HistoriqueInterventions },
        { id: 'stock', label: 'Stock', component: GestionStock },
      ];
    }

    return [];
  };

  const TabButton = ({ id, label, isActive, onClick }) => (
    <button
      onClick={onClick}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
        isActive 
          ? 'bg-gray-600 text-white shadow-md' 
          : 'bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-600'
      }`}
    >
      <span className="font-medium">{label}</span>
    </button>
  );

  const Header = ({ onLogout, tabs, activeTab, setActiveTab }) => (
    <div className="bg-gradient-to-r from-gray-700 to-gray-800 text-white">
      <div className="bg-white p-6 rounded-t-lg shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">GESTION DU PARC INFORMATIQUE</h1>
              <p className="text-gray-600">Société JIRAMA BOENY - Système de gestion centralisée du matériel informatique</p>
            </div>
          </div>
          <button 
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
            onClick={onLogout}
          >
            Déconnexion
          </button>
        </div>
      </div>
      {tabs.length > 1 && (
        <div className="bg-white px-6 py-4 shadow-sm">
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {tabs.map(tab => (
              <TabButton 
                key={tab.id}
                id={tab.id} 
                label={tab.label} 
                isActive={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderContent = (activeTab, tabs) => {
    const activeComponent = tabs.find(tab => tab.id === activeTab)?.component;
    return activeComponent ? React.createElement(activeComponent) : (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Module en développement</h3>
        <p className="text-gray-600">Cette fonctionnalité sera bientôt disponible.</p>
      </div>
    );
  };
  
  const [activeTab, setActiveTab] = useState(() => {
    // Définir l'onglet par défaut selon le rôle
    return userRole === 'employee' ? 'reclamations' : 'tableau';
  });

  // Mettre à jour l'onglet actif quand l'utilisateur se connecte
  React.useEffect(() => {
    if (isLoggedIn) {
      const tabs = getTabs();
      if (tabs.length > 0) {
        setActiveTab(tabs[0].id);
      }
    }
  }, [isLoggedIn, userRole]);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full transform transition-all hover:scale-105 duration-300">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">Connexion</h2>
          <p className="text-center text-gray-500 mb-8">Accédez à votre espace de gestion</p>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">Type d'utilisateur</label>
              <div className="relative">
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-gray-500 focus:border-gray-500 appearance-none transition-colors"
                >
                  <option value="employee">Employé</option>
                  <option value="technicien">Technicien</option>
                  <option value="chef">Chef</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 3a1 1 0 01.707.293l5 5a1 1 0 01-1.414 1.414L10 5.414 5.707 9.707a1 1 0 01-1.414-1.414l5-5A1 1 0 0110 3z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Code d'accès</label>
              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:ring-gray-500 focus:border-gray-500 transition-colors"
                placeholder="Entrez votre code"
              />
            </div>
            
            <button
              type="submit"
              className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Se connecter
            </button>
          </form>
        </div>
      </div>
    );
  }

  const tabs = getTabs();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-700 to-gray-800">
      <Header 
        onLogout={handleLogout} 
        tabs={tabs} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
      />
      <div className="p-6">
        {renderContent(activeTab, tabs)}
      </div>
    </div>
  );
};

export default App;