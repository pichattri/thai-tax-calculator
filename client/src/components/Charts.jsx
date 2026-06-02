import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'

const COLORS = ['#E94560', '#0F3460', '#533483', '#16213E', '#e2b96f', '#4ade80']

const tooltipStyle = {
  backgroundColor: '#0F3460',
  border: '1px solid #374151',
  borderRadius: '8px',
  color: '#fff',
  fontSize: 12,
}

function ChartCard({ title, children }) {
  return (
    <div className="kol-card">
      <h3 className="font-heading text-sm font-medium text-gray-300 mb-4">{title}</h3>
      {children}
    </div>
  )
}

function countBy(kols, key) {
  const map = {}
  kols.forEach(k => {
    const val = k[key] || 'ไม่ระบุ'
    map[val] = (map[val] || 0) + 1
  })
  return Object.entries(map).map(([name, count]) => ({ name, count }))
}

function countByTags(kols) {
  const map = {}
  kols.forEach(k => {
    const tags = k.tags ? k.tags.split(',').filter(Boolean) : []
    tags.forEach(t => { map[t] = (map[t] || 0) + 1 })
  })
  return Object.entries(map).map(([name, count]) => ({ name, count }))
}

export default function Charts({ kols }) {
  const byPlatform = countBy(kols, 'platform')
  const byType = countBy(kols, 'type')
  const byCategory = countBy(kols, 'category')
  const byTag = countByTags(kols)

  const resultData = [
    { name: 'ผ่าน', value: kols.filter(k => k.kqsResult?.includes('ผ่าน') && !k.kqsResult?.includes('ไม่')).length },
    { name: 'พิจารณา', value: kols.filter(k => k.kqsResult?.includes('พิจารณา')).length },
    { name: 'ไม่ผ่าน', value: kols.filter(k => k.kqsResult?.includes('ไม่ผ่าน')).length },
  ].filter(d => d.value > 0)

  const resultColors = ['#4ade80', '#facc15', '#f87171']

  const CustomTick = ({ x, y, payload }) => (
    <text x={x} y={y + 12} textAnchor="middle" fill="#9ca3af" fontSize={11}>
      {payload.value.length > 10 ? payload.value.slice(0, 10) + '…' : payload.value}
    </text>
  )

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <ChartCard title="KOL แยกตาม Platform">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={byPlatform}>
            <XAxis dataKey="name" tick={CustomTick} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
            <Bar dataKey="count" fill="#E94560" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="KOL แยกตาม ประเภท">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={byType}>
            <XAxis dataKey="name" tick={CustomTick} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
            <Bar dataKey="count" fill="#533483" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="KOL แยกตาม หมวดหมู่">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={byCategory}>
            <XAxis dataKey="name" tick={CustomTick} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
            <Bar dataKey="count" fill="#0F3460" radius={[4, 4, 0, 0]}>
              {byCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="สัดส่วน ผ่าน / พิจารณา / ไม่ผ่าน">
        {resultData.length === 0 ? (
          <p className="text-center text-gray-500 text-sm py-12">ยังไม่มีข้อมูล KQS</p>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={resultData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                {resultData.map((_, i) => <Cell key={i} fill={resultColors[i]} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      {byTag.length > 0 && (
        <ChartCard title="KOL แยกตาม Tag / ทรีตเมนต์">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={byTag}>
              <XAxis dataKey="name" tick={CustomTick} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {byTag.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      )}
    </div>
  )
}
