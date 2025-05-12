import AppRegistrationRoundedIcon from "@mui/icons-material/AppRegistrationRounded";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import { Button, CircularProgress } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import DisplayBlob from "../../Components/DisplayBlob";
import { fetchWithAuth } from "../../app/fetchWrapper";
import ConfirmationModal from "../../Components/ConfirmationModal";

const AWSS3Detail: React.FC = () => {
  const API_URL = import.meta.env.VITE_TMS_PROD;
  const { fileName } = useParams<{ fileName: string }>();
  const navigate = useNavigate();
  const [resource, setResource] = useState<any>();
  const [loading, setLoading] = useState<boolean>(true);

  const fetchDetail = async () => {
    const endpoint = `${API_URL}/S3/preview/${fileName}`;

    try {
      const response = await fetchWithAuth(endpoint);
      const data = await response.blob();
      // error
      if (!response.ok) {
        throw new Error(
          `Unable to fectch details for resource with id: ${fileName}`
        );
      }

      // success
      setResource(data);
    } catch (error) {
      // error
      toast.error(error);
    } finally {
      // disable loader
      setLoading(false);
    }
  };

  // On Component Mount
  useEffect(() => {
    fetchDetail();
  }, []);

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-3xl text-neutral-800 font-bold mt-2">
            AWS S3 Manager
          </div>
          <div className="inline-flex items-center gap-1 text-base text-neutral-800 font-normal leading-loose">
            <span className="opacity-60">Dashboard</span>
            <span className="opacity-60">/</span>
            <span className="opacity-60">AWS S3 Manager</span>
            <span className="opacity-60">/</span>
            <span>AWS S3 Resource Info</span>
          </div>
        </div>
        <div>
          <Button
            sx={{
              backgroundColor: "black",
              color: "white",
              "&:hover": { backgroundColor: "#2d2d2d" },
            }}
            onClick={() => navigate("/aws-s3")}
          >
            <ArrowBackIcon sx={{ fontSize: "18px", mr: "5px" }} /> Go Back
          </Button>
        </div>
      </div>
      <section>
        <div className="action-btns mb-5 flex justify-end">
          <FileUploadButton fileName={fileName} />
          <FileDeleteButton fileName={fileName} />
        </div>
        <div className="mx-auto">
          {loading ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "50vh",
              }}
            >
              <CircularProgress />
            </div>
          ) : (
            <DisplayBlob blob={resource} width="800px" />
          )}
        </div>
      </section>
    </>
  );
};

const FileDeleteButton = ({ fileName }) => {
  const API_URL = import.meta.env.VITE_TMS_PROD;
  const navigate = useNavigate();
  const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false);

  const handleDelete = async () => {
    try {
      const endpoint = `${API_URL}/S3/delete/${fileName}`; // Update endpoint URL for delete operation
      const response = await fetchWithAuth(endpoint, {
        method: "DELETE", // Use DELETE method for delete operation
      });

      // Check if the request was successful
      if (!response.ok) {
        throw new Error(`Unable to delete AWS resource with id: ${fileName}`);
      }

      // If successful, display success message
      toast.success("Resource Deleted");

      // Redirect to listing page
      navigate("/aws-s3");
    } catch (error) {
      // If an error occurs, display error message
      toast.error(error.message);
    }
  };

  return (
    <>
      <Button
        variant="contained"
        color="error"
        onClick={() => setOpenDeleteModal(true)}
      >
        <DeleteRoundedIcon sx={{ fontSize: "18px", mr: "5px" }} /> Delete
      </Button>

      {/* Delete Resource Modal */}
      <ConfirmationModal
        open={openDeleteModal}
        title="Delete AWS S3 Resource"
        content="Are you sure you want to delete this resource?"
        onClose={() => setOpenDeleteModal(false)}
        onConfirm={() => handleDelete()}
      />
    </>
  );
};

const FileUploadButton = ({ fileName }) => {
  const API_URL = import.meta.env.VITE_TMS_PROD;
  const [openUpdateModal, setOpenUpdateModal] = useState<boolean>(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];

    try {
      const endpoint = `${API_URL}/S3/update/${fileName}`;
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetchWithAuth(endpoint, {
        method: "PUT",
        body: formData,
      });

      // error
      if (!response.ok) {
        throw new Error(`Unable to update AWS resource with id: ${fileName}`);
      }

      // success
      toast.success("Resource Updated");

      // Redirect to listing page
      navigate("/aws-s3");
    } catch (error) {
      // error
      toast.error(error.message);
    }
  };

  return (
    <>
      <div>
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={() => setOpenUpdateModal(true)}
          sx={{ mr: "10px" }}
        >
          <AppRegistrationRoundedIcon sx={{ fontSize: "18px", mr: "5px" }} />
          Update
        </Button>
      </div>

      {/* Update Resource Modal */}
      <ConfirmationModal
        open={openUpdateModal}
        title="Update AWS S3 Resource"
        content="Are you sure you want to update this resource?"
        onClose={() => setOpenUpdateModal(false)}
        onConfirm={handleButtonClick}
      />
    </>
  );
};

export default AWSS3Detail;
