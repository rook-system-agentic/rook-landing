/**
 * Vitrine pública. A forma de acesso de cada fonte importa para o restaurante:
 * consultar um extrato por arquivo e autorizar uma API são operações diferentes.
 * Sistemas em preparação também alimentam o formulário de interesse pelo id.
 */
export const AVAILABLE_INTEGRATIONS = [
  { name: "Saipos", detail: "Vendas do PDV", logo: "/partners/saipos.svg", w: 161, h: 51 },
  { name: "iFood", detail: "Lançamentos do delivery", logo: "/partners/ifood.webp", w: 120, h: 120 },
  { name: "Olist Tiny", detail: "ERP · Tiny", logo: "/partners/olist.svg", w: 80, h: 39 },
  { name: "Pluggy", detail: "Bancos via Open Finance", logo: "/partners/pluggy.webp", w: 250, h: 62 },
  { name: "Getnet", detail: "Extrato eletrônico por arquivo", logo: "/partners/getnet.webp", w: 250, h: 53 },
  { name: "Stone", detail: "Recebimentos de cartão", logo: "/partners/stone.webp", w: 152, h: 44 },
  { name: "Cielo", detail: "Extrato por arquivo" },
  { name: "Vero", detail: "Extrato por arquivo", logo: "/partners/vero.svg", w: 175, h: 41 },
  { name: "SafraPay", detail: "Extrato por arquivo", logo: "/partners/safrapay.svg", w: 127, h: 31 },
  { name: "Fiserv", detail: "Extrato por arquivo", logo: "/partners/fiserv.svg", w: 72, h: 36 },
];

export const UPCOMING_INTEGRATIONS = [
  { id: "vuca", name: "VUCA", detail: "PDV em validação", logo: "/partners/vuca.webp", w: 229, h: 86 },
  { id: "beefood", name: "BeeFood", detail: "PDV em homologação", logo: "/partners/beefood.webp", w: 250, h: 80 },
  { id: "cardapio_web", name: "Cardápio Web", detail: "Delivery em homologação", logo: "/partners/cardapio-web.webp", w: 240, h: 156 },
  { id: "omie", name: "Omie", detail: "ERP em validação", logo: "/partners/omie.png", w: 134, h: 46 },
  { id: "conta_azul", name: "Conta Azul", detail: "ERP em validação", logo: "/partners/conta-azul.svg", w: 139, h: 18 },
  { id: "rede", name: "Rede", detail: "Recebimentos em validação" },
  { id: "takeat", name: "Takeat", detail: "Aguardando liberação da Takeat" },
];
