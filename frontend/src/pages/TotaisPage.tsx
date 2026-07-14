import { useEffect, useState } from "react";

import { totaisService } from "../services/totaisService";
import type { MensagemFeedback } from "../types/Mensagem";
import type { ConsultaTotais } from "../types/Totais";
import { formatarMoeda } from "../utils/formatarMoeda";

export function TotaisPage() {
  const [totais, setTotais] =
    useState<ConsultaTotais | null>(null);

  const [mensagem, setMensagem] =
    useState<MensagemFeedback | null>(null);

  const [carregandoPagina, setCarregandoPagina] =
    useState(true);

  useEffect(() => {
    let componenteAtivo = true;

    async function carregarTotais() {
      try {
        const dados = await totaisService.consultar();

        if (componenteAtivo) {
          setTotais(dados);
        }
      } catch {
        if (componenteAtivo) {
          setMensagem({
            texto:
              "Não foi possível carregar os totais.",
            tipo: "erro",
          });
        }
      } finally {
        if (componenteAtivo) {
          setCarregandoPagina(false);
        }
      }
    }

    void carregarTotais();

    return () => {
      componenteAtivo = false;
    };
  }, []);

  return (
    <main className="pagina">
      <header className="cabecalho">
        <div>
          <span className="etiqueta">
            Controle residencial
          </span>

          <h1>Totais</h1>

          <p>
            Resumo financeiro por pessoa e total geral.
          </p>
        </div>
      </header>

      {mensagem && (
        <section className="cartao">
          <p
            className={`mensagem ${mensagem.tipo}`}
            role="alert"
            aria-live="polite"
          >
            {mensagem.texto}
          </p>
        </section>
      )}

      {carregandoPagina ? (
        <section className="cartao">
          <p>Carregando totais...</p>
        </section>
      ) : totais ? (
        <>
          <section className="resumo-geral">
            <article className="cartao-total">
              <span>Receitas gerais</span>

              <strong className="valor-receita">
                {formatarMoeda(
                  totais.totalGeralReceitas
                )}
              </strong>
            </article>

            <article className="cartao-total">
              <span>Despesas gerais</span>

              <strong className="valor-despesa">
                {formatarMoeda(
                  totais.totalGeralDespesas
                )}
              </strong>
            </article>

            <article className="cartao-total">
              <span>Saldo líquido</span>

              <strong
                className={
                  totais.saldoLiquidoGeral >= 0
                    ? "valor-receita"
                    : "valor-despesa"
                }
              >
                {formatarMoeda(
                  totais.saldoLiquidoGeral
                )}
              </strong>
            </article>
          </section>

          <section className="cartao">
            <div className="titulo-lista">
              <h2>Totais por pessoa</h2>

              <span>
                {totais.pessoas.length} registro(s)
              </span>
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
                          {formatarMoeda(
                            pessoa.totalReceitas
                          )}
                        </td>

                        <td className="valor-despesa">
                          {formatarMoeda(
                            pessoa.totalDespesas
                          )}
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
        </>
      ) : null}
    </main>
  );
}