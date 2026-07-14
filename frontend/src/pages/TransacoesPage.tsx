import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import { pessoasService } from "../services/pessoasService";
import { transacoesService } from "../services/transacoesService";
import type { MensagemFeedback } from "../types/Mensagem";
import type { Pessoa } from "../types/Pessoa";
import {
  TipoTransacao,
  type CriarTransacao,
  type Transacao,
} from "../types/Transacao";
import { formatarMoeda } from "../utils/formatarMoeda";

export function TransacoesPage() {
  const [transacoes, setTransacoes] = useState<
    Transacao[]
  >([]);

  const [pessoas, setPessoas] = useState<Pessoa[]>([]);

  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [tipo, setTipo] = useState<TipoTransacao>(
    TipoTransacao.Despesa
  );
  const [pessoaId, setPessoaId] = useState("");

  const [mensagem, setMensagem] =
    useState<MensagemFeedback | null>(null);

  const [carregandoPagina, setCarregandoPagina] =
    useState(true);

  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    let componenteAtivo = true;

    async function carregarDados() {
      try {
        const [
          pessoasRecebidas,
          transacoesRecebidas,
        ] = await Promise.all([
          pessoasService.listar(),
          transacoesService.listar(),
        ]);

        if (!componenteAtivo) {
          return;
        }

        setPessoas(pessoasRecebidas);
        setTransacoes(transacoesRecebidas);
      } catch {
        if (componenteAtivo) {
          setMensagem({
            texto: "Não foi possível carregar os dados.",
            tipo: "erro",
          });
        }
      } finally {
        if (componenteAtivo) {
          setCarregandoPagina(false);
        }
      }
    }

    void carregarDados();

    return () => {
      componenteAtivo = false;
    };
  }, []);

  async function cadastrarTransacao(
    evento: FormEvent<HTMLFormElement>
  ) {
    evento.preventDefault();
    setMensagem(null);

    const descricaoTratada = descricao.trim();
    const valorNumerico = Number(valor);
    const pessoaIdNumerico = Number(pessoaId);

    if (descricaoTratada.length < 2) {
      setMensagem({
        texto:
          "Informe uma descrição com pelo menos 2 caracteres.",
        tipo: "erro",
      });

      return;
    }

    if (
      valor.trim() === "" ||
      !Number.isFinite(valorNumerico) ||
      valorNumerico <= 0
    ) {
      setMensagem({
        texto: "Informe um valor maior que zero.",
        tipo: "erro",
      });

      return;
    }

    if (
      pessoaId.trim() === "" ||
      !Number.isInteger(pessoaIdNumerico) ||
      pessoaIdNumerico <= 0
    ) {
      setMensagem({
        texto: "Selecione uma pessoa.",
        tipo: "erro",
      });

      return;
    }

    const novaTransacao: CriarTransacao = {
      descricao: descricaoTratada,
      valor: valorNumerico,
      tipo,
      pessoaId: pessoaIdNumerico,
    };

    try {
      setEnviando(true);

      const transacaoCriada =
        await transacoesService.criar(novaTransacao);

      setTransacoes((transacoesAtuais) => [
        transacaoCriada,
        ...transacoesAtuais,
      ]);

      setDescricao("");
      setValor("");
      setTipo(TipoTransacao.Despesa);
      setPessoaId("");

      setMensagem({
        texto: "Transação cadastrada com sucesso.",
        tipo: "sucesso",
      });
    } catch (erro) {
      setMensagem({
        texto:
          erro instanceof Error
            ? erro.message
            : "Não foi possível cadastrar a transação.",
        tipo: "erro",
      });
    } finally {
      setEnviando(false);
    }
  }

  function limparMensagem() {
    setMensagem(null);
  }

  return (
    <main className="pagina">
      <header className="cabecalho">
        <div>
          <span className="etiqueta">
            Controle residencial
          </span>

          <h1>Transações</h1>

          <p>
            Cadastre receitas e despesas das pessoas.
          </p>
        </div>
      </header>

      <section className="cartao">
        <h2>Nova transação</h2>

        {carregandoPagina ? (
          <p>Carregando dados...</p>
        ) : pessoas.length === 0 ? (
          <p>
            Cadastre pelo menos uma pessoa antes de criar
            uma transação.
          </p>
        ) : (
          <form
            className="formulario formulario-transacao"
            onSubmit={cadastrarTransacao}
            noValidate
          >
            <label>
              Descrição

              <input
                type="text"
                value={descricao}
                onChange={(evento) => {
                  setDescricao(evento.target.value);
                  limparMensagem();
                }}
                placeholder="Ex.: Conta de internet"
                maxLength={200}
              />
            </label>

            <label>
              Valor

              <input
                type="number"
                value={valor}
                onChange={(evento) => {
                  setValor(evento.target.value);
                  limparMensagem();
                }}
                placeholder="0,00"
                min="0.01"
                step="0.01"
              />
            </label>

            <label>
              Tipo

              <select
                value={tipo}
                onChange={(evento) => {
                  setTipo(
                    Number(
                      evento.target.value
                    ) as TipoTransacao
                  );

                  limparMensagem();
                }}
              >
                <option value={TipoTransacao.Despesa}>
                  Despesa
                </option>

                <option value={TipoTransacao.Receita}>
                  Receita
                </option>
              </select>
            </label>

            <label>
              Pessoa

              <select
                value={pessoaId}
                onChange={(evento) => {
                  setPessoaId(evento.target.value);
                  limparMensagem();
                }}
              >
                <option value="">Selecione</option>

                {pessoas.map((pessoa) => (
                  <option
                    key={pessoa.id}
                    value={pessoa.id}
                  >
                    {pessoa.nome} — {pessoa.idade} anos
                  </option>
                ))}
              </select>
            </label>

            <button type="submit" disabled={enviando}>
              {enviando
                ? "Cadastrando..."
                : "Cadastrar"}
            </button>
          </form>
        )}

        {mensagem && (
          <p
            className={`mensagem ${mensagem.tipo}`}
            role={
              mensagem.tipo === "erro"
                ? "alert"
                : "status"
            }
            aria-live="polite"
          >
            {mensagem.texto}
          </p>
        )}
      </section>

      <section className="cartao">
        <div className="titulo-lista">
          <h2>Transações cadastradas</h2>

          <span>{transacoes.length} registro(s)</span>
        </div>

        {carregandoPagina ? (
          <p>Carregando...</p>
        ) : transacoes.length === 0 ? (
          <p>Nenhuma transação cadastrada.</p>
        ) : (
          <div className="tabela-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Descrição</th>
                  <th>Pessoa</th>
                  <th>Tipo</th>
                  <th>Valor</th>
                </tr>
              </thead>

              <tbody>
                {transacoes.map((transacao) => (
                  <tr key={transacao.id}>
                    <td>#{transacao.id}</td>

                    <td>{transacao.descricao}</td>

                    <td>{transacao.pessoaNome}</td>

                    <td>
                      <span
                        className={
                          transacao.tipo ===
                          TipoTransacao.Receita
                            ? "tipo receita"
                            : "tipo despesa"
                        }
                      >
                        {transacao.tipo ===
                        TipoTransacao.Receita
                          ? "Receita"
                          : "Despesa"}
                      </span>
                    </td>

                    <td>
                      {formatarMoeda(transacao.valor)}
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