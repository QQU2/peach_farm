import { getBankAccount, getProducts } from "./actions";
import ProductsForm from "./products-form";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const [products, bank] = await Promise.all([getProducts(), getBankAccount()]);
  const account = bank
    ? { bankName: bank.bankName, holder: bank.holder, accountNo: bank.accountNo, phone: bank.phone }
    : { bankName: "", holder: "", accountNo: "", phone: "" };

  return <ProductsForm initialProducts={products} initialAccount={account} />;
}
