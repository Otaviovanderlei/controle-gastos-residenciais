import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import { api } from "../api/api";
import type { CriarPessoa, Pessoa } from "../types/Pessoa";

async function buscarPessoas(): Promise<Pessoa[]> {
  const resposta = await api.get<Pessoa[]>("/pessoas");
  return resposta.data;
}

export function PessoasPage() {
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [nome, setNome] = useState("");
  const [idade, setIdade] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState<
    "sucesso" | "erro" | ""
  >("");
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let componenteAtivo = true;

    buscarPessoas()
      .then((dados) => {
        if (componenteAtivo) {
          setPessoas(dados);
        }
      })
      .catch(() => {
        if (componenteAtivo) {
          setMensagem("Não foi possível carregar as pessoas.");
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

  async function carregarPessoas() {
    const dados = await buscarPessoas();
    setPessoas(dados);
  }

  async function cadastrarPessoa(
    evento: FormEvent<HTMLFormElement>
  ) {
    evento.preventDefault();

    setMensagem("");
    setTipoMensagem("");

    const nomeTratado = nome.trim();
    const idadeNumerica = Number(idade);

    if (nomeTratado.length < 2) {
      setMensagem("Informe um nome com pelo menos 2 caracteres.");
      setTipoMensagem("erro");
      return;
    }

    if (
      !Number.isInteger(idadeNumerica) ||
      idadeNumerica < 0 ||
      idadeNumerica > 130
    ) {
      setMensagem("Informe uma idade válida entre 0 e 130 anos.");
      setTipoMensagem("erro");
      return;
    }

    const novaPessoa: CriarPessoa = {
      nome: nomeTratado,
      idade: idadeNumerica,
    };

    try {
      setCarregando(true);

      await api.post("/pessoas", novaPessoa);

      setNome("");
      setIdade("");
      setMensagem("Pessoa cadastrada com sucesso.");
      setTipoMensagem("sucesso");

      await carregarPessoas();
    } catch {
      setMensagem("Não foi possível cadastrar a pessoa.");
      setTipoMensagem("erro");
    } finally {
      setCarregando(false);
    }
  }

  async function excluirPessoa(pessoa: Pessoa) {
    setMensagem("");
    setTipoMensagem("");

    const confirmou = window.confirm(
      `Excluir ${pessoa.nome}? Todas as transações dessa pessoa também serão apagadas.`
    );

    if (!confirmou) {
      return;
    }

    try {
      setCarregando(true);

      await api.delete(`/pessoas/${pessoa.id}`);

      setMensagem("Pessoa excluída com sucesso.");
      setTipoMensagem("sucesso");

      await carregarPessoas();
    } catch {
      setMensagem("Não foi possível excluir a pessoa.");
      setTipoMensagem("erro");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="pagina">
      <header className="cabecalho">
        <div>
          <span className="etiqueta">Controle residencial</span>
          <h1>Pessoas</h1>
          <p>Cadastre e gerencie as pessoas da residência.</p>
        </div>
      </header>

      <section className="cartao">
        <h2>Nova pessoa</h2>

        <form
  className="formulario"
  onSubmit={cadastrarPessoa}
  noValidate
>
  <label>
    Nome
    <input
      type="text"
      value={nome}
      onChange={(evento) => {
        setNome(evento.target.value);
        setMensagem("");
        setTipoMensagem("");
      }}
      placeholder="Digite o nome"
      maxLength={100}
    />
  </label>

  <label>
    Idade
    <input
      type="number"
      value={idade}
      onChange={(evento) => {
        setIdade(evento.target.value);
        setMensagem("");
        setTipoMensagem("");
      }}
      placeholder="Digite a idade"
      min={0}
      max={130}
    />
  </label>

  <button type="submit" disabled={carregando}>
    {carregando ? "Aguarde..." : "Cadastrar"}
  </button>
</form>

        {mensagem && (
          <p className={`mensagem ${tipoMensagem}`}>
            {mensagem}
          </p>
        )}
      </section>

      <section className="cartao">
        <div className="titulo-lista">
          <h2>Pessoas cadastradas</h2>
          <span>{pessoas.length} registro(s)</span>
        </div>

        {carregando && pessoas.length === 0 ? (
          <p>Carregando...</p>
        ) : pessoas.length === 0 ? (
          <p>Nenhuma pessoa cadastrada.</p>
        ) : (
          <div className="tabela-container">
            <table>
              <thead>
                <tr>
                  <th>Identificador</th>
                  <th>Nome</th>
                  <th>Idade</th>
                  <th>Ação</th>
                </tr>
              </thead>

              <tbody>
                {pessoas.map((pessoa) => (
                  <tr key={pessoa.id}>
                    <td>#{pessoa.id}</td>
                    <td>{pessoa.nome}</td>
                    <td>{pessoa.idade} anos</td>
                    <td>
                      <button
                        type="button"
                        className="botao-excluir"
                        onClick={() => excluirPessoa(pessoa)}
                        disabled={carregando}
                      >
                        Excluir
                      </button>
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