import type {
  AppNotification,
  BusinessBuyer,
  Category,
  ChatMessage,
  Conversation,
  GeoPoint,
  ImageSeed,
  Order,
  Producer,
  Product,
  Review,
} from "./types";
import { distanceKm } from "./geo";
import { slugify } from "./utils";

// Localização padrão do comprador (Lavras, MG — Sul de Minas Gerais)
export const DEFAULT_BUYER_LOCATION: GeoPoint = { lat: -21.2447, lng: -44.9998 };
export const DEFAULT_BUYER_ADDRESS = {
  label: "Loja",
  street: "Rua dos Ipês, 245 — Centro",
  city: "Lavras",
  state: "MG",
  location: DEFAULT_BUYER_LOCATION,
};

function img(emoji: string, from: string, to: string, photoUrl?: string): ImageSeed {
  return { emoji, from, to, photoUrl };
}

// ---------- Fotos geradas via IA (Higgsfield / soul_2) ----------
// Fotos profissionais dos alimentos e das pessoas (produtores e compradores
// PJ). Quando uma URL falha ao carregar (ex.: offline), o componente cai de
// volta pro placeholder de gradiente + emoji automaticamente.
const FOOD_PHOTOS: Record<string, string> = {
  tomate: "https://d8j0ntlcm91z4.cloudfront.net/user_3JSKHQs55mAACFKbxAtGrIqkxt0/hf_20260917_134511_02f3d293-e409-4f0e-875a-ec4502c3f6cc.png",
  alface: "https://d8j0ntlcm91z4.cloudfront.net/user_3JSKHQs55mAACFKbxAtGrIqkxt0/hf_20260917_134631_8a83b88f-5186-4779-89ac-bc06a9f0ab34.png",
  couve: "https://d8j0ntlcm91z4.cloudfront.net/user_3JSKHQs55mAACFKbxAtGrIqkxt0/hf_20260917_134511_b941210e-2bbb-475b-aebb-05dfe9758f5d.png",
  rucula: "https://d8j0ntlcm91z4.cloudfront.net/user_3JSKHQs55mAACFKbxAtGrIqkxt0/hf_20260917_134511_965b2757-3ce3-4621-8f67-41ecc34a951f.png",
  espinafre: "https://d8j0ntlcm91z4.cloudfront.net/user_3JSKHQs55mAACFKbxAtGrIqkxt0/hf_20260917_134511_3226abc2-6953-4287-b360-fdac8fe8036b.png",
  brocolis: "https://d8j0ntlcm91z4.cloudfront.net/user_3JSKHQs55mAACFKbxAtGrIqkxt0/hf_20260917_134511_4d499d9a-55dc-4d4f-bf13-5267efba0e96.png",
  batata: "https://d8j0ntlcm91z4.cloudfront.net/user_3JSKHQs55mAACFKbxAtGrIqkxt0/hf_20260917_134511_3bce5470-64e0-40d0-b61a-2576527d5d92.png",
  mandioca: "https://d8j0ntlcm91z4.cloudfront.net/user_3JSKHQs55mAACFKbxAtGrIqkxt0/hf_20260917_134700_dfa9ef0b-7b1a-4531-8879-28468bd4d41d.png",
  cenoura: "https://d8j0ntlcm91z4.cloudfront.net/user_3JSKHQs55mAACFKbxAtGrIqkxt0/hf_20260917_134511_978d8edf-718b-462f-b894-cfcde9b9b163.png",
  beterraba: "https://d8j0ntlcm91z4.cloudfront.net/user_3JSKHQs55mAACFKbxAtGrIqkxt0/hf_20260917_134511_72c2e4e1-6eaf-4d0e-acf6-06036ee65a4c.png",
  inhame: "https://d8j0ntlcm91z4.cloudfront.net/user_3JSKHQs55mAACFKbxAtGrIqkxt0/hf_20260917_134511_a43e153a-781d-40e6-b245-d889a417da83.png",
  banana: "https://d8j0ntlcm91z4.cloudfront.net/user_3JSKHQs55mAACFKbxAtGrIqkxt0/hf_20260917_134511_3ab4832d-10e0-4068-b1e5-aad5beff5e58.png",
  mamao: "https://d8j0ntlcm91z4.cloudfront.net/user_3JSKHQs55mAACFKbxAtGrIqkxt0/hf_20260917_134747_6d0f5809-0e13-4dfb-930a-699ec463545c.png",
  manga: "https://d8j0ntlcm91z4.cloudfront.net/user_3JSKHQs55mAACFKbxAtGrIqkxt0/hf_20260917_135112_32a7f5cf-5df2-44ba-9091-07b10e4b8479.png",
  abacaxi: "https://d8j0ntlcm91z4.cloudfront.net/user_3JSKHQs55mAACFKbxAtGrIqkxt0/hf_20260917_135149_cfee42b4-b83b-4f9f-a19a-c98a0b1a6652.png",
  limao: "https://d8j0ntlcm91z4.cloudfront.net/user_3JSKHQs55mAACFKbxAtGrIqkxt0/hf_20260917_135300_15fb7038-ef46-48c9-b41e-6c6edf0cfbbc.png",
  pimentao: "https://d8j0ntlcm91z4.cloudfront.net/user_3JSKHQs55mAACFKbxAtGrIqkxt0/hf_20260917_134747_6b3790ff-9065-411a-83b1-65583e6b9d3c.png",
  abobrinha: "https://d8j0ntlcm91z4.cloudfront.net/user_3JSKHQs55mAACFKbxAtGrIqkxt0/hf_20260917_135231_32cb239b-16cf-4409-a671-0553df4d19ff.png",
  chuchu: "https://d8j0ntlcm91z4.cloudfront.net/user_3JSKHQs55mAACFKbxAtGrIqkxt0/hf_20260917_135231_a948de5e-baef-4e93-bc0f-a9d7bd326137.png",
  pepino: "https://d8j0ntlcm91z4.cloudfront.net/user_3JSKHQs55mAACFKbxAtGrIqkxt0/hf_20260917_135329_c83d02be-b5aa-48be-a872-c246872aacd2.png",
  feijao: "https://d8j0ntlcm91z4.cloudfront.net/user_3JSKHQs55mAACFKbxAtGrIqkxt0/hf_20260917_135231_b7450d28-3398-472c-be45-f642ca33fab3.png",
  milho: "https://d8j0ntlcm91z4.cloudfront.net/user_3JSKHQs55mAACFKbxAtGrIqkxt0/hf_20260917_135358_b57a724a-8b89-491c-adee-db227971ec18.png",
  arroz: "https://d8j0ntlcm91z4.cloudfront.net/user_3JSKHQs55mAACFKbxAtGrIqkxt0/hf_20260917_135430_fc913b93-433f-4594-aa28-da4c9cd3fdc7.png",
  cafe: "https://d8j0ntlcm91z4.cloudfront.net/user_3JSKHQs55mAACFKbxAtGrIqkxt0/hf_20260917_134748_397d410c-5a1d-4f25-bcbb-e43ee70fec32.png",
  ovos: "https://d8j0ntlcm91z4.cloudfront.net/user_3JSKHQs55mAACFKbxAtGrIqkxt0/hf_20260917_140832_335a1700-0d05-4e3f-b6f8-48076fc85810.png",
  queijo: "https://d8j0ntlcm91z4.cloudfront.net/user_3JSKHQs55mAACFKbxAtGrIqkxt0/hf_20260917_135634_7de42590-e4aa-4dc4-97fd-db8d56570f17.png",
  requeijao: "https://d8j0ntlcm91z4.cloudfront.net/user_3JSKHQs55mAACFKbxAtGrIqkxt0/hf_20260917_140833_e33cf1eb-de98-4b22-b9e7-04ddd491cc43.png",
  manteiga: "https://d8j0ntlcm91z4.cloudfront.net/user_3JSKHQs55mAACFKbxAtGrIqkxt0/hf_20260917_135634_20ebe546-762e-4b40-be6f-853ae3f18853.png",
  manjericao: "https://d8j0ntlcm91z4.cloudfront.net/user_3JSKHQs55mAACFKbxAtGrIqkxt0/hf_20260917_140833_e57afc8c-afcf-45f4-8271-de0830e3fbda.png",
  salsinha: "https://d8j0ntlcm91z4.cloudfront.net/user_3JSKHQs55mAACFKbxAtGrIqkxt0/hf_20260917_140758_bc211c1a-f28e-47f5-a878-e226b641325b.png",
  cebolinha: "https://d8j0ntlcm91z4.cloudfront.net/user_3JSKHQs55mAACFKbxAtGrIqkxt0/hf_20260917_135634_3344afd7-2c22-41b8-a5b5-1103c1023716.png",
  hortela: "https://d8j0ntlcm91z4.cloudfront.net/user_3JSKHQs55mAACFKbxAtGrIqkxt0/hf_20260917_140832_3c69f49d-d37f-4594-9b65-b269b6646251.png",
  geleia: "https://d8j0ntlcm91z4.cloudfront.net/user_3JSKHQs55mAACFKbxAtGrIqkxt0/hf_20260917_140832_36fc61f5-fba8-425b-8beb-ab08d216f963.png",
  docedeleite: "https://d8j0ntlcm91z4.cloudfront.net/user_3JSKHQs55mAACFKbxAtGrIqkxt0/hf_20260917_140832_9cbcec27-fa5d-4e01-9f13-5cc71df66735.png",
  mel: "https://d8j0ntlcm91z4.cloudfront.net/user_3JSKHQs55mAACFKbxAtGrIqkxt0/hf_20260917_135634_30e11f1f-b4bc-42d4-bb64-331f4b156623.png",
  polpa: "https://d8j0ntlcm91z4.cloudfront.net/user_3JSKHQs55mAACFKbxAtGrIqkxt0/hf_20260917_140832_012739eb-6b7e-4932-9df0-ec4bee7703b0.png",
};

