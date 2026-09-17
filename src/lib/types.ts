export type ProfileMode = "comprador" | "produtor";

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string; // lucide icon key
  gradient: [string, string];
}

export interface ImageSeed {
  emoji: string;
  from: string;
  to: string;
  /** URL de foto profissional (gerada via IA). Quando ausente ou falha ao
   * carregar, cai de volta pro placeholder gradiente + emoji (offline-safe). */
  photoUrl?: string;
}

export interface Producer {
  id: string;
  name: string;
  farmName: string;
  bio: string;
  city: string;
  state: string;
  location: GeoPoint;
  radiusKm: number;
  rating: number;
  ratingCount: number;
  memberSince: string; // ISO
  verified: boolean;
  whatsapp: string;
  avatarSeed: ImageSeed;
  coverSeed: ImageSeed;
  deliveryEstimateDays: [number, number];
  certifications: string[];
}

/** Embalagens de atacado (não varejo por kg/unidade). */
export type Unit = "cx" | "saco" | "fardo" | "engradado";

export interface Product {
  id: string;
  /** Agrupa a mesma "espécie" de produto vendida por produtores diferentes
   * (ex.: "alface" tem um productTypeId único, mas vários Products/ofertas). */
  productTypeId: string;
  producerId: string;
  categoryId: string;
  name: string;
  description: string;
  pricePerUnit: number;
  unit: Unit;
  availableQty: number;
  imageSeed: ImageSeed;
  organic: boolean;
  harvestedAt: string; // ISO
  active: boolean;
  soldTotal: number;
  /** Quantidade mínima (embalagens) para liberar negociação de preço. */
  minQtyForProposal: number;
}

export interface CartItem {
  productId: string;
  producerId: string;
  qty: number;
  /** Preço acordado em proposta aceita (substitui o preço de tabela). */
  negotiatedPricePerUnit?: number;
  proposalId?: string;
}

export type ProposalStatus = "pendente" | "aceita" | "recusada";

export interface PriceProposal {
  id: string;
  productId: string;
  productName: string;
  producerId: string;
  buyerBusinessName: string;
  buyerContactName: string;
  buyerAvatarSeed: ImageSeed;
  qty: number;
  unit: Unit;
  listPricePerUnit: number;
  proposedPricePerUnit: number;
  status: ProposalStatus;
  createdAt: string;
  updatedAt: string;
  note?: string;
}

export type OrderStatus =
  | "pendente"
  | "aceito"
  | "preparando"
  | "a_caminho"
  | "entregue"
  | "recusado"
  | "cancelado";

export interface OrderStatusEvent {
  status: OrderStatus;
  at: string;
  note?: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  qty: number;
  unit: Unit;
  pricePerUnit: number;
  imageSeed: ImageSeed;
}

export type BuyerKind = "hortifruti" | "mercado" | "verdurao";

export interface Order {
  id: string;
  checkoutGroupId: string;
  buyerId: string;
  /** Razão social do estabelecimento comprador (CNPJ) — não é mais pessoa física. */
  buyerName: string;
  buyerCnpj: string;
  buyerKind: BuyerKind;
  /** Pessoa de contato responsável pela compra no estabelecimento. */
  buyerContactName: string;
  buyerAvatarSeed: ImageSeed;
  buyerAddress: string;
  buyerLocation: GeoPoint;
  producerId: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  estimatedDeliveryAt?: string;
  deliveryNote?: string;
  statusHistory: OrderStatusEvent[];
  reviewed: boolean;
  distanceKm: number;
}

export interface Review {
  id: string;
  orderId: string;
  producerId: string;
  buyerId: string;
  buyerName: string;
  buyerAvatarSeed?: ImageSeed;
  rating: number;
  comment: string;
  createdAt: string;
  reply?: { text: string; at: string };
}

export interface BusinessBuyer {
  id: string;
  /** Razão social */
  businessName: string;
  cnpj: string;
  kind: BuyerKind;
  contactName: string;
  address: string;
  city: string;
  state: string;
  location: GeoPoint;
  avatarSeed: ImageSeed;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderRole: ProfileMode;
  text: string;
  createdAt: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  buyerId: string;
  producerId: string;
  lastMessageAt: string;
  lastMessagePreview: string;
  unreadForBuyer: number;
  unreadForProducer: number;
}

export interface AppNotification {
  id: string;
  scope: ProfileMode;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  type: "pedido" | "chat" | "avaliacao" | "proposta" | "sistema";
  link?: string;
  /** Produtor que deve ver/responder (propostas). */
  producerId?: string;
  proposalId?: string;
}

export interface BuyerAddress {
  label: string;
  street: string;
  city: string;
  state: string;
  location: GeoPoint;
}
