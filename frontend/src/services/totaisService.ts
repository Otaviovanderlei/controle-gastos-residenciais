import { api } from "../api/api";
import type { ConsultaTotais } from "../types/Totais";

async function consultar(): Promise<ConsultaTotais> {
  const resposta =
    await api.get<ConsultaTotais>("/totais");

  return resposta.data;
}

export const totaisService = {
  consultar,
}