const PEOPLE_PHOTOS: Record<string, string> = {
  prod_boaesperanca: "https://d8j0ntlcm91z4.cloudfront.net/user_3JSKHQs55mAACFKbxAtGrIqkxt0/hf_20260917_140915_f30d9e6e-5d5c-41c1-b9ff-6566b1ee0b01.png",
  prod_raizesdovale: "https://d8j0ntlcm91z4.cloudfront.net/user_3JSKHQs55mAACFKbxAtGrIqkxt0/hf_20260917_140915_2042e64c-2264-4166-b434-9fb028e835e6.png",
  prod_pomarvermelho: "https://d8j0ntlcm91z4.cloudfront.net/user_3JSKHQs55mAACFKbxAtGrIqkxt0/hf_20260917_140956_0684a919-6c42-4e27-9bb2-7edf62fee782.png",
  prod_vistaalegre: "https://d8j0ntlcm91z4.cloudfront.net/user_3JSKHQs55mAACFKbxAtGrIqkxt0/hf_20260917_141025_e29ef89e-1193-41ab-8ab9-62b208917d1f.png",
  prod_graoscerrado: "https://d8j0ntlcm91z4.cloudfront.net/user_3JSKHQs55mAACFKbxAtGrIqkxt0/hf_20260917_140915_d7630f25-2715-4ef1-848c-04856e9dbc4c.png",
  prod_cantodogalo: "https://d8j0ntlcm91z4.cloudfront.net/user_3JSKHQs55mAACFKbxAtGrIqkxt0/hf_20260917_141054_39b67828-7f92-4f9d-98d3-44547272ef73.png",
  prod_hortadaserra: "https://d8j0ntlcm91z4.cloudfront.net/user_3JSKHQs55mAACFKbxAtGrIqkxt0/hf_20260917_140915_92cc06c2-54d5-4193-bd88-2e6fab5dca53.png",
  prod_docesdaroca: "https://d8j0ntlcm91z4.cloudfront.net/user_3JSKHQs55mAACFKbxAtGrIqkxt0/hf_20260917_141124_6a56fab2-7f5f-4e2b-a746-6a099803f3bf.png",
  buyer_hortifruti: "https://d8j0ntlcm91z4.cloudfront.net/user_3JSKHQs55mAACFKbxAtGrIqkxt0/hf_20260917_140915_b31e073d-8597-45b5-98fc-d8c6e069b8b5.png",
  buyer_mercado: "https://d8j0ntlcm91z4.cloudfront.net/user_3JSKHQs55mAACFKbxAtGrIqkxt0/hf_20260917_141154_459a6939-219e-49f9-9c65-8528454f1a4f.png",
  buyer_verdurao: "https://d8j0ntlcm91z4.cloudfront.net/user_3JSKHQs55mAACFKbxAtGrIqkxt0/hf_20260917_140915_8db0b0fd-4c0f-4e47-9f4f-05f45a03d825.png",
};

// ---------- Estabelecimentos compradores (pessoa jurídica) ----------
// Pedidos agora vêm de estabelecimentos com CNPJ (hortifruti, mercado,
// verdurão) — não mais de uma pessoa física comprando pra si.
export const BUSINESS_BUYERS: BusinessBuyer[] = [
  {
    id: "buyer_hortifruti",
    businessName: "Hortifruti Sabor da Terra",
    cnpj: "12.345.678/0001-90",
    kind: "hortifruti",
    contactName: "Eugênio Silva",
    address: "Rua dos Ipês, 245 — Centro",
    city: "Lavras",
    state: "MG",
    location: DEFAULT_BUYER_LOCATION,
    avatarSeed: img("🙋", "#2f6b3f", "#8fc94a", PEOPLE_PHOTOS.buyer_hortifruti),
  },
  {
    id: "buyer_mercado",
    businessName: "Mercado Bom Preço",
    cnpj: "23.456.789/0001-01",
    kind: "mercado",
    contactName: "Carlos Mendes",
    address: "Av. Presidente Vargas, 1120 — Centro",
    city: "Três Corações",
    state: "MG",
    location: { lat: -21.6961, lng: -45.2438 },
    avatarSeed: img("🧑‍💼", "#3b82c4", "#7fb8e8", PEOPLE_PHOTOS.buyer_mercado),
  },
  {
    id: "buyer_verdurao",
    businessName: "Verdurão Central",
    cnpj: "34.567.890/0001-12",
    kind: "verdurao",
    contactName: "Rafael Souza",
    address: "Praça da Matriz, 58",
    city: "Coqueiral",
    state: "MG",
    location: { lat: -21.1975, lng: -45.2892 },
    avatarSeed: img("🧑‍🌾", "#d9762b", "#f2b134", PEOPLE_PHOTOS.buyer_verdurao),
  },
];

