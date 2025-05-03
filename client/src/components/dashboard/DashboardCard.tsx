import { Card, CardContent } from "@/components/ui/card";

interface DashboardCardProps {
  title: string;
  value: number | string;
  changeText?: string;
  isPositive?: boolean;
  icon: string;
  iconBgClass: string;
  iconTextClass: string;
}

export function DashboardCard({
  title,
  value,
  changeText,
  isPositive = true,
  icon,
  iconBgClass,
  iconTextClass,
}: DashboardCardProps) {
  return (
    <Card className="bg-white overflow-hidden shadow">
      <CardContent className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={`rounded-md ${iconBgClass} bg-opacity-10 p-3`}>
              <i className={`${icon} ${iconTextClass} text-xl`}></i>
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-neutral-400 truncate">{title}</dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-semibold text-neutral-600">{value}</div>
                {changeText && (
                  <div className={`ml-2 flex items-baseline text-sm font-semibold ${isPositive ? 'text-secondary' : 'text-error'}`}>
                    <i className={isPositive ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'}></i>
                    <span className="sr-only">{isPositive ? 'Increased by' : 'Decreased by'}</span>
                    {changeText}
                  </div>
                )}
              </dd>
            </dl>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
