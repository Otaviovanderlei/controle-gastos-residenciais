import axios from "axios";

import { api } from "../api/api";
import type {
  CriarTransacao,
  Transacao,
} from "../types/Transacao";

type ErroApi = {
  mensagem?: string;
};

async function listar(): Promise<Transacao[]> {
  const resposta =
    await api.get<Transacao[]>("/transacoes");

  return resposta.data;
}

async function criar(
  dados: CriarTransacao
): Promise<Transacao> {
  try {
    const resposta = await api.post<Transacao>(
      "/transacoes",
      dados
    );

    return resposta.data;
  } catch (erro) {
    const mensagem =
      axios.isAxiosError<ErroApi>(erro)
        ? erro.response?.data?.mensagem ??
          "Não foi possível cadastrar a transação."
        : "Não foi possível cadastrar a transação.";

    throw new Error(mensagem, {
      cause: erro,
    });
  }
}

export const transacoesService = {
  listar,
  criar,
};