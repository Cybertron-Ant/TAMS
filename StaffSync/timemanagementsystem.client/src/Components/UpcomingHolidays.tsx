import React from "react";

// Define an interface for the props expected by the UpcomingHolidays component
interface UpcomingHolidaysProps {
  holidays: Holiday[];
}

// Define an interface for individual holiday records
interface Holiday {
  date: string;
  name: string;
  day: string;
}

const UpcomingHolidays: React.FC<UpcomingHolidaysProps> = ({ holidays }) => {
  return (
    <div className="w-full p-7 bg-white rounded-lg flex-col justify-start items-start gap-5">
      <h2 className="text-2xl font-bold">Upcoming Holidays</h2>
      {holidays.map((holiday: Holiday, index: number) => (
        <div
          key={index}
          className="flex items-center gap-9 py-3.5 border-b border-neutral-200"
        >
          <div className="px-2.5 py-1 bg-sky-200 rounded-lg text-lg font-bold">
            {holiday.date}
          </div>
          <div>
            <div className="text-lg font-normal">{holiday.name}</div>
            <div className="text-sm text-neutral-700">{holiday.day}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default UpcomingHolidays;
