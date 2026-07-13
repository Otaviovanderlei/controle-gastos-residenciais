import { useEffect, useState } from "react";

import { api } from "../api/api";
import type { ConsultaTotais } from "../types/Totais";

async function buscarTotais(): Promise<ConsultaTotais> {
  const resposta = await api.get<ConsultaTotais>("/totais");
  return resposta.data;
}

function formatarMoeda(valor: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);
}

export function TotaisPage() {
  const [totais, setTotais] = useState<ConsultaTotais | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    let componenteAtivo = true;

    buscarTotais()
      .then((dados) => {
        if (componenteAtivo) {
          setTotais(dados);
        }
      })
      .catch(() => {
        if (componenteAtivo) {
          setMensagem("Não foi possível carregar os totais.");
        }
      })
      .finally(() => {
        if (componenteAtivo) {
          setCarregando(false);
        }
      });

    return () => {
      componenteAtivo = false;
    };
  }, []);

  if (carregando) {
    return (
      <main className="pagina">
        <p>Carregando totais...</p>
      </main>
    );
  }

  if (!totais) {
    return (
      <main className="pagina">
        <p className="mensagem">{mensagem}</p>
      </main>
    );
  }

  return (
    <main className="pagina">
      <header className="cabecalho">
        <div>
          <span className="etiqueta">Controle residencial</span>
          <h1>Totais</h1>
          <p>Resumo financeiro por pessoa e total geral.</p>
        </div>
      </header>

      <section className="resumo-geral">
        <article className="cartao-resumo">
          <span>Receitas gerais</span>
          <strong className="valor-receita">
            {formatarMoeda(totais.totalGeralReceitas)}
          </strong>
        </article>

        <article className="cartao-resumo">
          <span>Despesas gerais</span>
          <strong className="valor-despesa">
            {formatarMoeda(totais.totalGeralDespesas)}
          </strong>
        </article>

        <article className="cartao-resumo">
          <span>Saldo líquido</span>
          <strong
            className={
              totais.saldoLiquidoGeral >= 0
                ? "valor-receita"
                : "valor-despesa"
            }
          >
            {formatarMoeda(totais.saldoLiquidoGeral)}
          </strong>
        </article>
      </section>

      <section className="cartao">
        <div className="titulo-lista">
          <h2>Totais por pessoa</h2>
          <span>{totais.pessoas.length} registro(s)</span>
        </div>

        {totais.pessoas.length === 0 ? (
          <p>Nenhuma pessoa cadastrada.</p>
        ) : (
          <div className="tabela-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nome</th>
                  <th>Receitas</th>
                  <th>Despesas</th>
                  <th>Saldo</th>
                </tr>
              </thead>

              <tbody>
                {totais.pessoas.map((pessoa) => (
                  <tr key={pessoa.pessoaId}>
                    <td>#{pessoa.pessoaId}</td>
                    <td>{pessoa.nome}</td>
                    <td className="valor-receita">
                      {formatarMoeda(pessoa.totalReceitas)}
                    </td>
                    <td className="valor-despesa">
                      {formatarMoeda(pessoa.totalDespesas)}
                    </td>
                    <td
                      className={
                        pessoa.saldo >= 0
                          ? "valor-receita"
                          : "valor-despesa"
                      }
                    >
                      {formatarMoeda(pessoa.saldo)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}