// Estabelecimento logado por padrão no protótipo (modo Comprador).
export const BUYER_ID = "buyer_hortifruti";
export const BUYER_NAME = BUSINESS_BUYERS[0].businessName;
export const BUYER_CNPJ = BUSINESS_BUYERS[0].cnpj;
export const BUYER_KIND = BUSINESS_BUYERS[0].kind;
export const BUYER_CONTACT_NAME = BUSINESS_BUYERS[0].contactName;
export const BUYER_AVATAR_SEED = BUSINESS_BUYERS[0].avatarSeed;

export const CATEGORIES: Category[] = [
  { id: "verduras", name: "Verduras", icon: "Leaf", gradient: ["#2f6b3f", "#8fc94a"] },
  { id: "legumes", name: "Legumes", icon: "Carrot", gradient: ["#d9762b", "#f2b134"] },
  { id: "frutas", name: "Frutas", icon: "Apple", gradient: ["#c93a4e", "#f2708a"] },
  { id: "raizes", name: "Raízes & Tubérculos", icon: "Sprout", gradient: ["#8a5a34", "#c98f56"] },
  { id: "graos", name: "Grãos & Cereais", icon: "Wheat", gradient: ["#b8892b", "#e8c565"] },
  { id: "laticinios", name: "Ovos & Laticínios", icon: "Egg", gradient: ["#e0b84a", "#f7e29b"] },
  { id: "temperos", name: "Temperos & Ervas", icon: "Flower2", gradient: ["#1a4d32", "#5c9c6b"] },
  { id: "processados", name: "Processados & Doces", icon: "Cookie", gradient: ["#8a3e6b", "#c97fa8"] },
];

interface ProducerSeed {
  id: string;
  name: string;
  farmName: string;
  bio: string;
  city: string;
  location: GeoPoint;
  radiusKm: number;
  rating: number;
  ratingCount: number;
  memberSince: string;
  verified: boolean;
  whatsapp: string;
  avatarSeed: ImageSeed;
  coverSeed: ImageSeed;
  deliveryEstimateDays: [number, number];
  certifications: string[];
}

const PRODUCER_SEEDS: ProducerSeed[] = [
  {
    id: "prod_boaesperanca",
    name: "Zé Ricardo",
    farmName: "Sítio Boa Esperança",
    bio: "Cultivamos folhosas sem agrotóxico há 12 anos, direto do assentamento Boa Esperança pra sua mesa.",
    city: "Nepomuceno",
    location: { lat: -21.2339, lng: -45.2364 },
    radiusKm: 35,
    rating: 4.8,
    ratingCount: 63,
    memberSince: "2023-02-10",
    verified: true,
    whatsapp: "5535998110022",
    avatarSeed: img("🧑🏽‍🌾", "#2f6b3f", "#8fc94a", PEOPLE_PHOTOS.prod_boaesperanca),
    coverSeed: img("🥬", "#1a4d32", "#8fc94a"),
    deliveryEstimateDays: [1, 2],
    certifications: ["Orgânico certificado", "Assentamento da reforma agrária"],
  },
  {
    id: "prod_raizesdovale",
    name: "Marlene Aparecida",
    farmName: "Fazenda Raízes do Vale",
    bio: "Tubérculos frescos colhidos por encomenda. Terra boa, sem pressa, sabor de verdade.",
    city: "Ijaci",
    location: { lat: -21.1725, lng: -44.9236 },
    radiusKm: 40,
    rating: 4.6,
    ratingCount: 41,
    memberSince: "2022-11-04",
    verified: true,
    whatsapp: "5535998220033",
    avatarSeed: img("👩🏽‍🌾", "#8a5a34", "#c98f56", PEOPLE_PHOTOS.prod_raizesdovale),
    coverSeed: img("🥔", "#6b4423", "#c98f56"),
    deliveryEstimateDays: [1, 3],
    certifications: ["Assentamento da reforma agrária"],
  },
  {
    id: "prod_pomarvermelho",
    name: "Antônio Carlos",
    farmName: "Pomar Vermelho",
    bio: "Fruticultura de família, 3 gerações cuidando do mesmo pomar. Fruta madura no pé, não na caixa.",
    city: "Bom Sucesso",
    location: { lat: -21.0389, lng: -44.7583 },
    radiusKm: 50,
    rating: 4.9,
    ratingCount: 88,
    memberSince: "2021-06-18",
    verified: true,
    whatsapp: "5535998330044",
    avatarSeed: img("👨🏾‍🌾", "#c93a4e", "#f2708a", PEOPLE_PHOTOS.prod_pomarvermelho),
    coverSeed: img("🍌", "#b8892b", "#f2b134"),
    deliveryEstimateDays: [2, 4],
    certifications: ["Manejo agroecológico"],
  },
  {
    id: "prod_vistaalegre",
    name: "Cooperativa Vista Alegre",
    farmName: "Assentamento Vista Alegre",
    bio: "12 famílias produzindo juntas. Legumes selecionados, embalados no mesmo dia da colheita.",
    city: "Perdões",
    location: { lat: -21.0925, lng: -45.0836 },
    radiusKm: 45,
    rating: 4.7,
    ratingCount: 102,
    memberSince: "2020-09-01",
    verified: true,
    whatsapp: "5535998440055",
    avatarSeed: img("👥", "#d9762b", "#f2b134", PEOPLE_PHOTOS.prod_vistaalegre),
    coverSeed: img("🍅", "#c93a4e", "#f2b134"),
    deliveryEstimateDays: [1, 2],
    certifications: ["Assentamento da reforma agrária", "Cooperativa certificada"],
  },
  {
    id: "prod_graoscerrado",
    name: "Sebastião Ferreira",
    farmName: "Grãos do Cerrado Mineiro",
    bio: "Feijão, milho e um café de terreiro torrado artesanalmente. Tudo colhido e beneficiado aqui mesmo.",
    city: "Ingaí",
    location: { lat: -21.4083, lng: -44.9138 },
    radiusKm: 60,
    rating: 4.5,
    ratingCount: 37,
    memberSince: "2023-05-22",
    verified: false,
    whatsapp: "5535998550066",
    avatarSeed: img("👨🏽‍🌾", "#b8892b", "#e8c565", PEOPLE_PHOTOS.prod_graoscerrado),
    coverSeed: img("🌽", "#b8892b", "#e8c565"),
    deliveryEstimateDays: [2, 5],
    certifications: ["Assentamento da reforma agrária"],
  },
  {
    id: "prod_cantodogalo",
    name: "Rosa e Eduardo",
    farmName: "Granja Canto do Galo",
    bio: "Ovos caipira e laticínios artesanais, produzidos com carinho e vendidos fresquinhos toda semana.",
    city: "Itumirim",
    location: { lat: -21.3244, lng: -44.8689 },
    radiusKm: 30,
    rating: 4.9,
    ratingCount: 74,
    memberSince: "2022-01-15",
    verified: true,
    whatsapp: "5535998660077",
    avatarSeed: img("👩🏻‍🌾", "#e0b84a", "#f7e29b", PEOPLE_PHOTOS.prod_cantodogalo),
    coverSeed: img("🥚", "#e0b84a", "#f7e29b"),
    deliveryEstimateDays: [1, 2],
    certifications: ["Inspeção sanitária municipal"],
  },
  {
    id: "prod_hortadaserra",
    name: "Idalina Rocha",
    farmName: "Horta da Serra",
    bio: "Ervas e temperos frescos cultivados na serra de Carrancas, colhidos na hora do pedido.",
    city: "Carrancas",
    location: { lat: -21.4894, lng: -44.6172 },
    radiusKm: 55,
    rating: 4.8,
    ratingCount: 29,
    memberSince: "2023-08-30",
    verified: false,
    whatsapp: "5535998770088",
    avatarSeed: img("👵🏽", "#1a4d32", "#5c9c6b", PEOPLE_PHOTOS.prod_hortadaserra),
    coverSeed: img("🌿", "#1a4d32", "#5c9c6b"),
    deliveryEstimateDays: [1, 3],
    certifications: ["Manejo agroecológico"],
  },
  {
    id: "prod_docesdaroca",
    name: "Conceição Alves",
    farmName: "Doces da Roça",
    bio: "Geleias, doces e mel de produção própria, no ponto certo da vovó — sem conservantes.",
    city: "Ribeirão Vermelho",
    location: { lat: -21.2494, lng: -45.2056 },
    radiusKm: 40,
    rating: 5.0,
    ratingCount: 52,
    memberSince: "2022-04-12",
    verified: true,
    whatsapp: "5535998880099",
    avatarSeed: img("👵🏾", "#8a3e6b", "#c97fa8", PEOPLE_PHOTOS.prod_docesdaroca),
    coverSeed: img("🍯", "#8a3e6b", "#c97fa8"),
    deliveryEstimateDays: [2, 4],
    certifications: ["Assentamento da reforma agrária", "Boas práticas de fabricação"],
  },
];

