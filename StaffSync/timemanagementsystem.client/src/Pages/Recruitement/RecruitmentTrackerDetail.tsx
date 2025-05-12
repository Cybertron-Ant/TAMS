import React from "react";
import RecruitmentDetail from "./components/RecruitmentDetail";
import { useParams } from "react-router-dom";

const RecruitmentTrackerDetail: React.FC = () => {
    const {id} = useParams();

  return (
    <>
      <RecruitmentDetail onClose={()=> {}} recordId={id} />
    </>
  );
};

export default RecruitmentTrackerDetail;
