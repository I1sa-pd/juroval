import {
  PieChart, Pie, Cell, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid,
} from "recharts";

export const CHART_COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899", "#84cc16"];

type Datum = { name: string; value: number };

/* ── Pie ── */
export const RPieChart = ({ data }: { data: Datum[] }) => {
  if (data.length === 0) return <Empty />;
  const total = data.reduce((s, d) => s + (d.value ?? 0), 0);
  if (total === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-3">
        <p className="text-xs text-muted-foreground">Sin casos activos</p>
        <div className="flex flex-wrap justify-center gap-x-3 gap-y-1.5">
          {data.map((d, i) => (
            <div key={d.name} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
              <span className="text-[11px] text-muted-foreground">{d.name}: 0</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={45} outerRadius={85} paddingAngle={3}>
          {data.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
        </Pie>
        <Tooltip formatter={(v) => [`${v} caso${v !== 1 ? "s" : ""}`, ""]} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
      </PieChart>
    </ResponsiveContainer>
  );
};

/* ── Bar ── */
export const RBarChart = ({
  data,
  horizontal = false,
  groupKeys,
  height,
}: {
  data: any[];
  horizontal?: boolean;
  groupKeys?: string[];
  height?: number;
}) => {
  if (data.length === 0) return <Empty />;

  const yWidth = horizontal
    ? Math.min(160, Math.max(60, Math.max(...data.map((d) => (d.name?.length ?? 0))) * 7))
    : undefined;

  const chart = (
    <BarChart
      data={data}
      layout={horizontal ? "vertical" : "horizontal"}
      margin={{ left: 0, right: 16, top: 5, bottom: 5 }}
    >
      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
      {horizontal ? (
        <>
          <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} domain={[0, "auto"]} />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={yWidth} />
        </>
      ) : (
        <>
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} allowDecimals={false} domain={[0, "auto"]} />
        </>
      )}
      <Tooltip formatter={(v) => [`${v}`, ""]} />
      {groupKeys ? (
        <>
          {groupKeys.length > 1 && <Legend wrapperStyle={{ fontSize: 11 }} />}
          {groupKeys.map((key, i) => (
            <Bar key={key} dataKey={key} fill={CHART_COLORS[i % CHART_COLORS.length]} radius={[4, 4, 0, 0]} />
          ))}
        </>
      ) : (
        <Bar dataKey="value" radius={horizontal ? [0, 6, 6, 0] : [6, 6, 0, 0]}>
          {data.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
        </Bar>
      )}
    </BarChart>
  );

  // Cuando se pasa height explícito (barras horizontales), lo usamos directamente
  // en lugar de depender del contenedor padre — evita el bug de height="100%" en Recharts
  if (height) {
    return (
      <ResponsiveContainer width="100%" height={height}>
        {chart}
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      {chart}
    </ResponsiveContainer>
  );
};

/* ── Line simple ── */
export const RLineChart = ({ data }: { data: Datum[] }) => {
  if (data.length === 0) return <Empty />;
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} allowDecimals={false} domain={[0, "auto"]} />
        <Tooltip />
        <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={3}
          dot={{ r: 4, fill: "#6366f1" }} activeDot={{ r: 6 }} />
      </LineChart>
    </ResponsiveContainer>
  );
};

/* ── Multi-line (proyección por abogado) ── */
export const RMultiLineChart = ({
  data,
  lineKeys,
  colors,
}: {
  data: { name: string; [key: string]: any }[];
  lineKeys: string[];
  colors: string[];
}) => {
  if (data.length === 0 || lineKeys.length === 0) return <Empty />;
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} allowDecimals={false} domain={[0, "auto"]} />
        <Tooltip />
        {lineKeys.length > 1 && <Legend wrapperStyle={{ fontSize: 11 }} />}
        {lineKeys.map((key, i) => (
          <Line key={key} type="monotone" dataKey={key}
            stroke={colors[i % colors.length]} strokeWidth={2.5}
            dot={{ r: 4, fill: colors[i % colors.length] }} activeDot={{ r: 6 }} />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};

const Empty = () => (
  <div className="h-full flex items-center justify-center text-xs text-muted-foreground">Sin datos suficientes</div>
);