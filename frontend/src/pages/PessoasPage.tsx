import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import { pessoasService } from "../services/pessoasService";
import type { MensagemFeedback } from "../types/Mensagem";
import type { CriarPessoa, Pessoa } from "../types/Pessoa";

export function PessoasPage() {
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [nome, setNome] = useState("");
  const [idade, setIdade] = useState("");

  const [mensagem, setMensagem] =
    useState<MensagemFeedback | null>(null);

  const [carregandoPagina, setCarregandoPagina] =
    useState(true);

  const [enviando, setEnviando] = useState(false);

  const [excluindoId, setExcluindoId] =
    useState<number | null>(null);

  useEffect(() => {
    let componenteAtivo = true;

    async function carregar() {
      try {
        const dados = await pessoasService.listar();

        if (componenteAtivo) {
          setPessoas(dados);
        }
      } catch {
        if (componenteAtivo) {
          setMensagem({
            texto: "Não foi possível carregar as pessoas.",
            tipo: "erro",
          });
        }
      } finally {
        if (componenteAtivo) {
          setCarregandoPagina(false);
        }
      }
    }

    void carregar();

    return () => {
      componenteAtivo = false;
    };
  }, []);

  async function cadastrarPessoa(
    evento: FormEvent<HTMLFormElement>
  ) {
    evento.preventDefault();
    setMensagem(null);

    const nomeTratado = nome.trim();
    const idadeNumerica = Number(idade);

    if (nomeTratado.length < 2) {
      setMensagem({
        texto: "Informe um nome com pelo menos 2 caracteres.",
        tipo: "erro",
      });

      return;
    }

    if (
      idade.trim() === "" ||
      !Number.isInteger(idadeNumerica) ||
      idadeNumerica < 0 ||
      idadeNumerica > 130
    ) {
      setMensagem({
        texto: "Informe uma idade válida entre 0 e 130 anos.",
        tipo: "erro",
      });

      return;
    }

    const novaPessoa: CriarPessoa = {
      nome: nomeTratado,
      idade: idadeNumerica,
    };

    try {
      setEnviando(true);

      const pessoaCriada =
        await pessoasService.criar(novaPessoa);

      setPessoas((pessoasAtuais) =>
        [...pessoasAtuais, pessoaCriada].sort((a, b) =>
          a.nome.localeCompare(b.nome, "pt-BR")
        )
      );

      setNome("");
      setIdade("");

      setMensagem({
        texto: "Pessoa cadastrada com sucesso.",
        tipo: "sucesso",
      });
    } catch {
      setMensagem({
        texto: "Não foi possível cadastrar a pessoa.",
        tipo: "erro",
      });
    } finally {
      setEnviando(false);
    }
  }

  async function excluirPessoa(pessoa: Pessoa) {
    setMensagem(null);

    const confirmou = window.confirm(
      `Excluir ${pessoa.nome}? Todas as transações dessa pessoa também serão apagadas.`
    );

    if (!confirmou) {
      return;
    }

    try {
      setExcluindoId(pessoa.id);

      await pessoasService.excluir(pessoa.id);

      setPessoas((pessoasAtuais) =>
        pessoasAtuais.filter(
          (pessoaAtual) => pessoaAtual.id !== pessoa.id
        )
      );

      setMensagem({
        texto: "Pessoa excluída com sucesso.",
        tipo: "sucesso",
      });
    } catch {
      setMensagem({
        texto: "Não foi possível excluir a pessoa.",
        tipo: "erro",
      });
    } finally {
      setExcluindoId(null);
    }
  }

  return (
    <main className="pagina">
      <header className="cabecalho">
        <div>
          <span className="etiqueta">
            Controle residencial
          </span>

          <h1>Pessoas</h1>

          <p>
            Cadastre e gerencie as pessoas da residência.
          </p>
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
                setMensagem(null);
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
                setMensagem(null);
              }}
              placeholder="Digite a idade"
              min={0}
              max={130}
            />
          </label>

          <button type="submit" disabled={enviando}>
            {enviando ? "Cadastrando..." : "Cadastrar"}
          </button>
        </form>

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
          <h2>Pessoas cadastradas</h2>

          <span>{pessoas.length} registro(s)</span>
        </div>

        {carregandoPagina ? (
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
                        onClick={() =>
                          excluirPessoa(pessoa)
                        }
                        disabled={
                          excluindoId === pessoa.id
                        }
                      >
                        {excluindoId === pessoa.id
                          ? "Excluindo..."
                          : "Excluir"}
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