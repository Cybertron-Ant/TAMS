import React, { useEffect, useState } from "react";
import { fetchWithAuth } from "../app/fetchWrapper"; // Adjust the import path as needed
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

interface HRRequest {
  id: number;
  typeHRRequestId: number;
  docLink: string | null;
  requestDate: string;
  sentDocDate: string | null;
  employeeCode: string;
  typeHRRequest: {
    id: number;
    type: string;
  };
}

const HRRequestsCom: React.FC = () => {
  const API_URL = import.meta.env.VITE_TMS_PROD;
  const navigate = useNavigate();
  const [hrRequests, setHRRequests] = useState<HRRequest[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    fetchHRRequests();
  }, []);

  const fetchHRRequests = async () => {
    try {
      const response = await fetchWithAuth(`${API_URL}/HRRequest`);
      const data: HRRequest[] = await response.json();
      const filteredRequests = data.filter((req) => !req.docLink);
      setHRRequests(filteredRequests);
    } catch (error) {
      console.error("Error fetching HR Requests:", error);
      toast.error("Failed to fetch HR Requests.");
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const uploadFile = async (requestId: number) => {
    if (!selectedFile) {
      toast.error("Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetchWithAuth(
        `${API_URL}/HRRequest/${requestId}/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) throw new Error("Failed to upload file");

      const result = await response.json();
      toast.success("File uploaded successfully");
      fetchHRRequests(); // Refresh the list after uploading
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Failed to upload file.");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const handleEdit = (id: number) => {
    const requestToEdit = hrRequests.find((request) => request.id === id);
    navigate("/edit-hr-request", { state: { request: requestToEdit } });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center w-full">
        <h2 className="text-2xl font-bold">Employees Requests</h2>
        <div className="px-2.5 py-1 bg-green-500 rounded-lg text-white text-base font-medium">
          {hrRequests.length}
        </div>
      </div>
      {hrRequests.map((request) => (
        <div
          key={request.id}
          className="flex justify-between items-center p-4 border-b border-gray-300"
        >
          <div>
            <h4 className="text-lg font-semibold">
              {request.typeHRRequest.type}
            </h4>
            <p className="text-sm text-gray-500">
              {request.employeeCode} - {formatDate(request.requestDate)}
            </p>
          </div>
          <div>
            <button
              className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-lg"
              onClick={() => handleEdit(request.id)}
            >
              Upload Document
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default HRRequestsCom;
