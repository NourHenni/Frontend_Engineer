import "./App.css";
import Matiers from "../src/pages/matieres/Matieres";
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
    <Matiers/>
  );
}

export default App;
