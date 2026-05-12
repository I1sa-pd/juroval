import {
  PieChart, Pie, Cell, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid,
} from "recharts";

export const CHART_COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899", "#84cc16"];

type Datum = { name: string; value?: number; [key: string]: any };

export const RPieChart = ({ data }: { data: Datum[] }) => {
  if (data.length === 0) return <Empty />;
  const total = data.reduce((s, d) => s + (d.value ?? 0), 0);
  // Si todo es 0, mostrar mensaje con leyenda visible
  if (total === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-3">
        <p className="text-xs text-muted-foreground">Sin casos activos</p>
        <div className="flex flex-wrap justify-center gap-x-3 gap-y-1">
          {data.map((d, i) => (
            <div key={d.name} className="flex items-center gap-1">
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
        <Tooltip formatter={(value) => [value, ""]} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
      </PieChart>
    </ResponsiveContainer>
  );
};

export const RBarChart = ({
  data,
  horizontal = false,
  groupKeys,
}: {
  data: Datum[];
  horizontal?: boolean;
  groupKeys?: string[];
}) => {
  if (data.length === 0) return <Empty />;
  const isGrouped = groupKeys && groupKeys.length > 0;
  const GROUP_COLORS: Record<string, string> = {
    activos: "#6366f1",
    cerrados: "#10b981",
    value: "#6366f1",
  };
  const labelMap: Record<string, string> = {
    activos: "Activos",
    cerrados: "Cerrados",
    value: "Casos",
  };
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        layout={horizontal ? "vertical" : "horizontal"}
        margin={{ left: horizontal ? 90 : 0, right: 10, top: 5, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        {horizontal ? (
          <>
            <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} domain={[0, "auto"]} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={90} />
          </>
        ) : (
          <>
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} domain={[0, "auto"]} />
          </>
        )}
        <Tooltip />
        {isGrouped ? (
          <>
            <Legend wrapperStyle={{ fontSize: 11 }} formatter={(v) => labelMap[v] ?? v} />
            {groupKeys!.map((key, i) => (
              <Bar
                key={key}
                dataKey={key}
                name={labelMap[key] ?? key}
                fill={GROUP_COLORS[key] ?? CHART_COLORS[i % CHART_COLORS.length]}
                radius={[4, 4, 0, 0]}
                barSize={horizontal ? 12 : undefined}
              />
            ))}
          </>
        ) : (
          <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={horizontal ? 14 : undefined}>
            {data.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
          </Bar>
        )}
      </BarChart>
    </ResponsiveContainer>
  );
};

export const RLineChart = ({ data }: { data: Datum[] }) => {
  if (data.length === 0) return <Empty />;
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
        <Tooltip />
        <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, fill: "#6366f1" }} />
      </LineChart>
    </ResponsiveContainer>
  );
};

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
        <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
        <Tooltip />
        {lineKeys.length > 1 && <Legend wrapperStyle={{ fontSize: 11 }} />}
        {lineKeys.map((key, i) => (
          <Line
            key={key}
            type="monotone"
            dataKey={key}
            stroke={colors[i % colors.length]}
            strokeWidth={2.5}
            dot={{ r: 4, fill: colors[i % colors.length] }}
            activeDot={{ r: 6 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};

const Empty = () => (
  <div className="h-full flex items-center justify-center text-xs text-muted-foreground">Sin datos suficientes</div>
);