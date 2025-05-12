import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchWithAuth } from "../../app/fetchWrapper";
import { Button } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { DisciplinaryAction, HRRemark } from "./Disciplinary";






type ViewDisciplinaryParams = {
  employeeCode: string;
  id: string;
};

const ViewDisciplinary = () => {
  const { employeeCode, id } = useParams<ViewDisciplinaryParams>();
  const API_URL = import.meta.env.VITE_TMS_PROD;
  const [disciplinaryAction, setDisciplinaryAction] =
    useState<DisciplinaryAction | null>(null);

  useEffect(() => {
    const fetchDisciplinaryAction = async () => {
      try {
        const response = await fetchWithAuth(
          `${API_URL}/DisciplinaryTrackers/${employeeCode}/${id}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch disciplinary action");
        }
        const data: DisciplinaryAction = await response.json();
        setDisciplinaryAction(data);
      } catch (error) {
        console.error("Error:", error);
      }
    };

    if (employeeCode && id) {
      fetchDisciplinaryAction();
    }
  }, [employeeCode, id]);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (!disciplinaryAction) {
    return <div className="text-center mt-5">Loading...</div>;
  }

  const displayField = (
    label: string,
    value: string | null,
    isDate: boolean = false
  ) => (
    <div className="flex justify-between items-center py-2 border-b">
      <div className="text-gray-600">{label}</div>
      <div className="font-medium">
        {isDate ? formatDate(value || "") : value || "N/A"}
      </div>
    </div>
  );

  const displayHRRemarks = (remarks: HRRemark[]) => (
    <div className="pt-4 bg-white p-4 shadow-lg rounded-lg mt-5 transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-2xl">
      <h3 className="font-semibold text-xl text-gray-800 mb-3 border-b pb-2 border-gray-300">
        HR Remarks:
      </h3>
      <ul className="list-disc pl-6 space-y-3 text-gray-600">
        {remarks.map((remark) => (
          <li key={remark.hrRemarkId} className="text-sm leading-relaxed">
            <i className="fas fa-comments text-blue-500 mr-2"></i>
            {remark.remarkText}
          </li>
        ))}
      </ul>
    </div>
  );

  const employeeFullName = `${disciplinaryAction.firstName} ${disciplinaryAction.lastName}`;

  return (
    <>
      <div className="flex justify-between items-center">
        <div className="bg-gray-100 p-5 rounded-t-lg">
          <h1 className="text-3xl font-bold text-gray-800">
            Disciplinary Action Details
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Review the complete details of the disciplinary action below.
          </p>
        </div>
        <div className="flex justify-between mb-4">
          <Button
            sx={{
              backgroundColor: "grey",
              textTransform: "none",
              color: "white",
              "&:hover": { backgroundColor: "#2d2d2d" },
            }}
            onClick={() => history.back()}
          >
            <ArrowBackIcon sx={{ fontSize: "18px", mr: "5px" }} /> Go Back
          </Button>
        </div>
      </div>
      <div className="bg-white p-6 shadow-lg rounded-b-lg divide-y divide-gray-300">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <div className="col-span-2 flex justify-between">
            {displayField("Employee Name", " ")}
            <span className=" text-right">{employeeFullName}</span>
          </div>
          {displayField("Employee Code", disciplinaryAction.employeeCode)}
          {displayField(
            "Violation Category",
            disciplinaryAction.violationCategory
          )}
          {displayField("Offence Category", disciplinaryAction.offenceCategory)}
          {displayField(
            "Corrective Actions",
            disciplinaryAction.correctiveAction
          )}
          {displayField("Entry Date", disciplinaryAction.entryDate, true)}
          {displayField(
            "Date of Violation",
            disciplinaryAction.dateOfViolation,
            true
          )}
          {displayField(
            "Admin Hearing Date",
            disciplinaryAction.adminHearingDate,
            true
          )}
          {displayField(
            "Suspension Start Date",
            disciplinaryAction.suspensionStartDate,
            true
          )}
          {displayField(
            "Suspension End Date",
            disciplinaryAction.suspensionEndDate,
            true
          )}

          {displayField(
            "Explanation Date",
            disciplinaryAction.nte.dateSent,
            true
          )}
          {displayField("Occurrence", disciplinaryAction.occurrence)}
          <div className="col-span-2 flex justify-between">
            {displayField("Details", " ")}
            <span className=" text-right">{disciplinaryAction.details}</span>
          </div>
          <div className="col-span-2 flex justify-between">
            {displayField("Employee Explanation", " ")}

            <span className=" text-right">
              {disciplinaryAction.nte.remarks}
            </span>
          </div>

          <div className="col-span-2 flex justify-between">
            {displayField("Decision", " ")}

            <span className=" text-right">{disciplinaryAction.decision}</span>
          </div>
          <div className="col-span-2">
            {disciplinaryAction.nod &&
              displayHRRemarks(disciplinaryAction.nod.hrRemarks)}
          </div>

          {displayField("Nature", disciplinaryAction.nature)}
          {disciplinaryAction.nte &&
            displayField(
              "NTE Date Sent",
              disciplinaryAction.nte.dateSent,
              true
            )}
          {disciplinaryAction.nod &&
            displayField(
              "NOD Date Sent",
              disciplinaryAction.nod.dateSent,
              true
            )}
          {displayField(
            "Employee Signature",
            disciplinaryAction.employeeSignature
          )}
          {displayField(
            "Employee Signature Date",
            disciplinaryAction.employeeSignatureDate
          )}
          {displayField("Manger Signature", disciplinaryAction.mangerSignature)}
          {displayField(
            "Manger Signature Date",
            disciplinaryAction.mangerSignatureDate
          )}
        </div>

        {/* Links to documents */}
        <div className="pt-4 flex gap-4">
          {disciplinaryAction.nte?.fileLink && (
            <a
              href={disciplinaryAction.nte.fileLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 transition duration-200 ease-in-out underline"
            >
              View NTE Document
            </a>
          )}
          {disciplinaryAction.nod?.fileLink && (
            <a
              href={disciplinaryAction.nod.fileLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 transition duration-200 ease-in-out underline"
            >
              View NOD Document
            </a>
          )}
        </div>
      </div>
    </>
  );
};

export default ViewDisciplinary;
