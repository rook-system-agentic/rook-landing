/** Opções públicas do cadastro; não contêm referências internas de CMV. */
export const culinarySegments = Object.freeze([
  { name: "Restaurante à la carte - Tradicional", slug: "a_la_carte" },
  { name: "Alta gastronomia (fine dining)", slug: "fine_dining" },
  { name: "Comida Italiana", slug: "italiana" },
  { name: "Comida Japonesa / Sushi", slug: "japonesa_sushi" },
  { name: "Self-service / Comida a quilo", slug: "self_service_kilo" },
  { name: "Pizzaria", slug: "pizzaria" },
  { name: "Hamburgueria", slug: "hamburgueria" },
  { name: "Lanchonete / Fast food", slug: "fast_food" },
  { name: "Bar / Boteco", slug: "bar_boteco" },
  { name: "Padaria / Cafeteria / Confeitaria", slug: "padaria_cafeteria" },
  { name: "Delivery especializado", slug: "delivery_especializado" },
].map(segment => Object.freeze(segment)));
