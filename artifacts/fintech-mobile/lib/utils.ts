export function gerarLinkWhatsApp(telefone: string, mensagem: string): string {
  const numeroLimpo = telefone.replace(/\D/g, "");
  const mensagemCodificada = encodeURIComponent(mensagem);
  return `https://wa.me/${numeroLimpo}?text=${mensagemCodificada}`;
}

export function formatarMoeda(valor: number): string {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function formatarData(data: string): string {
  const d = new Date(data);
  return d.toLocaleDateString("pt-BR");
}

export function calcularPercentualUtilizado(utilizado: number, limite: number): number {
  if (limite === 0) return 0;
  return Math.min((utilizado / limite) * 100, 100);
}
