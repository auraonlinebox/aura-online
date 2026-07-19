export function renderKeywordChartHtml(
  keywords: { positive: { keyword: string; count: number }[]; negative: { keyword: string; count: number }[] }
): string {
  if (!keywords?.positive?.length && !keywords?.negative?.length) return '';

  const allCounts = [
    ...(keywords.positive || []).map(k => k.count),
    ...(keywords.negative || []).map(k => k.count)
  ];
  const maxCount = Math.max(1, ...allCounts);

  const renderBar = (kw: string, count: number, color: string, align: 'left' | 'right') => {
    const pct = Math.round((count / maxCount) * 100);
    const labelFirst = align === 'left'
      ? `<span style="font-size:12px;color:#374151;white-space:nowrap;">${kw}</span>`
      : `<span style="font-size:11px;color:#9ca3af;font-weight:600;">${count}</span>`;
    const labelLast = align === 'left'
      ? `<span style="font-size:11px;color:#9ca3af;font-weight:600;">${count}</span>`
      : `<span style="font-size:12px;color:#374151;white-space:nowrap;">${kw}</span>`;
    const dir = align === 'right' ? ' direction:rtl;' : '';

    return `
      <div style="margin-bottom:6px;">
        <div style="display:flex;align-items:center;gap:4px;margin-bottom:1px;${align === 'right' ? 'flex-direction:row-reverse;' : ''}">
          ${labelFirst}
          ${labelLast}
        </div>
        <div style="background:#f3f4f6;border-radius:4px;height:12px;overflow:hidden;${dir}">
          <div style="width:${pct}%;height:100%;background:${color};border-radius:4px;"></div>
        </div>
      </div>`;
  };

  const posHtml = (keywords.positive || []).map(k => renderBar(k.keyword, k.count, '#10b981', 'left')).join('');
  const negHtml = (keywords.negative || []).map(k => renderBar(k.keyword, k.count, '#ef4444', 'right')).join('');

  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
      <tr>
        <td style="padding:20px;background:#f9fafb;border-radius:12px;border:1px solid #e5e7eb;">
          <h3 style="color:#1f2937;font-size:16px;font-weight:700;margin:0 0 2px;">Lo que dicen de vosotros <span style="font-weight:400;font-size:13px;color:#9ca3af;">(gráfico de ejemplo)</span></h3>
          <p style="color:#6b7280;font-size:13px;line-height:1.5;margin:0 0 16px;">Así analiza AURA las palabras clave que más se repiten en vuestras reseñas:</p>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td width="50%" style="vertical-align:top;padding-right:8px;">
                <p style="color:#059669;font-size:13px;font-weight:600;margin:0 0 8px;">- Lo que alaban</p>
                ${posHtml}
              </td>
              ${negHtml ? `<td width="50%" style="vertical-align:top;padding-left:8px;border-left:1px solid #e5e7eb;">
                <p style="color:#dc2626;font-size:13px;font-weight:600;margin:0 0 8px;">- Lo que critican</p>
                ${negHtml}
              </td>` : ''}
            </tr>
          </table>
          <p style="color:#9ca3af;font-size:11px;font-style:italic;margin:12px 0 0;text-align:center;">* Datos analizados automáticamente por AURA a partir de vuestras reseñas</p>
        </td>
      </tr>
    </table>`;
}


