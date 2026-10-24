import { Navigate, Route, Routes } from 'react-router';
import RouteProtegee from './components/RouteProtegee.jsx';
import RouteRole from './components/RouteRole.jsx';
import MenuLayout from './components/MenuLayout.jsx';
import FocusLayout from './components/FocusLayout.jsx';
import Connexion from './pages/Connexion.jsx';
import ListeDvds from './pages/ListeDvds.jsx';
import DetailDvd from './pages/DetailDvd.jsx';
import AjoutDvd from './pages/AjoutDvd.jsx';
import ModificationDvd from './pages/ModificationDvd.jsx';
import SuppressionDvd from './pages/SuppressionDvd.jsx';
import AppropriationDvd from './pages/AppropriationDvd.jsx';
import Personnalisation from './pages/Personnalisation.jsx';
import EnvoiCourriel from './pages/EnvoiCourriel.jsx';
import BoiteEnvoi from './pages/BoiteEnvoi.jsx';
import GestionUtilisateurs from './pages/GestionUtilisateurs.jsx';
import FormulaireUtilisateur from './pages/FormulaireUtilisateur.jsx';
import Introuvable from './pages/Introuvable.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/connexion" element={<Connexion />} />

      <Route element={<RouteProtegee />}>
        <Route element={<MenuLayout />}>
          <Route index element={<Navigate to="/dvds" replace />} />
          <Route path="dvds" element={<ListeDvds key="tous" portee="tous" />} />
          <Route path="dvds/utilisateurs" element={<ListeDvds key="utilisateur" portee="utilisateur" />} />
          <Route path="courriel" element={<EnvoiCourriel />} />
          <Route path="courriels" element={<BoiteEnvoi />} />

          <Route element={<RouteRole roles={['U', 'S']} />}>
            <Route path="dvds/en-main" element={<ListeDvds key="en-main" portee="en-main" />} />
            <Route path="personnalisation" element={<Personnalisation />} />
          </Route>

          <Route element={<RouteRole roles={['A']} />}>
            <Route path="administration/utilisateurs" element={<GestionUtilisateurs />} />
            <Route path="administration/utilisateurs/nouveau" element={<FormulaireUtilisateur />} />
            <Route path="administration/utilisateurs/:id" element={<FormulaireUtilisateur />} />
          </Route>

          <Route path="*" element={<Introuvable />} />
        </Route>

        <Route element={<FocusLayout />}>
          <Route element={<RouteRole roles={['U', 'S']} />}>
            <Route path="dvds/ajout" element={<AjoutDvd />} />
            <Route path="dvds/:id/appropriation" element={<AppropriationDvd />} />
          </Route>
          <Route path="dvds/:id" element={<DetailDvd />} />
          <Route path="dvds/:id/modifier" element={<ModificationDvd />} />
          <Route path="dvds/:id/supprimer" element={<SuppressionDvd />} />
        </Route>

      </Route>
    </Routes>
  );
}
