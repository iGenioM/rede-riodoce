"use client";

import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { ProductForm, type ProductFormValues } from "@/components/ProductForm";
import { useSessionStore } from "@/lib/store/useSessionStore";
import { useProductsStore } from "@/lib/store/useProductsStore";
import { useToastStore } from "@/lib/store/useToastStore";
import { CATEGORIES } from "@/lib/mockData";

export default function NovoProdutoPage() {
  const router = useRouter();
  const producerId = useSessionStore((s) => s.producerId);
  const addProduct = useProductsStore((s) => s.addProduct);
  const showToast = useToastStore((s) => s.show);

  function handleSubmit(values: ProductFormValues) {
    const category = CATEGORIES.find((c) => c.id === values.categoryId) ?? CATEGORIES[0];
    addProduct({
      producerId,
      categoryId: values.categoryId,
      name: values.name,
      description: values.description,
      pricePerUnit: values.pricePerUnit,
      unit: values.unit,
      availableQty: values.availableQty,
      organic: values.organic,
      active: true,
      harvestedAt: new Date().toISOString(),
      imageSeed: { emoji: values.emoji, from: category.gradient[0], to: category.gradient[1] },
    });
    showToast("Produto adicionado com sucesso!", "success");
    router.push("/painel/produtos");
  }

  return (
    <AppShell>
      <PageHeader title="Novo produto" onBack={() => router.push("/painel/produtos")} />
      <div className="px-4 pt-4">
        <ProductForm onSubmit={handleSubmit} submitLabel="Publicar produto" />
      </div>
    </AppShell>
  );
}
