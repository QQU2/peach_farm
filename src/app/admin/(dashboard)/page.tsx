import { getOrders } from "./actions";
import OrdersTable from "./orders-table";

export const dynamic = "force-dynamic";

function todayISO(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

export default async function AdminOrdersPage() {
  const dateFrom = todayISO(-30);
  const dateTo = todayISO();
  const rows = await getOrders(dateFrom, dateTo);

  return <OrdersTable initialRows={rows} initialDateFrom={dateFrom} initialDateTo={dateTo} />;
}
