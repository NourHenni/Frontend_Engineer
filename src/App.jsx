import "./App.css";
import Matieres from "./pages/matieres/Matieres";
import Navbar from "./components/navbar/Navbar";
import SidebarLayout from "./components/sidebar/Sidebar";
import FormModal from "./components/modals/FormModal";
import TableData from "./components/table/TableData";
import ButtonModel from "./components/button/Button";
import Pfa from "./pages/pfa/Pfa";

function App() {
  return (
   /* <>
      <Navbar />
      <SidebarLayout />
      <ButtonModel />
      <TableData />
      <FormModal />
    </>*/
    <Matieres />
  );
}

export default App;