export const PRODUCERS: Producer[] = PRODUCER_SEEDS.map((p) => ({
  ...p,
  state: "MG",
}));

interface ProductSeed {
  id: string;
  producerId: string;
  categoryId: string;
  name: string;
  description: string;
  pricePerUnit: number;
  unit: Product["unit"];
  availableQty: number;
  imageSeed: ImageSeed;
  organic: boolean;
  harvestedAt: string;
  soldTotal: number;
}

const PRODUCT_SEEDS: ProductSeed[] = [
  // Sítio Boa Esperança — verduras
  { id: "p_alface", producerId: "prod_boaesperanca", categoryId: "verduras", name: "Alface Crespa", description: "Pé fresquinho, colhido no dia. Ideal para saladas.", pricePerUnit: 4.5, unit: "unid", availableQty: 80, imageSeed: img("🥬", "#2f6b3f", "#8fc94a", FOOD_PHOTOS.alface), organic: true, harvestedAt: "2026-09-16", soldTotal: 412 },
  { id: "p_couve", producerId: "prod_boaesperanca", categoryId: "verduras", name: "Couve Manteiga", description: "Maço grande, folhas firmes e escuras.", pricePerUnit: 5.0, unit: "molho", availableQty: 60, imageSeed: img("🥬", "#1a4d32", "#5c9c6b", FOOD_PHOTOS.couve), organic: true, harvestedAt: "2026-09-16", soldTotal: 298 },
  { id: "p_rucula", producerId: "prod_boaesperanca", categoryId: "verduras", name: "Rúcula", description: "Sabor picante suave, ótima com azeite e parmesão.", pricePerUnit: 6.0, unit: "molho", availableQty: 40, imageSeed: img("🌱", "#2f6b3f", "#8fc94a", FOOD_PHOTOS.rucula), organic: true, harvestedAt: "2026-09-17", soldTotal: 156 },
  { id: "p_espinafre", producerId: "prod_boaesperanca", categoryId: "verduras", name: "Espinafre", description: "Rico em ferro, ótimo para sucos verdes.", pricePerUnit: 6.5, unit: "molho", availableQty: 35, imageSeed: img("🥬", "#1a4d32", "#8fc94a", FOOD_PHOTOS.espinafre), organic: true, harvestedAt: "2026-09-15", soldTotal: 87 },
  { id: "p_brocolis", producerId: "prod_boaesperanca", categoryId: "verduras", name: "Brócolis Ninja", description: "Cabeças firmes e bem verdes, direto do pé.", pricePerUnit: 9.9, unit: "kg", availableQty: 25, imageSeed: img("🥦", "#1a4d32", "#5c9c6b", FOOD_PHOTOS.brocolis), organic: true, harvestedAt: "2026-09-16", soldTotal: 134 },

  // Raízes do Vale — tubérculos
  { id: "p_batata", producerId: "prod_raizesdovale", categoryId: "raizes", name: "Batata Asterix", description: "Casca rosada, ótima para fritar ou assar.", pricePerUnit: 6.8, unit: "kg", availableQty: 200, imageSeed: img("🥔", "#8a5a34", "#c98f56", FOOD_PHOTOS.batata), organic: false, harvestedAt: "2026-09-12", soldTotal: 890 },
  { id: "p_mandioca", producerId: "prod_raizesdovale", categoryId: "raizes", name: "Mandioca Descascada", description: "Já descascada e lavada, pronta pra cozinhar.", pricePerUnit: 7.5, unit: "kg", availableQty: 90, imageSeed: img("🍠", "#8a5a34", "#c98f56", FOOD_PHOTOS.mandioca), organic: false, harvestedAt: "2026-09-14", soldTotal: 320 },
  { id: "p_cenoura", producerId: "prod_raizesdovale", categoryId: "raizes", name: "Cenoura", description: "Doce e crocante, colhida sob encomenda.", pricePerUnit: 5.9, unit: "kg", availableQty: 150, imageSeed: img("🥕", "#d9762b", "#f2b134", FOOD_PHOTOS.cenoura), organic: true, harvestedAt: "2026-09-15", soldTotal: 445 },
  { id: "p_beterraba", producerId: "prod_raizesdovale", categoryId: "raizes", name: "Beterraba", description: "Ótima para saladas e sucos detox.", pricePerUnit: 6.2, unit: "kg", availableQty: 70, imageSeed: img("🍠", "#c93a4e", "#f2708a", FOOD_PHOTOS.beterraba), organic: true, harvestedAt: "2026-09-13", soldTotal: 210 },
  { id: "p_inhame", producerId: "prod_raizesdovale", categoryId: "raizes", name: "Inhame", description: "Textura cremosa, ótimo em sopas e purês.", pricePerUnit: 8.9, unit: "kg", availableQty: 45, imageSeed: img("🍠", "#8a5a34", "#c98f56", FOOD_PHOTOS.inhame), organic: false, harvestedAt: "2026-09-11", soldTotal: 98 },

  // Pomar Vermelho — frutas
  { id: "p_banana", producerId: "prod_pomarvermelho", categoryId: "frutas", name: "Banana Prata", description: "Cacho maduro no ponto, doce e macia.", pricePerUnit: 4.2, unit: "kg", availableQty: 300, imageSeed: img("🍌", "#e0b84a", "#f2b134", FOOD_PHOTOS.banana), organic: false, harvestedAt: "2026-09-15", soldTotal: 1240 },
  { id: "p_mamao", producerId: "prod_pomarvermelho", categoryId: "frutas", name: "Mamão Formosa", description: "Polpa alaranjada, super doce.", pricePerUnit: 5.5, unit: "kg", availableQty: 120, imageSeed: img("🥭", "#f2708a", "#f2b134", FOOD_PHOTOS.mamao), organic: false, harvestedAt: "2026-09-16", soldTotal: 560 },
  { id: "p_manga", producerId: "prod_pomarvermelho", categoryId: "frutas", name: "Manga Palmer", description: "Fruta grande, fibra macia, aroma marcante.", pricePerUnit: 6.9, unit: "kg", availableQty: 95, imageSeed: img("🥭", "#c93a4e", "#f2b134", FOOD_PHOTOS.manga), organic: false, harvestedAt: "2026-09-14", soldTotal: 410 },
  { id: "p_abacaxi", producerId: "prod_pomarvermelho", categoryId: "frutas", name: "Abacaxi Pérola", description: "Bem doce, pouco ácido, casca amarelada.", pricePerUnit: 7.0, unit: "unid", availableQty: 60, imageSeed: img("🍍", "#e0b84a", "#f2b134", FOOD_PHOTOS.abacaxi), organic: false, harvestedAt: "2026-09-13", soldTotal: 233 },
  { id: "p_limao", producerId: "prod_pomarvermelho", categoryId: "frutas", name: "Limão Taiti", description: "Suculento, ideal para sucos e temperos.", pricePerUnit: 3.9, unit: "kg", availableQty: 180, imageSeed: img("🍋", "#8fc94a", "#d3f08a", FOOD_PHOTOS.limao), organic: false, harvestedAt: "2026-09-16", soldTotal: 670 },

  // Vista Alegre — legumes
  { id: "p_tomate", producerId: "prod_vistaalegre", categoryId: "legumes", name: "Tomate Salada", description: "Vermelho, firme, ótimo pra salada e molho.", pricePerUnit: 7.9, unit: "kg", availableQty: 220, imageSeed: img("🍅", "#c93a4e", "#f2708a", FOOD_PHOTOS.tomate), organic: false, harvestedAt: "2026-09-16", soldTotal: 980 },
  { id: "p_pimentao", producerId: "prod_vistaalegre", categoryId: "legumes", name: "Pimentão Tricolor", description: "Mix verde, amarelo e vermelho, recém colhido.", pricePerUnit: 9.5, unit: "kg", availableQty: 80, imageSeed: img("🫑", "#8fc94a", "#f2b134", FOOD_PHOTOS.pimentao), organic: false, harvestedAt: "2026-09-15", soldTotal: 312 },
  { id: "p_abobrinha", producerId: "prod_vistaalegre", categoryId: "legumes", name: "Abobrinha Italiana", description: "Casca fina e macia, ótima para refogados.", pricePerUnit: 5.4, unit: "kg", availableQty: 110, imageSeed: img("🥒", "#2f6b3f", "#8fc94a", FOOD_PHOTOS.abobrinha), organic: true, harvestedAt: "2026-09-16", soldTotal: 189 },
  { id: "p_chuchu", producerId: "prod_vistaalegre", categoryId: "legumes", name: "Chuchu", description: "Clássico e versátil, direto do pé.", pricePerUnit: 4.0, unit: "kg", availableQty: 140, imageSeed: img("🥒", "#8fc94a", "#d3f08a", FOOD_PHOTOS.chuchu), organic: false, harvestedAt: "2026-09-14", soldTotal: 267 },
  { id: "p_pepino", producerId: "prod_vistaalegre", categoryId: "legumes", name: "Pepino Japonês", description: "Crocante, sem amargor, sem cera.", pricePerUnit: 6.0, unit: "kg", availableQty: 100, imageSeed: img("🥒", "#2f6b3f", "#5c9c6b", FOOD_PHOTOS.pepino), organic: true, harvestedAt: "2026-09-15", soldTotal: 145 },

  // Grãos do Cerrado
  { id: "p_feijao", producerId: "prod_graoscerrado", categoryId: "graos", name: "Feijão Carioca Novo", description: "Safra nova, cozinha rápido e rende bem.", pricePerUnit: 9.8, unit: "kg", availableQty: 260, imageSeed: img("🫘", "#b8892b", "#e8c565", FOOD_PHOTOS.feijao), organic: false, harvestedAt: "2026-08-30", soldTotal: 720 },
  { id: "p_milho", producerId: "prod_graoscerrado", categoryId: "graos", name: "Milho Verde", description: "Espiga doce, ótima pra pamonha e curau.", pricePerUnit: 2.5, unit: "unid", availableQty: 300, imageSeed: img("🌽", "#e8c565", "#f2b134", FOOD_PHOTOS.milho), organic: false, harvestedAt: "2026-09-10", soldTotal: 890 },
  { id: "p_arroz", producerId: "prod_graoscerrado", categoryId: "graos", name: "Arroz Agulhinha", description: "Grãos soltinhos, beneficiado artesanalmente.", pricePerUnit: 8.5, unit: "kg", availableQty: 180, imageSeed: img("🌾", "#b8892b", "#e8c565", FOOD_PHOTOS.arroz), organic: false, harvestedAt: "2026-08-20", soldTotal: 340 },
  { id: "p_cafe", producerId: "prod_graoscerrado", categoryId: "graos", name: "Café Torrado de Terreiro", description: "Torra média, moído na hora do pedido.", pricePerUnit: 28.0, unit: "kg", availableQty: 40, imageSeed: img("☕", "#6b4423", "#b8892b", FOOD_PHOTOS.cafe), organic: true, harvestedAt: "2026-09-01", soldTotal: 112 },

  // Canto do Galo — ovos e laticínios
  { id: "p_ovos", producerId: "prod_cantodogalo", categoryId: "laticinios", name: "Ovos Caipira", description: "Dúzia, galinhas soltas no pasto.", pricePerUnit: 14.0, unit: "dz", availableQty: 70, imageSeed: img("🥚", "#e0b84a", "#f7e29b", FOOD_PHOTOS.ovos), organic: false, harvestedAt: "2026-09-17", soldTotal: 640 },
  { id: "p_queijo", producerId: "prod_cantodogalo", categoryId: "laticinios", name: "Queijo Minas Artesanal", description: "Peça de 500g, curado 15 dias.", pricePerUnit: 32.0, unit: "unid", availableQty: 35, imageSeed: img("🧀", "#f7e29b", "#f2b134", FOOD_PHOTOS.queijo), organic: false, harvestedAt: "2026-09-10", soldTotal: 198 },
  { id: "p_requeijao", producerId: "prod_cantodogalo", categoryId: "laticinios", name: "Requeijão Cremoso", description: "Pote de 300g, receita da família.", pricePerUnit: 16.0, unit: "unid", availableQty: 50, imageSeed: img("🧈", "#f7e29b", "#e0b84a", FOOD_PHOTOS.requeijao), organic: false, harvestedAt: "2026-09-12", soldTotal: 145 },
  { id: "p_manteiga", producerId: "prod_cantodogalo", categoryId: "laticinios", name: "Manteiga Artesanal", description: "Pote de 200g, feita com nata fresca.", pricePerUnit: 18.5, unit: "unid", availableQty: 30, imageSeed: img("🧈", "#e0b84a", "#f2b134", FOOD_PHOTOS.manteiga), organic: false, harvestedAt: "2026-09-11", soldTotal: 76 },

  // Horta da Serra — temperos
  { id: "p_manjericao", producerId: "prod_hortadaserra", categoryId: "temperos", name: "Manjericão", description: "Folhas grandes e aromáticas, colhidas na hora.", pricePerUnit: 4.0, unit: "molho", availableQty: 50, imageSeed: img("🌿", "#1a4d32", "#5c9c6b", FOOD_PHOTOS.manjericao), organic: true, harvestedAt: "2026-09-17", soldTotal: 88 },
  { id: "p_salsinha", producerId: "prod_hortadaserra", categoryId: "temperos", name: "Salsinha", description: "Fresquinha, clássica pra temperar tudo.", pricePerUnit: 3.0, unit: "molho", availableQty: 65, imageSeed: img("🌿", "#2f6b3f", "#8fc94a", FOOD_PHOTOS.salsinha), organic: true, harvestedAt: "2026-09-17", soldTotal: 112 },
  { id: "p_cebolinha", producerId: "prod_hortadaserra", categoryId: "temperos", name: "Cebolinha", description: "Talos firmes e verdes.", pricePerUnit: 3.0, unit: "molho", availableQty: 65, imageSeed: img("🌿", "#1a4d32", "#8fc94a", FOOD_PHOTOS.cebolinha), organic: true, harvestedAt: "2026-09-17", soldTotal: 97 },
  { id: "p_hortela", producerId: "prod_hortadaserra", categoryId: "temperos", name: "Hortelã", description: "Aroma intenso, ótima pro suco e chá.", pricePerUnit: 3.5, unit: "molho", availableQty: 40, imageSeed: img("🌿", "#5c9c6b", "#d3f08a", FOOD_PHOTOS.hortela), organic: true, harvestedAt: "2026-09-16", soldTotal: 54 },

  // Doces da Roça — processados
  { id: "p_geleia", producerId: "prod_docesdaroca", categoryId: "processados", name: "Geleia de Goiaba", description: "Pote de 250g, fruta da região.", pricePerUnit: 15.0, unit: "unid", availableQty: 40, imageSeed: img("🍯", "#c93a4e", "#f2708a", FOOD_PHOTOS.geleia), organic: false, harvestedAt: "2026-09-05", soldTotal: 133 },
  { id: "p_docedeleite", producerId: "prod_docesdaroca", categoryId: "processados", name: "Doce de Leite Cremoso", description: "Pote de 300g, receita de tacho de cobre.", pricePerUnit: 18.0, unit: "unid", availableQty: 35, imageSeed: img("🍮", "#e0b84a", "#c98f56", FOOD_PHOTOS.docedeleite), organic: false, harvestedAt: "2026-09-08", soldTotal: 156 },
  { id: "p_mel", producerId: "prod_docesdaroca", categoryId: "processados", name: "Mel Silvestre", description: "Vidro de 500g, das colmeias da propriedade.", pricePerUnit: 30.0, unit: "unid", availableQty: 28, imageSeed: img("🍯", "#e0b84a", "#f2b134", FOOD_PHOTOS.mel), organic: true, harvestedAt: "2026-08-28", soldTotal: 210 },
  { id: "p_polpa", producerId: "prod_docesdaroca", categoryId: "processados", name: "Polpa de Fruta Congelada", description: "Pacote 1kg — maracujá, manga ou acerola.", pricePerUnit: 12.0, unit: "unid", availableQty: 60, imageSeed: img("🧊", "#8a3e6b", "#c97fa8", FOOD_PHOTOS.polpa), organic: false, harvestedAt: "2026-09-10", soldTotal: 189 },

  // ---------- Ofertas adicionais: mesmo produto, produtores diferentes ----------
  // Alface Crespa também vendida por outros 4 produtores (5 ofertas no total)
  { id: "p_alface_vistaalegre", producerId: "prod_vistaalegre", categoryId: "verduras", name: "Alface Crespa", description: "Colhida em mutirão, embalada em maços de 3 unidades.", pricePerUnit: 4.2, unit: "unid", availableQty: 150, imageSeed: img("🥬", "#2f6b3f", "#8fc94a", FOOD_PHOTOS.alface), organic: false, harvestedAt: "2026-09-16", soldTotal: 520 },
  { id: "p_alface_hortadaserra", producerId: "prod_hortadaserra", categoryId: "verduras", name: "Alface Crespa", description: "Cultivo de altitude na serra, folhas bem crocantes.", pricePerUnit: 5.2, unit: "unid", availableQty: 45, imageSeed: img("🥬", "#1a4d32", "#5c9c6b", FOOD_PHOTOS.alface), organic: true, harvestedAt: "2026-09-17", soldTotal: 96 },
  { id: "p_alface_raizesdovale", producerId: "prod_raizesdovale", categoryId: "verduras", name: "Alface Crespa", description: "Parceria com horta comunitária, preço popular.", pricePerUnit: 3.9, unit: "unid", availableQty: 100, imageSeed: img("🥬", "#8a5a34", "#c98f56", FOOD_PHOTOS.alface), organic: false, harvestedAt: "2026-09-15", soldTotal: 210 },
  { id: "p_alface_cantodogalo", producerId: "prod_cantodogalo", categoryId: "verduras", name: "Alface Crespa", description: "Horta ao lado do galinheiro, adubo 100% natural.", pricePerUnit: 4.8, unit: "unid", availableQty: 55, imageSeed: img("🥬", "#e0b84a", "#f7e29b", FOOD_PHOTOS.alface), organic: true, harvestedAt: "2026-09-16", soldTotal: 133 },

  // Tomate Salada também na Boa Esperança
  { id: "p_tomate_boaesperanca", producerId: "prod_boaesperanca", categoryId: "legumes", name: "Tomate Salada", description: "Estufa própria, colheita duas vezes por semana.", pricePerUnit: 8.4, unit: "kg", availableQty: 90, imageSeed: img("🍅", "#c93a4e", "#f2708a", FOOD_PHOTOS.tomate), organic: true, harvestedAt: "2026-09-15", soldTotal: 267 },

  // Couve Manteiga também na Horta da Serra
  { id: "p_couve_hortadaserra", producerId: "prod_hortadaserra", categoryId: "verduras", name: "Couve Manteiga", description: "Maços pequenos, ideais pra quem mora sozinho.", pricePerUnit: 4.5, unit: "molho", availableQty: 38, imageSeed: img("🥬", "#1a4d32", "#5c9c6b", FOOD_PHOTOS.couve), organic: true, harvestedAt: "2026-09-17", soldTotal: 71 },

  // Rúcula também na Horta da Serra
  { id: "p_rucula_hortadaserra", producerId: "prod_hortadaserra", categoryId: "verduras", name: "Rúcula", description: "Sabor mais suave, cultivo de altitude.", pricePerUnit: 6.8, unit: "molho", availableQty: 30, imageSeed: img("🌱", "#2f6b3f", "#8fc94a", FOOD_PHOTOS.rucula), organic: true, harvestedAt: "2026-09-17", soldTotal: 44 },

  // Cenoura também na Vista Alegre
  { id: "p_cenoura_vistaalegre", producerId: "prod_vistaalegre", categoryId: "raizes", name: "Cenoura", description: "Lavada e selecionada, embalagem de 1kg.", pricePerUnit: 6.5, unit: "kg", availableQty: 130, imageSeed: img("🥕", "#d9762b", "#f2b134", FOOD_PHOTOS.cenoura), organic: false, harvestedAt: "2026-09-14", soldTotal: 302 },

  // Banana Prata também na Vista Alegre e Raízes do Vale
  { id: "p_banana_vistaalegre", producerId: "prod_vistaalegre", categoryId: "frutas", name: "Banana Prata", description: "Pencas médias, ponto ideal pra durar a semana.", pricePerUnit: 3.9, unit: "kg", availableQty: 220, imageSeed: img("🍌", "#e0b84a", "#f2b134", FOOD_PHOTOS.banana), organic: false, harvestedAt: "2026-09-16", soldTotal: 610 },
  { id: "p_banana_raizesdovale", producerId: "prod_raizesdovale", categoryId: "frutas", name: "Banana Prata", description: "Cultivo consorciado com mandioca, sabor intenso.", pricePerUnit: 4.6, unit: "kg", availableQty: 80, imageSeed: img("🍌", "#8a5a34", "#c98f56", FOOD_PHOTOS.banana), organic: true, harvestedAt: "2026-09-13", soldTotal: 178 },

  // Mandioca também na Vista Alegre
  { id: "p_mandioca_vistaalegre", producerId: "prod_vistaalegre", categoryId: "raizes", name: "Mandioca Descascada", description: "Direto da roça coletiva, embalada a vácuo.", pricePerUnit: 6.9, unit: "kg", availableQty: 60, imageSeed: img("🍠", "#8a5a34", "#c98f56", FOOD_PHOTOS.mandioca), organic: false, harvestedAt: "2026-09-13", soldTotal: 145 },

  // Ovos Caipira também na Vista Alegre e Grãos do Cerrado
  { id: "p_ovos_vistaalegre", producerId: "prod_vistaalegre", categoryId: "laticinios", name: "Ovos Caipira", description: "Dúzia, produção da cooperativa.", pricePerUnit: 13.0, unit: "dz", availableQty: 40, imageSeed: img("🥚", "#e0b84a", "#f7e29b", FOOD_PHOTOS.ovos), organic: false, harvestedAt: "2026-09-16", soldTotal: 220 },
  { id: "p_ovos_graoscerrado", producerId: "prod_graoscerrado", categoryId: "laticinios", name: "Ovos Caipira", description: "Galinhas criadas soltas no meio da lavoura.", pricePerUnit: 15.5, unit: "dz", availableQty: 25, imageSeed: img("🥚", "#b8892b", "#e8c565", FOOD_PHOTOS.ovos), organic: true, harvestedAt: "2026-09-17", soldTotal: 58 },

  // Limão Taiti também na Vista Alegre
  { id: "p_limao_vistaalegre", producerId: "prod_vistaalegre", categoryId: "frutas", name: "Limão Taiti", description: "Pomar consorciado, casca fina.", pricePerUnit: 4.3, unit: "kg", availableQty: 90, imageSeed: img("🍋", "#8fc94a", "#d3f08a", FOOD_PHOTOS.limao), organic: false, harvestedAt: "2026-09-15", soldTotal: 201 },
];

