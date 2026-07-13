import { NavLink, Navigate, Route, Routes } from "react-router-dom";

import "./App.css";
import { PessoasPage } from "./pages/PessoasPage";
import { TransacoesPage } from "./pages/TransacoesPage";
import { TotaisPage } from "./pages/TotaisPage";

function App() {
  return (
    <>
      <header className="menu-principal">
        <div className="menu-conteudo">
          <span className="nome-sistema">Controle de Gastos</span>

          <nav>
            <NavLink
              to="/pessoas"
              className={({ isActive }) =>
                isActive ? "menu-link ativo" : "menu-link"
              }
            >
              Pessoas
            </NavLink>

            <NavLink
              to="/transacoes"
              className={({ isActive }) =>
                isActive ? "menu-link ativo" : "menu-link"
              }
            >
              Transações
            </NavLink>

            <NavLink
              to="/totais"
              className={({ isActive }) =>
                isActive ? "menu-link ativo" : "menu-link"
              }
            >
              Totais
            </NavLink>
          </nav>
        </div>
      </header>

      <Routes>
        <Route path="/" element={<Navigate to="/pessoas" replace />} />
        <Route path="/pessoas" element={<PessoasPage />} />
        <Route path="/transacoes" element={<TransacoesPage />} />
        <Route path="/totais" element={<TotaisPage />} />
        <Route path="*" element={<Navigate to="/pessoas" replace />} />
      </Routes>
    </>
  );
}

export default App;