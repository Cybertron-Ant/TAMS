import React from "react";

type DashboardCardProps = {
  title: string;
  value: string;
  color?: "blue" | "amber" | "white";
  icon?: JSX.Element;
  dropdownIcon?: JSX.Element;
};
const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  color = "blue",
  icon,
  dropdownIcon,
}) => {
  const backgroundColorClass = {
    blue: "bg-blue-600",
    amber: "bg-amber-400",
    white: "bg-white bg-opacity-50",
  }[color];

  return (
    <div
      className={`w-96 h-36 p-7 ${backgroundColorClass} rounded-lg flex justify-between items-center`}
    >
      <div className="flex-grow flex-shrink basis-0 h-28 flex flex-col justify-center items-start gap-3.5">
        <div className="flex w-full justify-between items-center">
          <div className="flex items-center gap-2">
            {icon && (
              <div className="w-6 h-6 flex justify-center items-center">
                {icon}
              </div>
            )}
            <div className="text-white text-lg font-medium leading-tight">
              {title}
            </div>
          </div>
          {dropdownIcon && (
            <div className="flex justify-center items-center">
              {dropdownIcon}
            </div>
          )}
        </div>
        <div className="text-white text-4xl font-bold">{value}</div>
      </div>
      {/* Additional content or icons can be placed here */}
    </div>
  );
};

export default DashboardCard;
