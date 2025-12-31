import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Treemap, ResponsiveContainer, Tooltip } from "recharts";
import { motion } from "framer-motion";

interface SegmentData {
  name: string;
  size: number;
  color: string;
}

interface CustomerSegmentsChartProps {
  data: SegmentData[];
  title?: string;
  description?: string;
  className?: string;
}

const CustomContent = (props: any) => {
  const { x, y, width, height, name, size } = props;
  if (width < 50 || height < 30) return null;
  
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={props.color || "hsl(var(--primary))"}
        stroke="hsl(var(--background))"
        strokeWidth={2}
        rx={4}
      />
      <text
        x={x + width / 2}
        y={y + height / 2 - 8}
        textAnchor="middle"
        fill="hsl(var(--primary-foreground))"
        fontSize={12}
        fontWeight="bold"
      >
        {name}
      </text>
      <text
        x={x + width / 2}
        y={y + height / 2 + 10}
        textAnchor="middle"
        fill="hsl(var(--primary-foreground))"
        fontSize={10}
        opacity={0.8}
      >
        {size.toLocaleString("fa-IR")}
      </text>
    </g>
  );
};

export function CustomerSegmentsChart({
  data,
  title = "بخش‌بندی مشتریان",
  description = "توزیع مشتریان بر اساس رفتار خرید",
  className,
}: CustomerSegmentsChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <Card className={className}>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <Treemap
              data={data}
              dataKey="size"
              aspectRatio={4 / 3}
              stroke="hsl(var(--background))"
              content={<CustomContent />}
            >
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                formatter={(value: number) => [
                  value.toLocaleString("fa-IR"),
                  "تعداد مشتریان",
                ]}
              />
            </Treemap>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
}