export const PRODUCTS: Product[] = PRODUCT_SEEDS.map((p) => ({
  ...p,
  active: true,
  productTypeId: `type_${slugify(p.name)}`,
}));

// ---------- Pedidos, avaliações, conversas e notificações de exemplo ----------

function daysAgoISO(days: number, hours = 0): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(d.getHours() - hours);
  return d.toISOString();
}

function buildOrder(partial: {
  id: string;
  checkoutGroupId: string;
  producerId: string;
  items: { productId: string; qty: number }[];
  status: Order["status"];
  createdDaysAgo: number;
  reviewed?: boolean;
  buyerBusinessId?: string;
}): Order {
  const producer = PRODUCERS.find((p) => p.id === partial.producerId)!;
  const business = BUSINESS_BUYERS.find((b) => b.id === (partial.buyerBusinessId ?? BUYER_ID))!;
  const items = partial.items.map((it) => {
    const product = PRODUCTS.find((p) => p.id === it.productId)!;
    return {
      productId: product.id,
      name: product.name,
      qty: it.qty,
      unit: product.unit,
      pricePerUnit: product.pricePerUnit,
      imageSeed: product.imageSeed,
    };
  });
  const subtotal = items.reduce((sum, it) => sum + it.qty * it.pricePerUnit, 0);
  const dist = distanceKm(business.location, producer.location);
  const deliveryFee = Math.round((6 + dist * 0.35) * 100) / 100;
  const createdAt = daysAgoISO(partial.createdDaysAgo);
  const history: { status: Order["status"]; at: string }[] = [{ status: "pendente", at: createdAt }];
  if (partial.status !== "pendente") {
    history.push({ status: partial.status, at: daysAgoISO(Math.max(partial.createdDaysAgo - 1, 0)) });
  }
  return {
    id: partial.id,
    checkoutGroupId: partial.checkoutGroupId,
    buyerId: business.id,
    buyerName: business.businessName,
    buyerCnpj: business.cnpj,
    buyerKind: business.kind,
    buyerContactName: business.contactName,
    buyerAvatarSeed: business.avatarSeed,
    buyerAddress: `${business.address}, ${business.city}/${business.state}`,
    buyerLocation: business.location,
    producerId: partial.producerId,
    items,
    subtotal: Math.round(subtotal * 100) / 100,
    deliveryFee,
    total: Math.round((subtotal + deliveryFee) * 100) / 100,
    status: partial.status,
    createdAt,
    updatedAt: history[history.length - 1].at,
    estimatedDeliveryAt:
      partial.status === "entregue" ? undefined : daysAgoISO(Math.max(partial.createdDaysAgo - 2, -2)),
    deliveryNote: "Entrega pela manhã, combinamos direto pelo chat.",
    statusHistory: history,
    reviewed: partial.reviewed ?? false,
    distanceKm: Math.round(dist * 10) / 10,
  };
}

