import { api } from "../api/api";
import type { CriarPessoa, Pessoa } from "../types/Pessoa";

async function listar(): Promise<Pessoa[]> {
  const resposta = await api.get<Pessoa[]>("/pessoas");
  return resposta.data;
}

async function criar(dados: CriarPessoa): Promise<Pessoa> {
  const resposta = await api.post<Pessoa>("/pessoas", dados);
  return resposta.data;
}

async function excluir(id: number): Promise<void> {
  await api.delete(`/pessoas/${id}`);
}

export const pessoasService = {
  listar,
  criar,
  excluir,
};
