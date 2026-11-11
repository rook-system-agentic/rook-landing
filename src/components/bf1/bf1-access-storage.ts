/*
 * Lembra, neste navegador, que o cadastro da /bl1 já foi feito (ROO-1848),
 * para o segundo clique ir direto ao grupo. Guarda só "1": nenhum dado da
 * pessoa. Fica separado do modal para o CTA não carregar o formulário inteiro.
 */
export const BF1_ACCESS_STORAGE_KEY = "rook_bf1_access_v1";

export function rememberBf1Access() {
  try {
    window.localStorage.setItem(BF1_ACCESS_STORAGE_KEY, "1");
  } catch {
    // Sem armazenamento (modo privado ou bloqueado): só preenche de novo.
  }
}

export function hasBf1Access() {
  try {
    return window.localStorage.getItem(BF1_ACCESS_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}