export const ORDERS: Order[] = [
  // Pedidos do estabelecimento logado por padrão (Hortifruti Sabor da Terra)
  buildOrder({
    id: "ord_1001",
    checkoutGroupId: "chk_501",
    producerId: "prod_boaesperanca",
    items: [
      { productId: "p_alface", qty: 2 },
      { productId: "p_couve", qty: 3 },
    ],
    status: "entregue",
    createdDaysAgo: 12,
    reviewed: true,
  }),
  buildOrder({
    id: "ord_1002",
    checkoutGroupId: "chk_501",
    producerId: "prod_pomarvermelho",
    items: [
      { productId: "p_banana", qty: 5 },
      { productId: "p_mamao", qty: 2 },
    ],
    status: "entregue",
    createdDaysAgo: 12,
    reviewed: true,
  }),
  buildOrder({
    id: "ord_1003",
    checkoutGroupId: "chk_502",
    producerId: "prod_vistaalegre",
    items: [
      { productId: "p_tomate", qty: 4 },
      { productId: "p_pimentao", qty: 2 },
    ],
    status: "entregue",
    createdDaysAgo: 5,
    reviewed: false,
  }),
  buildOrder({
    id: "ord_1004",
    checkoutGroupId: "chk_503",
    producerId: "prod_cantodogalo",
    items: [{ productId: "p_ovos", qty: 2 }],
    status: "a_caminho",
    createdDaysAgo: 1,
  }),
  buildOrder({
    id: "ord_1005",
    checkoutGroupId: "chk_504",
    producerId: "prod_raizesdovale",
    items: [
      { productId: "p_batata", qty: 3 },
      { productId: "p_cenoura", qty: 2 },
    ],
    status: "pendente",
    createdDaysAgo: 0,
  }),

  // Pedidos de outros estabelecimentos PJ — aparecem só do lado do produtor,
  // mostrando que os pedidos vêm de vários CNPJs (mercados, verdurões etc.)
  buildOrder({
    id: "ord_2001",
    checkoutGroupId: "chk_601",
    producerId: "prod_vistaalegre",
    buyerBusinessId: "buyer_mercado",
    items: [
      { productId: "p_tomate", qty: 20 },
      { productId: "p_pimentao", qty: 10 },
    ],
    status: "aceito",
    createdDaysAgo: 2,
  }),
  buildOrder({
    id: "ord_2002",
    checkoutGroupId: "chk_602",
    producerId: "prod_graoscerrado",
    buyerBusinessId: "buyer_mercado",
    items: [
      { productId: "p_feijao", qty: 40 },
      { productId: "p_milho", qty: 60 },
    ],
    status: "entregue",
    createdDaysAgo: 8,
    reviewed: true,
  }),
  buildOrder({
    id: "ord_2003",
    checkoutGroupId: "chk_603",
    producerId: "prod_pomarvermelho",
    buyerBusinessId: "buyer_verdurao",
    items: [
      { productId: "p_banana", qty: 25 },
      { productId: "p_manga", qty: 15 },
    ],
    status: "a_caminho",
    createdDaysAgo: 1,
  }),
  buildOrder({
    id: "ord_2004",
    checkoutGroupId: "chk_604",
    producerId: "prod_raizesdovale",
    buyerBusinessId: "buyer_verdurao",
    items: [
      { productId: "p_batata", qty: 30 },
      { productId: "p_cenoura", qty: 18 },
    ],
    status: "pendente",
    createdDaysAgo: 0,
  }),
];

