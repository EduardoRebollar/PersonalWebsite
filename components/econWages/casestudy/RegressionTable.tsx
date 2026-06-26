/* Formal main-regression output — ported from design-source/econ-wages/
   ew-shared.jsx. Static; renders on the server. */
import { main, fmt, signed } from '@/content/data/econWages/caseStudy';

export function RegressionTable() {
  const m = main;
  return (
    <table className="ew-regtable">
      <thead>
        <tr>
          <th>Variable</th>
          <th>Coef.</th>
          <th>Std. err.</th>
          <th>t</th>
          <th>Sig.</th>
        </tr>
      </thead>
      <tbody>
        {m.rows.map((r) => (
          <tr key={r.key} className={r.interest ? 'interest' : undefined}>
            <td>
              {r.label}
              {r.interest ? ' ◀' : ''}
            </td>
            <td>{signed(r.b)}</td>
            <td>{r.se.toFixed(3)}</td>
            <td>
              {r.t > 0 ? '' : '−'}
              {Math.abs(r.t).toFixed(2)}
            </td>
            <td>
              {r.sig ? (
                <span className="sig-star">✱✱✱</span>
              ) : (
                <span className="ns">n.s.</span>
              )}
            </td>
          </tr>
        ))}
        <tr>
          <td className="ew-regtable-cons">Constant</td>
          <td>{m.cons.toFixed(3)}</td>
          <td>{m.consSE.toFixed(3)}</td>
          <td>{m.consT.toFixed(1)}</td>
          <td>
            <span className="sig-star">✱✱✱</span>
          </td>
        </tr>
      </tbody>
      <tfoot>
        <tr>
          <td colSpan={5}>
            N = {fmt(m.n)} · R² = {m.r2.toFixed(3)} · F({m.df}) = {fmt(m.f, 2)} · one-sided tests at 5%
          </td>
        </tr>
      </tfoot>
    </table>
  );
}
