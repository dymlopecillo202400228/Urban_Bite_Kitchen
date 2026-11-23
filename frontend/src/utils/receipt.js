import { jsPDF } from "jspdf";

export function downloadReceipt(order) {
  if (!order || !order.id) {
    throw new Error("Invalid order information.");
  }

  const pdf = new jsPDF();
  const items = order.order_items || order.items || [];

  let y = 20;

  const money = (amount) =>
    `PHP ${Number(amount || 0).toFixed(2)}`;

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(22);
  pdf.setTextColor(249, 115, 22);
  pdf.text("URBAN BITE KITCHEN", 105, y, {
    align: "center"
  });

  y += 10;

  pdf.setFontSize(13);
  pdf.setTextColor(40, 40, 40);
  pdf.text("ORDER RECEIPT", 105, y, {
    align: "center"
  });

  y += 15;

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);

  pdf.text(`Order ID: ${order.id}`, 20, y);
  y += 8;

  const date = order.created_at
    ? new Date(order.created_at).toLocaleString("en-PH")
    : new Date().toLocaleString("en-PH");

  pdf.text(`Date: ${date}`, 20, y);
  y += 8;

  pdf.text(
    `Customer: ${order.full_name || order.customer_name || "Customer"}`,
    20,
    y
  );
  y += 8;

  pdf.text(`Phone: ${order.phone || "N/A"}`, 20, y);
  y += 8;

  pdf.text("Payment: Cash on Delivery", 20, y);
  y += 8;

  pdf.text(
    `Order Status: ${order.status || "pending"}`,
    20,
    y
  );
  y += 10;

  pdf.setFont("helvetica", "bold");
  pdf.text("Delivery Address:", 20, y);
  y += 7;

  pdf.setFont("helvetica", "normal");

  const address = pdf.splitTextToSize(
    String(order.delivery_address || order.address || "N/A"),
    165
  );

  pdf.text(address, 20, y);
  y += address.length * 6 + 10;

  pdf.setDrawColor(220, 220, 220);
  pdf.line(20, y, 190, y);
  y += 10;

  pdf.setFont("helvetica", "bold");
  pdf.text("ORDERED ITEMS", 20, y);
  y += 10;

  let calculatedTotal = 0;

  items.forEach((item) => {
    if (y > 260) {
      pdf.addPage();
      y = 20;
    }

    const name =
      item.product_name ||
      item.name ||
      item.products?.name ||
      "Food Item";

    const quantity = Number(item.quantity || 1);

    const price = Number(
      item.unit_price ?? item.price ?? 0
    );

    const subtotal = Number(
      item.subtotal ??
      item.line_total ??
      quantity * price
    );

    calculatedTotal += subtotal;

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);

    const nameLines = pdf.splitTextToSize(
      `${name} (${quantity} x ${money(price)})`,
      120
    );

    pdf.text(nameLines, 20, y);

    pdf.text(money(subtotal), 190, y, {
      align: "right"
    });

    y += Math.max(9, nameLines.length * 6 + 3);
  });

  if (y > 255) {
    pdf.addPage();
    y = 20;
  }

  y += 5;

  pdf.line(20, y, 190, y);
  y += 12;

  const total = Number(
    order.total_amount ??
    order.total ??
    calculatedTotal
  );

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(14);

  pdf.text("TOTAL:", 20, y);
  pdf.text(money(total), 190, y, {
    align: "right"
  });

  y += 12;

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  pdf.text("Payment due upon delivery.", 20, y);

  y += 15;

  pdf.setTextColor(120, 120, 120);
  pdf.text(
    "Thank you for ordering from Urban Bite Kitchen!",
    105,
    y,
    { align: "center" }
  );

  const shortId = String(order.id)
    .replace(/[^a-zA-Z0-9-]/g, "")
    .slice(0, 18);

  pdf.save(`UrbanBite-Receipt-${shortId}.pdf`);
}
