import { getBankAccount, getCatalog } from "./actions";
import OrderForm from "./order-form";

export const dynamic = "force-dynamic";

export default async function OrderPage() {
  const [catalog, bankAccount] = await Promise.all([getCatalog(), getBankAccount()]);

  return <OrderForm catalog={catalog} bankAccount={bankAccount} />;
}