export const REVIEWS: Review[] = [
  {
    id: "rev_1",
    orderId: "ord_1001",
    producerId: "prod_boaesperanca",
    buyerId: BUYER_ID,
    buyerName: BUYER_NAME,
    buyerAvatarSeed: BUYER_AVATAR_SEED,
    rating: 5,
    comment: "Verdura chegou fresquinha, embalada com carinho. Já viramos cliente fixo!",
    createdAt: daysAgoISO(10),
    reply: { text: "Muito obrigado! Semana que vem já tem espinafre novo 🌱", at: daysAgoISO(9) },
  },
  {
    id: "rev_2",
    orderId: "ord_1002",
    producerId: "prod_pomarvermelho",
    buyerId: BUYER_ID,
    buyerName: BUYER_NAME,
    buyerAvatarSeed: BUYER_AVATAR_SEED,
    rating: 5,
    comment: "Banana no ponto certo e mamão super doce. Entrega rápida.",
    createdAt: daysAgoISO(10),
  },
  {
    id: "rev_3",
    orderId: "ord_2002",
    producerId: "prod_graoscerrado",
    buyerId: "buyer_mercado",
    buyerName: "Mercado Bom Preço",
    buyerAvatarSeed: BUSINESS_BUYERS.find((b) => b.id === "buyer_mercado")!.avatarSeed,
    rating: 4,
    comment: "Feijão de ótima qualidade e preço justo pra revenda. Só a entrega atrasou um pouco.",
    createdAt: daysAgoISO(6),
    reply: { text: "Obrigado pelo retorno, Carlos! Vamos ajustar a logística pro próximo pedido.", at: daysAgoISO(5) },
  },
];

