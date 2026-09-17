"use client";

import { use } from "react";
import { useNavigate } from "@/hooks/useNavigate";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/ui";
import { ProductForm, type ProductFormValues } from "@/components/ProductForm";
import { useProductsStore } from "@/lib/store/useProductsStore";
import { useToastStore } from "@/lib/store/useToastStore";
import { CATEGORIES } from "@/lib/mockData";

export default function EditarProdutoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { push, replace, back } = useNavigate();
  const product = useProductsStore((s) => s.products.find((p) => p.id === id));
  const updateProduct = useProductsStore((s) => s.updateProduct);
  const showToast = useToastStore((s) => s.show);

  if (!product) {
    return (
      <AppShell>
        <PageHeader title="Editar produto" onBack={() => push("/painel/produtos")} />
        <EmptyState title="Produto não encontrado" />
      </AppShell>
    );
  }

  function handleSubmit(values: ProductFormValues) {
    const category = CATEGORIES.find((c) => c.id === values.categoryId) ?? CATEGORIES[0];
    updateProduct(product!.id, {
      categoryId: values.categoryId,
      name: values.name,
      description: values.description,
      pricePerUnit: values.pricePerUnit,
      unit: values.unit,
      availableQty: values.availableQty,
      organic: values.organic,
      imageSeed: { emoji: values.emoji, from: category.gradient[0], to: category.gradient[1] },
    });
    showToast("Produto atualizado!", "success");
    push("/painel/produtos");
  }

  return (
    <AppShell>
      <PageHeader title="Editar produto" onBack={() => push("/painel/produtos")} />
      <div className="px-4 pt-4">
        <ProductForm initial={product} onSubmit={handleSubmit} submitLabel="Salvar alterações" />
      </div>
    </AppShell>
  );
}
