import React from "react";

export const ExportCard = React.forwardRef(function ExportCard(
  { title, currency, totals, friendsCount, vaquitaId },
  ref
) {
  const today = new Date().toLocaleDateString();

  return (
    <div
      ref={ref}
      style={{
        width: "794px", // ~ A4 @ 96dpi (opcional)
        background: "#fff",
        color: "#111",
        fontFamily: "Arial, sans-serif",
        padding: "24px",
        border: "1px solid #e5e7eb",
        borderRadius: "12px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
        <div>
          <div style={{ fontSize: "18px", fontWeight: 800, marginBottom: "6px" }}>
            Liquidación Final
          </div>
          <div style={{ fontSize: "12px", color: "#555" }}>
            Vaquita: <b>{title || vaquitaId}</b> · Fecha: <b>{today}</b> · Amigos: <b>{friendsCount}</b>
          </div>
        </div>

        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "12px", color: "#555" }}>Total</div>
          <div style={{ fontSize: "18px", fontWeight: 800 }}>
            {currency}{Number(totals.total || 0).toLocaleString()}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
        <div style={{ flex: 1, border: "1px solid #e5e7eb", borderRadius: "10px", padding: "10px" }}>
          <div style={{ fontSize: "10px", color: "#666", fontWeight: 700, textTransform: "uppercase" }}>Cuota p/p</div>
          <div style={{ fontSize: "16px", fontWeight: 800 }}>
            {currency}{Number(totals.average || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </div>
        </div>
        <div style={{ flex: 1, border: "1px solid #e5e7eb", borderRadius: "10px", padding: "10px" }}>
          <div style={{ fontSize: "10px", color: "#666", fontWeight: 700, textTransform: "uppercase" }}>Transacciones</div>
          <div style={{ fontSize: "16px", fontWeight: 800 }}>
            {totals.transactions?.length || 0}
          </div>
        </div>
      </div>

      <div style={{ marginTop: "18px" }}>
        <div style={{ fontSize: "12px", fontWeight: 800, marginBottom: "8px" }}>Detalle</div>

        {(totals.transactions?.length || 0) === 0 ? (
          <div style={{ padding: "24px", border: "1px dashed #d1d5db", borderRadius: "12px", textAlign: "center", color: "#666" }}>
            Todo está saldado
          </div>
        ) : (
          <div style={{ border: "1px solid #e5e7eb", borderRadius: "12px", overflow: "hidden" }}>
            <div style={{ display: "flex", padding: "10px 12px", background: "#f3f4f6", fontSize: "11px", fontWeight: 800 }}>
              <div style={{ flex: 1 }}>Debe</div>
              <div style={{ flex: 1 }}>Cobra</div>
              <div style={{ width: "140px", textAlign: "right" }}>Monto</div>
            </div>

            {totals.transactions.map((t, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  padding: "10px 12px",
                  borderTop: "1px solid #e5e7eb",
                  fontSize: "12px",
                }}
              >
                <div style={{ flex: 1, fontWeight: 700 }}>{t.from}</div>
                <div style={{ flex: 1, fontWeight: 700 }}>{t.to}</div>
                <div style={{ width: "140px", textAlign: "right", fontWeight: 800 }}>
                  {currency}{Number(t.amount || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginTop: "16px", fontSize: "10px", color: "#666" }}>
        Generado por Vaquita · {new Date().toLocaleString()}
      </div>
    </div>
  );
});
