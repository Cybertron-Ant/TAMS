import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import { fetchWithAuth } from "../../../app/fetchWrapper";
import TransferDepartment from "../../../Components/TransferDepartment";
import { toast } from "react-toastify";
import ResourceForm, { FieldDefinition } from "./ResourceForm";
import PermissionManager from "../../../app/PermissionManager ";
import { Employee } from "../../../interfaces/Employee";
import { set } from "date-fns";


const ResourceManagement = ({
  resourceName,
  fetchUrl,
  createUrl,
  updateUrl,
  deleteUrlTemplate,
  onClose,
}) => {
  const employee = PermissionManager.EmployeeObj();
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    employee
  );
  const [resources, setResources] = useState([]);
  const [selectedResource, setSelectedResource] = useState<any>({});
  const [selectedResourceOptions, setSelectedResourceOptions] = useState<{[x:string]:string}>({})
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedFields, setSelectedFields] = useState<FieldDefinition[]>([]);
  const [innitialFieldValues, setInnitialFieldValues] = useState({});
  const [formTitle, setFormTitle] = useState('');
  const [formMode, setFormMode] = useState<"CREATE" | "EDIT">('CREATE');

  useEffect(() => {
    fetchResources();
  }, [fetchUrl]);


  /**
   * Holds a object with the resource name and the fields associated with it.
   */
  const resourceFormFields = {
    "Attendance": [
      { name: 'type', label: 'Type', type: 'text', placeholder: 'Type', maxLength: 50},
    ],
    "BreakType": [
      { name: 'name', label: 'Break Name', type: 'text', placeholder: 'Name', maxLength: 50},
      { name: 'password', label: 'Password', type: 'password', placeholder: 'Password', maxLength: 50 },
      { name: 'creatorNotes', label: 'Notes', type: 'text', placeholder: 'Notes', maxLength: 200, multiline: true },
      { name: 'creatorId', label: 'Creator', type: 'text', placeholder: 'Creator', maxLength: 200, multiline: true, hidden: true },
    ],
    "LeaveBalanceDefaults": [
      { name: 'balance', label: 'Balance', type: 'number', placeholder: 'Balance', maxLength: 50},
      { name: 'increment', label: 'Increment', type: 'number', placeholder: 'Increment', maxLength: 50 },
      { name: 'incrementInterval', label: 'Increment Interval', type: 'number', placeholder: 'Increment Interval', maxLength: 200, multiline: true },
      { name: 'attendanceId', label: 'Attendance', type: 'text', placeholder: 'Attendance', maxLength: 200, multiline: false, hidden: false, select: true, options: selectedResourceOptions},
    ],

    "Default":[
      { name: 'name', label: 'Name', type: 'text', placeholder: 'Name', maxLength: 50},
    ]
  }


  /**
   * Fetch resource based on the url for the resource that was passed in from the Misc management Page.
   * Then use react to save the data returned in the  `resources` state.
   */
  const fetchResources = async () => {
    try {
      const response = await fetchWithAuth(fetchUrl);
      const data = await response.json();

      ///There is a possibility where the api will return a object  with options for example leaveBalanceDefaults
      if(resourceName == "LeaveBalanceDefaults"){
        setResources(data.leaveBalanceDefaults)
        setSelectedResourceOptions(data.attendances);
      }else{

        setResources(data);
      }
    } catch (error) {
      toast.error('Unable to fetch resource')
      console.error(`Failed to fetch ${resourceName}s:`, error);
    }
  };

  const handleDelete = async () => {
    try {
      // Dynamically find the ID property name by looking for a property that ends with "Id"
      const idPropertyName = Object.keys(selectedResource).includes('id') ? "id" : Object.keys(selectedResource).find((key) => key.endsWith("Id"));

      const resourceId = selectedResource[idPropertyName];
      if (!resourceId) {
        console.error("Resource ID is undefined. Unable to delete resource.");
        return;
      }

      // Replace ":id" in the URL template with the actual resource ID
      const deleteUrl = deleteUrlTemplate.replace(":id", resourceId);
      const response = await fetchWithAuth(deleteUrl, { method: "DELETE" });

      if(!response.ok){
        throw new Error(response.statusText);
      }
      fetchResources(); // Refresh the list after deletion
      toast.success(`Successfully deleted ${resourceName}`);
      setIsDeleteModalOpen(false)
    } catch (error) {
      console.error(`Failed to delete ${resourceName}:`, error);
      toast.error(`Failed to delete ${resourceName}`);

    }
  };

  const handleCreate = async (formData) => {

    try {
      const response = await fetchWithAuth(createUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if(!response.ok){
        throw new Error(response.statusText);
      }
      handleClose()
      fetchResources();
      toast.success(`Successfully created ${resourceName}`);
    } catch (error) {
      console.error(`Failed to create ${resourceName}:`, error);
      toast.error(`Unable to create ${resourceName}`);
    }
  };


  const handleUpdate = async (formData:{[x:string]: any}) => {

    const idPropertyName = Object.keys(formData).includes('id') ? "id" : Object.keys(formData).find((key) => key.endsWith("Id"));
      const resourceId = formData[idPropertyName];
      if (!resourceId) {
        console.error("Resource ID is undefined. Unable to delete resource.");
        return;
      }

    try {
      const url = updateUrl.replace(":id", resourceId);
      const response = await fetchWithAuth(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      // Made sure that if the response is not successfull then throw an error 
      if(!response.ok){
        throw new Error(response.statusText);
      }
      handleClose()
      fetchResources();
      toast.success(`Successfully Updated ${resourceName}`);
    } catch (error) {
      console.error(`Failed to update ${resourceName}:`, error);
      toast.error(`Unable to update ${error}`);

    }
  };

  const handleClose = () => {
    if (onClose) onClose();
  };



  const handleOpenModal = (resource: string) => {
    setFormTitle(`Create ${resourceName}`);
    setFormMode("CREATE");
    setSelectedFields(resourceFormFields[resourceName] ?? resourceFormFields["Default"]);
    setInnitialFieldValues(getInitialValuesForResource(resourceName));
    setIsModalOpen(true);
  };

  const handleUpdateOpenModal = (resource:any, resourceName) =>{
    setFormTitle(`Update ${resourceName}`);
    setFormMode("EDIT");
    setInnitialFieldValues(resource),
    setSelectedFields(resourceFormFields[resourceName] ?? resourceFormFields["Default"])
    setIsModalOpen(true);
  }

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };
  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
  };



  const getInitialValuesForResource = (resource: string): { [key: string]: any } => {
    if (resource === 'BreakType') {
      return {
        name: '',
        creatorId: selectedEmployee.userId,
        password: '',
        creatorNotes: '',
      };
    }else{
      return {
        name: '',
      }
    }
    // Add other resource initial values here
  };

  const popUpDeleteConfirmation = (resource: any) =>{
    setSelectedResource(resource);
    setIsDeleteModalOpen(true);
  }



  return (
    <>
      <div className="bg-white p-6 rounded-lg shadow relative">
        <IconButton
          color="default"
          onClick={handleClose}
          style={{ position: "absolute", right: 8, top: 8 }} // Adjust positioning here
        >
          <CloseIcon />
        </IconButton>
        <h2 className="text-3xl font-bold text-neutral-800 mb-4">
          {resourceName} Management
        </h2>

        <div className="space-y-4">
          <button
            onClick={ () => handleOpenModal(resourceName)}
            className="mb-4 flex items-center justify-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium text-xs leading-tight uppercase rounded shadow-md hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg transition duration-150 ease-in-out"
          >
            <svg
              className="mr-2 -ml-1 w-5 h-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v12m6-6H6"
              />
            </svg>
            Add {resourceName}
          </button>

          {resources.map((resource) => (
            <div
              key={resource.id || resource.departmentId}
              className="flex justify-between items-center bg-gray-50 p-4 rounded-lg border border-gray-200"
            >
              <span className="font-medium text-gray-700">
                {resource.name || resource.type || resource.remarkText || resource.attendance}
              </span>
              <div className="flex gap-2">
                <IconButton
                  color="primary"
                  onClick={() => 
                    handleUpdateOpenModal(resource, resourceName)
                  }
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  color="secondary"
                  onClick={() => popUpDeleteConfirmation(resource)}
                >
                  <DeleteIcon />
                </IconButton>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Dialog open={isDeleteModalOpen} onClose={handleCloseDeleteModal}>
        <DialogTitle className="text-3xl font-bold text-gray-800 mb-6"> Delete {resourceName}</DialogTitle>
        <DialogContent>Are you sure you want to delete <strong>{selectedResource?.name ?? selectedResource?.type}</strong> from {resourceName}?</DialogContent>
        <DialogActions>
          <Button onClick={()=>setIsDeleteModalOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete}>Delete</Button>
        </DialogActions>
      </Dialog>    
      <Dialog open={isModalOpen} onClose={handleCloseModal}>
        {resourceName && (
          <ResourceForm
            formTitle={formTitle}
            formMode={formMode}
            fields={selectedFields}
            initialValues={innitialFieldValues}
            handleCreate={handleCreate}
            handleUpdate={handleUpdate}
            handleCancel={handleCloseModal}
          />
        )}
      </Dialog>
    </>
  );
};

export default ResourceManagement;
