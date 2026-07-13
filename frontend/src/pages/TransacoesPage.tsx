import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import axios from "axios";

import { api } from "../api/api";
import type { Pessoa } from "../types/Pessoa";
import {
  TipoTransacao,
  type CriarTransacao,
  type Transacao,
} from "../types/Transacao";

async function buscarPessoas(): Promise<Pessoa[]> {
  const resposta = await api.get<Pessoa[]>("/pessoas");
  return resposta.data;
}

async function buscarTransacoes(): Promise<Transacao[]> {
  const resposta = await api.get<Transacao[]>("/transacoes");
  return resposta.data;
}

export function TransacoesPage() {
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);

  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [tipo, setTipo] = useState<TipoTransacao>(
    TipoTransacao.Despesa
  );
  const [pessoaId, setPessoaId] = useState("");

  const [mensagem, setMensagem] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState<
  "sucesso" | "erro" | ""
>("");
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let componenteAtivo = true;

    Promise.all([buscarPessoas(), buscarTransacoes()])
      .then(([pessoasRecebidas, transacoesRecebidas]) => {
        if (!componenteAtivo) {
          return;
        }

        setPessoas(pessoasRecebidas);
        setTransacoes(transacoesRecebidas);
      })
     .catch(() => {
  if (componenteAtivo) {
    setMensagem("Não foi possível carregar os dados.");
    setTipoMensagem("erro");
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

  async function atualizarTransacoes() {
    const dados = await buscarTransacoes();
    setTransacoes(dados);
  }

 async function cadastrarTransacao(
  evento: FormEvent<HTMLFormElement>
) {
  evento.preventDefault();

  setMensagem("");
  setTipoMensagem("");

  const descricaoTratada = descricao.trim();
  const valorNumerico = Number(valor);
  const pessoaIdNumerico = Number(pessoaId);

  if (descricaoTratada.length < 2) {
    setMensagem(
      "Informe uma descrição com pelo menos 2 caracteres."
    );
    setTipoMensagem("erro");
    return;
  }

  if (!Number.isFinite(valorNumerico) || valorNumerico <= 0) {
    setMensagem("Informe um valor maior que zero.");
    setTipoMensagem("erro");
    return;
  }

  if (
    !Number.isInteger(pessoaIdNumerico) ||
    pessoaIdNumerico <= 0
  ) {
    setMensagem("Selecione uma pessoa.");
    setTipoMensagem("erro");
    return;
  }

  const novaTransacao: CriarTransacao = {
    descricao: descricaoTratada,
    valor: valorNumerico,
    tipo,
    pessoaId: pessoaIdNumerico,
  };

  try {
    setCarregando(true);

    await api.post("/transacoes", novaTransacao);

    setDescricao("");
    setValor("");
    setTipo(TipoTransacao.Despesa);
    setPessoaId("");

    setMensagem("Transação cadastrada com sucesso.");
    setTipoMensagem("sucesso");

    await atualizarTransacoes();
  } catch (erro) {
    if (axios.isAxiosError(erro)) {
      const mensagemApi = erro.response?.data?.mensagem;

      setMensagem(
        mensagemApi ?? "Não foi possível cadastrar a transação."
      );
    } else {
      setMensagem("Não foi possível cadastrar a transação.");
    }

    setTipoMensagem("erro");
  } finally {
    setCarregando(false);
  }
}

  function formatarMoeda(valorRecebido: number) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valorRecebido);
  }

  return (
    <main className="pagina">
      <header className="cabecalho">
        <div>
          <span className="etiqueta">Controle residencial</span>
          <h1>Transações</h1>
          <p>Cadastre receitas e despesas das pessoas.</p>
        </div>
      </header>

      <section className="cartao">
        <h2>Nova transação</h2>

        {pessoas.length === 0 ? (
          <p>Cadastre pelo menos uma pessoa antes de criar uma transação.</p>
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
                  setMensagem("");
                  setTipoMensagem("");
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
                  setMensagem("");
                  setTipoMensagem("");
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
                  setTipo(Number(evento.target.value) as TipoTransacao);
                  setMensagem("");
                  setTipoMensagem("");
                }}
              >
                <option value={TipoTransacao.Despesa}>Despesa</option>
                <option value={TipoTransacao.Receita}>Receita</option>
              </select>
            </label>

            <label>
              Pessoa
              <select
                value={pessoaId}
                onChange={(evento) => {
                  setPessoaId(evento.target.value);
                  setMensagem("");
                  setTipoMensagem("");
                }}
              >
                <option value="">Selecione</option>

                {pessoas.map((pessoa) => (
                  <option key={pessoa.id} value={pessoa.id}>
                    {pessoa.nome} — {pessoa.idade} anos
                  </option>
                ))}
              </select>
            </label>

            <button type="submit" disabled={carregando}>
              {carregando ? "Aguarde..." : "Cadastrar"}
            </button>
          </form>
        )}

        {mensagem && <p className={`mensagem ${tipoMensagem}`}>{mensagem}</p>}
      </section>

      <section className="cartao">
        <div className="titulo-lista">
          <h2>Transações cadastradas</h2>
          <span>{transacoes.length} registro(s)</span>
        </div>

        {carregando && transacoes.length === 0 ? (
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
                          transacao.tipo === TipoTransacao.Receita
                            ? "tipo receita"
                            : "tipo despesa"
                        }
                      >
                        {transacao.tipo === TipoTransacao.Receita
                          ? "Receita"
                          : "Despesa"}
                      </span>
                    </td>
                    <td>{formatarMoeda(transacao.valor)}</td>
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