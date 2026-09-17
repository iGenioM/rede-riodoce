"use client";

import { useMemo, useState } from "react";
import { useNavigate } from "@/hooks/useNavigate";
import { Plus, Pencil, Trash2, Package, EyeOff, Eye } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge, Button, EmptyState } from "@/components/ui";
import { ProductImage } from "@/components/ui/ProductImage";
import { BottomSheet } from "@/components/ui/Sheet";
import { useSessionStore } from "@/lib/store/useSessionStore";
import { useProductsStore } from "@/lib/store/useProductsStore";
import { useToastStore } from "@/lib/store/useToastStore";
import { CATEGORIES } from "@/lib/mockData";
import { formatBRL } from "@/lib/utils";
import { unitLabel } from "@/lib/units";

export default function ProdutosPainelPage() {
  const { push, replace, back } = useNavigate();
  const producerId = useSessionStore((s) => s.producerId);
  const allProducts = useProductsStore((s) => s.products);
  const products = useMemo(
    () => allProducts.filter((p) => p.producerId === producerId),
    [allProducts, producerId]
  );
  const toggleActive = useProductsStore((s) => s.toggleActive);
  const removeProduct = useProductsStore((s) => s.removeProduct);
  const showToast = useToastStore((s) => s.show);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const sorted = useMemo(() => [...products].sort((a, b) => Number(b.active) - Number(a.active)), [products]);
  const productToDelete = products.find((p) => p.id === confirmDelete);

  return (
    <AppShell>
      <PageHeader
        title="Meus produtos"
        onBack={() => push("/painel")}
        right={
          <Button size="sm" onClick={() => push("/painel/produtos/novo")}>
            <Plus size={14} /> Novo
          </Button>
        }
      />

      <div className="flex flex-col gap-2.5 px-4 pt-4">
        {sorted.length === 0 ? (
          <EmptyState
            icon={<Package size={24} />}
            title="Nenhum produto cadastrado"
            description="Adicione seu primeiro produto para começar a vender."
            action={
              <Button onClick={() => push("/painel/produtos/novo")}>
                <Plus size={15} /> Adicionar produto
              </Button>
            }
          />
        ) : (
          sorted.map((product) => {
            const category = CATEGORIES.find((c) => c.id === product.categoryId);
            return (
              <div
                key={product.id}
                className={`flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm ${!product.active ? "opacity-50" : ""}`}
              >
                <ProductImage seed={product.imageSeed} className="h-14 w-14 shrink-0" emojiClassName="text-2xl" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-ink-900">{product.name}</p>
                  <p className="text-xs text-ink-500">{category?.name}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-sm font-bold text-forest-800">
                      {formatBRL(product.pricePerUnit)}/{unitLabel(product.unit)}
                    </span>
                    <Badge variant={product.availableQty > 0 ? "outline" : "tomato"}>
                      {product.availableQty} {unitLabel(product.unit, product.availableQty > 1)} em estoque
                    </Badge>
                  </div>
                </div>
                <div className="flex shrink-0 flex-col gap-1.5">
                  <button
                    onClick={() => push(`/painel/produtos/${product.id}/editar`)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-cream-200 text-ink-700"
                    aria-label="Editar"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={() => {
                      toggleActive(product.id);
                      showToast(product.active ? "Produto pausado" : "Produto ativado", "default");
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-cream-200 text-ink-700"
                    aria-label="Ativar/pausar"
                  >
                    {product.active ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                  <button
                    onClick={() => setConfirmDelete(product.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-tomato/10 text-tomato"
                    aria-label="Excluir"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <BottomSheet open={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Excluir produto">
        <div className="pb-5">
          <p className="text-sm text-ink-700">
            Tem certeza que deseja excluir <strong>{productToDelete?.name}</strong>? Essa ação não pode ser desfeita.
          </p>
          <div className="mt-4 flex gap-2.5">
            <Button variant="outline" className="flex-1" onClick={() => setConfirmDelete(null)}>
              Cancelar
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              onClick={() => {
                if (confirmDelete) {
                  removeProduct(confirmDelete);
                  showToast("Produto excluído", "default");
                }
                setConfirmDelete(null);
              }}
            >
              Excluir
            </Button>
          </div>
        </div>
      </BottomSheet>
    </AppShell>
  );
}