export const CONVERSATIONS: Conversation[] = [
  {
    id: "conv_boaesperanca",
    buyerId: BUYER_ID,
    producerId: "prod_boaesperanca",
    lastMessageAt: daysAgoISO(0, 2),
    lastMessagePreview: "Pode ser entrega amanhã de manhã, combinado!",
    unreadForBuyer: 1,
    unreadForProducer: 0,
  },
  {
    id: "conv_raizesdovale",
    buyerId: BUYER_ID,
    producerId: "prod_raizesdovale",
    lastMessageAt: daysAgoISO(0, 5),
    lastMessagePreview: "Oi! Consigo separar sua batata pra hoje ainda.",
    unreadForBuyer: 0,
    unreadForProducer: 1,
  },
];

export const CHAT_MESSAGES: ChatMessage[] = [
  { id: "msg_1", conversationId: "conv_boaesperanca", senderRole: "comprador", text: "Oi! A couve de hoje tá boa?", createdAt: daysAgoISO(0, 4), read: true },
  { id: "msg_2", conversationId: "conv_boaesperanca", senderRole: "produtor", text: "Tá sim, colhida agora de manhã 😊", createdAt: daysAgoISO(0, 3.5), read: true },
  { id: "msg_3", conversationId: "conv_boaesperanca", senderRole: "comprador", text: "Perfeito, fechei o pedido aqui pelo app!", createdAt: daysAgoISO(0, 3), read: true },
  { id: "msg_4", conversationId: "conv_boaesperanca", senderRole: "produtor", text: "Pode ser entrega amanhã de manhã, combinado!", createdAt: daysAgoISO(0, 2), read: false },
  { id: "msg_5", conversationId: "conv_raizesdovale", senderRole: "comprador", text: "Bom dia! Tem batata disponível pra hoje?", createdAt: daysAgoISO(0, 6), read: true },
  { id: "msg_6", conversationId: "conv_raizesdovale", senderRole: "produtor", text: "Oi! Consigo separar sua batata pra hoje ainda.", createdAt: daysAgoISO(0, 5), read: false },
];

export const NOTIFICATIONS: AppNotification[] = [
  { id: "not_1", scope: "comprador", title: "Pedido a caminho", body: "Seu pedido de ovos caipira saiu para entrega.", createdAt: daysAgoISO(0, 3), read: false, type: "pedido", link: "/pedidos/ord_1004" },
  { id: "not_2", scope: "comprador", title: "Nova mensagem", body: "Sítio Boa Esperança respondeu sua conversa.", createdAt: daysAgoISO(0, 2), read: false, type: "chat", link: "/chat/conv_boaesperanca" },
  { id: "not_3", scope: "comprador", title: "Avalie sua compra", body: "Como foi seu pedido da Cooperativa Vista Alegre?", createdAt: daysAgoISO(4), read: true, type: "avaliacao", link: "/pedidos/ord_1003" },
  { id: "not_4", scope: "produtor", title: "Novo pedido recebido", body: "Hortifruti Sabor da Terra fez um pedido de batata e cenoura.", createdAt: daysAgoISO(0, 1), read: false, type: "pedido", link: "/painel/pedidos/ord_1005" },
  { id: "not_5", scope: "produtor", title: "Nova avaliação", body: "Você recebeu uma avaliação 5 estrelas!", createdAt: daysAgoISO(9), read: true, type: "avaliacao", link: "/painel/avaliacoes" },
  { id: "not_6", scope: "produtor", title: "Novo pedido recebido", body: "Verdurão Central fez um pedido de batata e cenoura.", createdAt: daysAgoISO(0), read: false, type: "pedido", link: "/painel/pedidos/ord_2004" },
];
