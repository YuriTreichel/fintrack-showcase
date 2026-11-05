import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Exporta transações para um PDF bem formatado e organizado.
 *
 * @param {Object} params
 * @param {Array}  params.transactions  - Lista de transações já filtradas
 * @param {Object} params.user          - Usuário logado (name, email)
 * @param {string} params.filterLabel   - Texto descritivo do período/filtro (ex: "Julho 2026")
 * @param {Object} params.summary       - { income, expense, balance }
 */
export function exportTransactionsPdf({ transactions, user, filterLabel, summary }) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;

  // ── Design tokens ──────────────────────────────────────────────
  const colors = {
    primary:   [72, 187, 176],   // #48BBB0  (mint mais forte para impressão)
    mint:      [152, 229, 221],  // #98e5dd
    mintLight: [232, 250, 248],  // fundo suave mint
    red:       [239, 68, 68],    // #ef4444
    redLight:  [254, 242, 242],  // fundo suave vermelho
    dark:      [24, 24, 27],     // zinc-900
    gray600:   [82, 82, 91],     // zinc-600
    gray400:   [161, 161, 170],  // zinc-400
    gray200:   [228, 228, 231],  // zinc-200
    gray100:   [243, 244, 246],  // zinc-100
    white:     [255, 255, 255],
  };

  const fmt = (v) =>
    Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const fmtDate = (d) => {
    if (!d) return '—';
    const parts = d.split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return d;
  };

  const typeLabels = {
    Income: 'Receita',
    Expense: 'Despesa',
    Transfer: 'Transferência',
    GoalDeposit: 'Depósito Meta',
  };

  const statusLabels = {
    Paid: 'Pago',
    Pending: 'Pendente',
  };

  const now = new Date();
  const generatedAt = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} às ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  // ── Helper: desenha retângulo arredondado ───────────────────────
  const roundedRect = (x, y, w, h, r, fillColor) => {
    doc.setFillColor(...fillColor);
    doc.roundedRect(x, y, w, h, r, r, 'F');
  };

  // ══════════════════════════════════════════════════════════════════
  // HEADER — Barra superior com gradiente (simulado) e branding
  // ══════════════════════════════════════════════════════════════════
  const headerH = 38;
  roundedRect(0, 0, pageWidth, headerH, 0, colors.primary);

  // Logo / Nome
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(...colors.white);
  doc.text('FinTrack Pro', margin, 16);

  // Subtítulo
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(255, 255, 255);
  doc.text('Relatório de Transações', margin, 23);

  // Info do usuário (lado direito)
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...colors.white);
  doc.text(user?.name || 'Usuário', pageWidth - margin, 14, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`Gerado em ${generatedAt}`, pageWidth - margin, 20, { align: 'right' });

  // Período
  if (filterLabel) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(`Período: ${filterLabel}`, pageWidth - margin, 27, { align: 'right' });
  }

  // Linha decorativa inferior ao header
  doc.setDrawColor(...colors.mint);
  doc.setLineWidth(0.8);
  doc.line(margin, headerH + 1, pageWidth - margin, headerH + 1);

  // ══════════════════════════════════════════════════════════════════
  // RESUMO FINANCEIRO — 3 cards com totais
  // ══════════════════════════════════════════════════════════════════
  let y = headerH + 8;
  const cardW = (contentWidth - 8) / 3;
  const cardH = 22;

  // Card Receitas
  roundedRect(margin, y, cardW, cardH, 3, colors.mintLight);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...colors.primary);
  doc.text('RECEITAS', margin + 5, y + 7);
  doc.setFontSize(13);
  doc.text(`R$ ${fmt(summary.income)}`, margin + 5, y + 16);

  // Card Despesas
  const card2X = margin + cardW + 4;
  roundedRect(card2X, y, cardW, cardH, 3, colors.redLight);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...colors.red);
  doc.text('DESPESAS', card2X + 5, y + 7);
  doc.setFontSize(13);
  doc.text(`R$ ${fmt(summary.expense)}`, card2X + 5, y + 16);

  // Card Saldo
  const card3X = margin + (cardW + 4) * 2;
  const balanceColor = summary.balance >= 0 ? colors.primary : colors.red;
  const balanceBg = summary.balance >= 0 ? colors.mintLight : colors.redLight;
  roundedRect(card3X, y, cardW, cardH, 3, balanceBg);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...balanceColor);
  doc.text('SALDO', card3X + 5, y + 7);
  doc.setFontSize(13);
  doc.text(`R$ ${fmt(summary.balance)}`, card3X + 5, y + 16);

  y += cardH + 6;

  // Info de quantidade
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...colors.gray400);
  doc.text(`${transactions.length} transações encontradas`, margin, y + 3);
  y += 8;

  // ══════════════════════════════════════════════════════════════════
  // TABELA DE TRANSAÇÕES
  // ══════════════════════════════════════════════════════════════════
  const tableHeaders = [['Data', 'Descrição', 'Categoria', 'Conta', 'Tipo', 'Status', 'Valor (R$)']];

  const tableData = transactions.map((t) => {
    const isIncome = t.type === 'Income';
    return [
      fmtDate(t.date),
      t.description || '—',
      t.category_name || '—',
      t.account_name || '—',
      typeLabels[t.type] || t.type,
      statusLabels[t.status] || t.status,
      `${isIncome ? '+' : '-'} ${fmt(t.amount)}`,
    ];
  });

  autoTable(doc, {
    head: tableHeaders,
    body: tableData,
    startY: y,
    margin: { left: margin, right: margin },
    theme: 'plain',
    styles: {
      font: 'helvetica',
      fontSize: 8,
      cellPadding: { top: 3, bottom: 3, left: 3, right: 3 },
      lineColor: colors.gray200,
      lineWidth: 0.2,
      textColor: colors.dark,
      overflow: 'ellipsize',
    },
    headStyles: {
      fillColor: colors.primary,
      textColor: colors.white,
      fontStyle: 'bold',
      fontSize: 7.5,
      cellPadding: { top: 4, bottom: 4, left: 3, right: 3 },
      halign: 'left',
    },
    alternateRowStyles: {
      fillColor: colors.gray100,
    },
    columnStyles: {
      0: { cellWidth: 20, halign: 'center' },                     // Data
      1: { cellWidth: 'auto' },                                    // Descrição
      2: { cellWidth: 28 },                                        // Categoria
      3: { cellWidth: 25 },                                        // Conta
      4: { cellWidth: 22, halign: 'center' },                     // Tipo
      5: { cellWidth: 18, halign: 'center' },                     // Status
      6: { cellWidth: 26, halign: 'right', fontStyle: 'bold' },   // Valor
    },
    didParseCell: (data) => {
      // Coluna Valor — cor condicional
      if (data.section === 'body' && data.column.index === 6) {
        const raw = data.cell.raw || '';
        if (raw.startsWith('+')) {
          data.cell.styles.textColor = colors.primary;
        } else {
          data.cell.styles.textColor = colors.red;
        }
      }

      // Coluna Status — badge visual
      if (data.section === 'body' && data.column.index === 5) {
        const val = data.cell.raw || '';
        if (val === 'Pago') {
          data.cell.styles.textColor = colors.primary;
          data.cell.styles.fontStyle = 'bold';
        } else if (val === 'Pendente') {
          data.cell.styles.textColor = [234, 88, 12]; // orange-600
          data.cell.styles.fontStyle = 'bold';
        }
      }

      // Coluna Tipo — cor por tipo
      if (data.section === 'body' && data.column.index === 4) {
        const val = data.cell.raw || '';
        if (val === 'Receita') {
          data.cell.styles.textColor = colors.primary;
        } else if (val === 'Despesa') {
          data.cell.styles.textColor = colors.red;
        } else {
          data.cell.styles.textColor = [99, 102, 241]; // indigo-500 para transfer
        }
      }
    },
    didDrawPage: (data) => {
      // ── Footer em cada página ──────────────────────────────────
      const pageCount = doc.internal.getNumberOfPages();
      const currentPage = doc.internal.getCurrentPageInfo().pageNumber;

      // Linha superior do footer
      doc.setDrawColor(...colors.gray200);
      doc.setLineWidth(0.3);
      doc.line(margin, pageHeight - 14, pageWidth - margin, pageHeight - 14);

      // Texto do footer
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...colors.gray400);
      doc.text('FinTrack Pro — Relatório gerado automaticamente', margin, pageHeight - 9);
      doc.text(`Página ${currentPage} de ${pageCount}`, pageWidth - margin, pageHeight - 9, { align: 'right' });
    },
  });

  // ── Salvar ──────────────────────────────────────────────────────
  const safePeriod = (filterLabel || 'todas').replace(/\s+/g, '_').replace(/[^\w\-]/g, '');
  doc.save(`FinTrack_Transacoes_${safePeriod}.pdf`);
}
