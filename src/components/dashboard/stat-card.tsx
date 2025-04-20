
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import React from "react";

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
  delay?: number;
}

export function StatCard({
  title,
  value,
  icon,
  description,
  className,
  delay = 0,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <Card className={cn("glass hover-lift", className)}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium font-vazirmatn">{title}</CardTitle>
          <motion.div
            whileHover={{ scale: 1.2, rotate: 360 }}
            transition={{ duration: 0.3 }}
          >
            {icon}
          </motion.div>
        </CardHeader>
        <CardContent>
          <motion.div
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: delay + 0.2 }}
            className="text-2xl font-bold font-display"
          >
            {value}
          </motion.div>
          {description && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: delay + 0.4 }}
              className="text-xs text-muted-foreground font-vazirmatn"
            >
              {description}
            </motion.p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
