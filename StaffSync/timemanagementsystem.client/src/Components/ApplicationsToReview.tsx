import React from "react";

// Define an interface for the props expected by the ApplicationsToReview component
interface ApplicationsToReviewProps {
  applications: Application[];
}

// Define an interface for individual application records
interface Application {
  name: string;
  position: string;
}

const ApplicationsToReview: React.FC<ApplicationsToReviewProps> = ({
  applications,
}) => {
  return (
    <div className="w-full p-7 bg-white rounded-lg flex-col justify-start items-start gap-5">
      <div className="flex justify-between items-center w-full">
        <h2 className="text-2xl font-bold">Applications to Review</h2>
        <div className="px-2.5 py-1 bg-sky-600 rounded-lg text-white text-base font-medium">
          {applications.length}
        </div>
      </div>
      {applications.map((application: Application, index: number) => (
        <div
          key={index}
          className="flex justify-between items-center w-full py-3.5 border-b border-neutral-200"
        >
          <div>
            <div className="text-lg font-normal">{application.name}</div>
            <div className="text-sm text-neutral-700">
              {application.position}
            </div>
          </div>
          <div className="px-2.5 py-1 bg-green-300 rounded-full text-center text-green-600 text-sm font-normal">
            Shortlisted
          </div>
        </div>
      ))}
    </div>
  );
};

export default ApplicationsToReview;
