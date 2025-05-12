import React, { ChangeEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { fetchWithAuth } from "../app/fetchWrapper";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

import * as Yup from "yup";
import {
  Department,
  Employee,
  EmployeeStatus,
  EmploymentType,
  Gender,
  MaritalStatus,
  PositionCode,
  Role,
  Team,
} from "../interfaces/Employee";
import {
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import {
  formatDateToPanamaDateHTML,
  formatPhoneNumber,
  generateUsername,
} from "../app/utils";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import PermissionManager from "../app/PermissionManager ";
import AccountHelper from "../app/accountHelper";
import moment from "moment";

interface FormData extends Employee {
  password: string;
  confirmPassword: string;
  userName: string;
}

enum UsernameFormat {
  flastname = 0,
  firstLast = 1,
  fLast = 2,
}

const schema = Yup.object().shape({
  firstName: Yup.string().required().min(3).max(50),
  lastName: Yup.string().required().min(3).max(50),
  userName: Yup.string().required().min(3).max(50),
  middleName: Yup.string().notRequired(),
  email: Yup.string().email().required().max(255),
  departmentId: Yup.string().required(
    "Please select a correct employee status"
  ),
  employeeStatusId: Yup.string().required(
    "Please select a correct employee status"
  ),
  employmentTypeId: Yup.string().required(
    "Please select a correct employee type"
  ),
  genderId: Yup.string().required("Please select a gender from the list"),
  maritalStatusId: Yup.string().required(
    "Please select a correct correct status"
  ),
  positionCodeId: Yup.string().required(
    "Please select a correct position code"
  ),
  teamId: Yup.string().required("Please select a correct team"),
  nameSuffix: Yup.string().notRequired(),
  mobileNo: Yup.string().required(),
  selectedRole: Yup.string().required("Please Select A Role"),
  // immediateSuperior: Yup.string().notRequired().min(3).max(255),
  // immediateSuperiorCode: Yup.string().notRequired(),
  addressForeign: Yup.string().notRequired(),
  birthDate: Yup.date().required().typeError("Invalid date format"),
  dateHired: Yup.date().required().typeError("Invalid date format"),
});

function Register(props: {
  onClose: () => void;
  editMode?: boolean;
  record?: Employee;
  forModal?: boolean;
  employees?: Employee[];
}) {
  const [formData, setFormData] = useState<Partial<FormData>>({
    employeeCode: "",
    firstName: "",
    userName: "",
    lastName: "",
    email: "",
    departmentId: null,
    password: "",
    confirmPassword: "",
    active: true,
    role: "",
    employeeStatusId: null,
    employmentTypeId: null,
    genderId: null,
    maritalStatusId: null,
    modeOfSeparationId: null,
    positionCodeId: null,
    teamId: null,
    middleName: "",
    nameSuffix: "",
    mobileNo: "",
    immediateSuperior: "",
    immediateSuperiorCode: "",
    addressForeign: "",
    birthDate: "",
    dateHired: "",
    dateSeparated: "" || null,
    emailAddress: "",
    dateCleared: "" || null,
  });

  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState(""); // State to store selected role

  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | "">(
    ""
  );
  const [employeeStatuses, setEmployeeStatuses] = useState<EmployeeStatus[]>(
    []
  );
  const [selectedEmployeeStatus, setSelectedEmployeeStatus] = useState("");
  const [selectedEmployeeStatusId, setSelectedEmployeeStatusId] = useState<
    number | ""
  >("");

  const [selectedSuperior, setSelectedSuperior] = useState<Employee>();
  const [superiors, setSuperiors] = useState<Employee[]>([]);

  const [employmentTypes, setEmploymentTypes] = useState<EmploymentType[]>([]);
  const [selectedEmploymentType, setSelectedEmploymentType] = useState("");
  const [selectedEmploymentTypeId, setSelectedEmploymentTypeId] = useState<
    number | ""
  >("");

  const [genders, setGenders] = useState<Gender[]>([]);
  const [selectedGender, setSelectedGender] = useState("");
  const [selectedGenderId, setSelectedGenderId] = useState<number | "">("");

  const [maritalStatuses, setMaritalStatuses] = useState<MaritalStatus[]>([]);
  const [selectedMaritalStatus, setSelectedMaritalStatus] = useState("");
  const [selectedMaritalStatusId, setSelectedMaritalStatusId] = useState<
    number | ""
  >("");

  const [positionCodes, setPositionCodes] = useState<PositionCode[]>([]);
  const [selectedPositionCode, setSelectedPositionCode] = useState("");
  const [selectedPositionCodeId, setSelectedPositionCodeId] = useState<
    number
  >(null);

  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState("");
  const [selectedTeamId, setSelectedTeamId] = useState<number | "">("");
  const [format, setFormat] = useState(0);
  const [generatedName, setGeneratedName] = useState("");

  const API_URL = import.meta.env.VITE_TMS_PROD;

  const storedEmployee = PermissionManager.EmployeeObj();
  const isAdminUser = storedEmployee.role?.toLowerCase().includes("admin");
  

  useEffect(() => {
    /**
     * Fetches roles used in the application
     */
    const fetchRoles = async () => {
      const response = await fetchWithAuth(`${API_URL}/Account/roles`);
      const data = await response.json();
      setRoles(data);
    };

    /**
     * Fetches the employee list that will be used as the list to select immediate supervisor.
     */
    const fetchSuperiors = async () => {
      const response = await fetchWithAuth(`${API_URL}/Employees`);
      const data = await response.json();
      setSuperiors(data);

      // Putting this condition here because state is not set for superiors as yet.
      if (props.editMode && props.record) {
        var superior = (data as Employee[]).find(
          (superior) =>
            superior.employeeCode === props.record.immediateSuperiorCode
        );
        setSelectedSuperior(superior);
      }
    };
    // Calls the defined methods to fetch.
    fetchSuperiors();
    fetchRoles();
  }, []);

  const handleFormatChange = (event: any) => {
    const target = event.target.value as unknown as UsernameFormat;
    setFormat(target);

    // Regenerate the username with the new format
    const { firstName, lastName } = formData;
    if (firstName && lastName) {
      const userName = generateUsername(
        firstName,
        lastName,
        target
      ).toLowerCase();
      setFormData((prev) => ({ ...prev, userName }));
    }
  };

  const updateUsernameAndFormData = (name: string, value: string | boolean) => {
    // Prepare new values for first or last name
    const newValues = {
      ...formData,
      [name]: value,
    };

    // Automatically update username if both firstName and lastName are provided
    const { firstName, lastName } = newValues;
    if (firstName && lastName) {
      newValues.userName = generateUsername(
        firstName,
        lastName,
        format
      ).toLowerCase();
    }

    setFormData(newValues);
  };

  if (props.editMode && props.record) {
    useEffect(() => {
      const fetchEmployeeDetails = async () => {
        try {
          const response = await fetchWithAuth(
            `${API_URL}/Employees/${props.record.employeeCode}`
          );
          if (!response.ok)
            throw new Error("Failed to fetch employee details.");
          const data: Employee = await response.json(); // Ensure the response matches the Employee type
          setFormData({
            ...data,  
            userName: `${props.record.userName}`
          } as FormData);
          var superior = superiors.find(
            (superior) =>
              superior.employeeCode === props.record.immediateSuperiorCode
          );
          setSelectedSuperior(superior);
          setSelectedEmployeeStatus(data.status.name);
          setSelectedEmployeeStatusId(data.employeeStatusId);
          setSelectedDepartment(data.department.name);
          setSelectedDepartmentId(data.departmentId);
          setSelectedEmploymentType(data.employmentType.name);
          setSelectedEmploymentTypeId(data.employmentTypeId);
          setSelectedGender(data.gender.name);
          setSelectedGenderId(data.genderId);
          setSelectedMaritalStatus(data.maritalStatus.name);
          setSelectedMaritalStatusId(data.maritalStatusId);
          setSelectedPositionCode(data.positionCode.name);
          setSelectedPositionCodeId(data.positionCodeId);
          setSelectedRole(props.record.role);
          setSelectedTeam(data.team.name);
          setSelectedTeamId(data.teamId);
        } catch (error) {
          toast.error(error);
        }
      };

      if (props.record) {
        fetchEmployeeDetails();
      }
    }, []);
  }

  useEffect(() => {
    const fetchDepartments = async () => {
      const response = await fetchWithAuth(`${API_URL}/Departments`);
      const data: Department[] = await response.json();
      setDepartments(data);
    };

    fetchDepartments();
  }, []);

  useEffect(() => {
    const fetchEmployeeStatuses = async () => {
      const response = await fetchWithAuth(`${API_URL}/EmployeeStatus`);
      const data: EmployeeStatus[] = await response.json();
      setEmployeeStatuses(data);
    };

    fetchEmployeeStatuses();
  }, []);

  useEffect(() => {
    const fetchEmploymentTypes = async () => {
      const response = await fetchWithAuth(`${API_URL}/EmploymentType`);
      const data: EmploymentType[] = await response.json();
      setEmploymentTypes(data);
    };

    fetchEmploymentTypes();
  }, []);

  useEffect(() => {
    const fetchGenders = async () => {
      const response = await fetchWithAuth(`${API_URL}/Genders`);
      const data: Gender[] = await response.json();
      setGenders(data);
    };

    fetchGenders();
  }, []);

  useEffect(() => {
    const fetchMaritalStatuses = async () => {
      const response = await fetchWithAuth(`${API_URL}/MaritalStatus`);
      const data: MaritalStatus[] = await response.json();
      setMaritalStatuses(data);
    };

    fetchMaritalStatuses();
  }, []);

  useEffect(() => {
    const fetchPositionCodes = async () => {
      const response = await fetchWithAuth(`${API_URL}/PositionCodes`);
      const data: PositionCode[] = await response.json();
      setPositionCodes(data);
    };

    fetchPositionCodes();
  }, []);

  useEffect(() => {
    const fetchTeams = async () => {
      const response = await fetchWithAuth(`${API_URL}/Team`);
      const data: Team[] = await response.json();
      setTeams(data);
    };

    fetchTeams();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const target = e.target as HTMLInputElement; // Cast to HTMLInputElement to access 'checked' and other input-specific properties
    const isRequired = target.required;
    if (isRequired && target.value.trim() === "") {
      setError(`${target.name} is required`);
    }
    // Correctly determine value based on input type
    let value: string | boolean =
      target.type === "checkbox" ? target.checked : target.value;
    const { name } = target;

    // Auto-generate username if first or last name is changed
    if (name === "firstName" || name === "lastName") {
      updateUsernameAndFormData(name, value);
    } else if (
      target.type !== "checkbox" &&
      name.match(
        /\b(?:mobileNumber|mobileNo|phoneNumber|contactNumber|cellPhone|phone|cellphoneNumber|mobilePhone|mobileContact|contactPhone|userMobile)\b/
      )
    ) {
      // Format phone numbers, ensuring value is a string
      value = formatPhoneNumber(value as string);
      setFormData((prev) => ({ ...prev, [name]: value }));
    } else {
      // Update other fields normally
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleValueChange = (fieldName: string, value: string) => {
    setFormData({ ...formData, [fieldName]: value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(""); // Clear any existing errors

    // If email is empty, construct a default one using firstName and lastName
    const email =
      formData.email?.trim() === ""
        ? `${formData.firstName}.${formData.lastName}@shepherdoutsourcing.com`.toLowerCase()
        : formData.email;
    // Update the formData object with the constructed or existing email
    const updatedFormData = {
      ...formData,
      email: email, // Update email address here
    };

    // Create a new payload that includes everything from formData plus the selectedRole
    const payload = {
      ...updatedFormData,
      selectedRole: selectedRole,
      departmentId: selectedDepartmentId,
      employeeStatusId: selectedEmployeeStatusId,
      employmentTypeId: selectedEmploymentTypeId,
      genderId: selectedGenderId,
      maritalStatusId: selectedMaritalStatusId,
      positionCodeId: selectedPositionCodeId,
      teamId: selectedTeamId,
      employeeCode: props.editMode ? props.record.employeeCode : undefined,
      //Setting immediate superior
      immediateSuperiorCode: selectedSuperior?.employeeCode,
      immediateSuperior: selectedSuperior
        ? selectedSuperior?.firstName + " " + selectedSuperior?.lastName
        : "",
      password: `${formData.userName}@TMS1`,
    };
    try {
      let valResult = await schema.validate(payload, { abortEarly: false });
    } catch (e) {
      const newErrors = {};
      e.inner.forEach((error) => {
        newErrors[error.path] = error.message;
      });

      setErrors(newErrors);
      toast.error("Form submitted with errors");
      return;
    }

    if (props.editMode) {
      const url = `${API_URL}/Employees/${
        props.record.employeeCode
      }?selectedRole=${encodeURIComponent(selectedRole)}`;
      try {
        const response = await fetchWithAuth(
          url,

          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload), // Use the new payload with selectedRole
          }
        );
        if (response.status == 204) {
          toast.success("Employee updated Successfully");

          // Update the locally stored account information
          await AccountHelper.refreshAccountInformation();

          if (props.onClose) {
            props.onClose();
          }
        } else {
          const result = await response.json();
          setError(
            result.message || "Employee update failed: " + response.status
          );
        }
      } catch (error) {
        console.error("Fetch error: ", error);
        setError(
          "An error occurred during employee update. Please try again later."
        );
      }
    } else {
      try {
        const response = await fetchWithAuth(
          `${API_URL}/Account/register-manual`,

          // `${API_URL}/Account/register`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload), // Use the new payload with selectedRole
          }
        );

        const result = await response?.json();

        if (response.ok) {
          toast.success(result.message);
          if (props.forModal) {
            props.onClose && props.onClose();
          } else {
            navigate("/manageemployee"); // Adjust as needed for your routing
          }
        } else {
          const errorData = result;
          if (errorData && errorData.errors) {
            var isModelValidated = false;
            var message = "";
            let counter = 0;
            for (let [key, value] of Object.entries(errorData["errors"])) {
              if (counter == 0 && key == "model") {
                // This check is because it is from the model validator defined to set the type of the data. This happends before it enters the controller method.
                // This is asuming that the modelWill have an array as a value;
                // Here the assumption is that the value is either a string or a array of strings.
                if (typeof value == "string") {
                  message += value;
                } else {
                  message += (value as string[]).join(", "); // Model should be an array I am joining element to make a message;
                }
                isModelValidated = true;
              }
              if (counter > 0 && isModelValidated) {
                var field = key.split(".")[1]; // This will get the model field from the error object key;
                message += " " + field;
                break;
              }
              counter++;
            }

            toast.error(`Error: ${message}`);
          } else {
            var message = "Registration failed. Please check your inputs.";
            // This assumption here is that the error messages were set with modelstate.AddError(). This means we only get Key value pairs.
            var errorResult: { [x: string]: string[] } = result;
            if (errorResult != null || errorResult != undefined) {
              // Change this to use a for loop so I can break out the loop when I get the first error field.
              for (let [key, value] of Object.entries(errorResult)) {
                // In this case I want to get the error message and only show one field error at a time.
                // This is to prevent the toastr from getting too large and clustered.
                message = value.join(", ");
                break;
              }
            }
            // error message from asp.net model state;

            toast.error(message);
          }
        }
      } catch (error) {
        toast.error("An error occurred during registration: ", error);
      }
    }
  };

  return (
    <div
      className={
        props.editMode || props.forModal
          ? "w-full mx-auto px-4 py-10 bg-white rounded-lg"
          : "w-full mx-auto px-4 py-10 bg-white shadow-xl rounded-lg"
      }
    >
      {!(props.editMode || props.forModal) && (
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Register</h2>
      )}
      <form onSubmit={handleSubmit} noValidate>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <TextField
              label="First Name"
              variant="outlined"
              required
              error={errors && "firstName" in errors ? true : false}
              fullWidth
              name="firstName"
              placeholder="First Name"
              value={formData.firstName ?? ""}
              onChange={handleChange}
              helperText={errors["firstName"] ? errors["firstName"] : ""}
              inputProps={{ maxLength: 50 }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Middle Name"
              variant="outlined"
              fullWidth
              name="middleName"
              placeholder="Middle Name"
              value={formData.middleName ?? ""}
              onChange={handleChange}
              inputProps={{ maxLength: 50 }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Last Name"
              variant="outlined"
              required
              fullWidth
              error={errors && "lastName" in errors ? true : false}
              name="lastName"
              placeholder="Last Name"
              value={formData.lastName ?? ""}
              onChange={handleChange}
              helperText={errors["lastName"] ? errors["lastName"] : ""}
              inputProps={{ maxLength: 50 }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Email"
              variant="outlined"
              fullWidth
              error={errors && "email" in errors ? true : false}
              name="email"
              placeholder="Email"
              value={formData.email ?? ""}
              onChange={handleChange}
              helperText={errors["email"] ? errors["email"] : ""}
              inputProps={{ maxLength: 80 }}
            />
          </Grid>

          {isAdminUser && (
            <Grid item xs={6}>
              <TextField
                label="Username"
                variant="outlined"
                fullWidth
                name="userName"
                placeholder="Username"
                value={formData.userName || ""}
                inputProps={{ maxLength: 50, readOnly: true }}
                disabled // Disable this field to prevent manual editing
              />
              <FormControl fullWidth margin="normal">
                <InputLabel id="format-label">Select Format</InputLabel>
                <Select
                  labelId="format-label"
                  value={format}
                  label="Select Format"
                  onChange={handleFormatChange}
                >
                  <MenuItem value={0}>first.last</MenuItem>
                  <MenuItem value={1}>f.last</MenuItem>
                  <MenuItem value={2}>first.l</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          )}

          {!props.editMode && (
            <Grid item xs={6}>
              <TextField
                label="Password"
                variant="outlined"
                fullWidth
                name="password"
                placeholder="Password"
                value={`${formData.userName}@TMS1`}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => {
                          navigator.clipboard.writeText(
                            `${formData.userName}@TMS1`
                          );
                        }}
                        edge="end"
                      >
                        <ContentCopyIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                disabled // Disable this field to prevent manual editing
              />
            </Grid>
          )}

          {/* Employee Role */}
          {isAdminUser && (
            <Grid item xs={6}>
              <FormControl
                fullWidth
                error={errors && "selectedRole" in errors ? true : false}
              >
                <InputLabel>Role</InputLabel>
                <Select
                  label="Role"
                  variant="outlined"
                  required
                  name="selectedRole"
                  placeholder="Select Role"
                  value={selectedRole ?? ""}
                  onChange={(e) => setSelectedRole(e.target.value)}
                >
                  {roles.map((role, index) => (
                    <MenuItem key={index} value={role.name}>
                      {role.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors["selectedRole"] && (
                  <FormHelperText>{errors["selectedRole"]}</FormHelperText>
                )}
              </FormControl>
            </Grid>
          )}

          <Grid item xs={6}>
            <TextField
              label="Mobile Number"
              variant="outlined"
              error={errors && "mobileNo" in errors ? true : false}
              required
              fullWidth
              type={"tel"}
              name="mobileNo"
              placeholder="Mobile Number"
              value={formData.mobileNo ?? ""}
              helperText={errors["mobileNo"] ? errors["mobileNo"] : ""}
              onChange={handleChange}
              inputProps={{ maxLength: 30 }}
            />
          </Grid>

          {isAdminUser && (
            <Grid item xs={6}>
              <FormControl
                fullWidth
                error={errors["departmentId"] ? true : false}
              >
                <InputLabel>Department</InputLabel>
                <Select
                  label="Department"
                  variant="outlined"
                  required
                  name="department"
                  placeholder="User Name"
                  value={selectedDepartment ?? ""}
                  defaultValue=""
                  onChange={(e) => {
                    const name = e.target.value;
                    setSelectedDepartment(name);
                    const dept = departments.find((d) => d.name === name);
                    setSelectedDepartmentId(dept ? dept.departmentId : "");
                  }}
                  inputProps={{ maxLength: 50 }}
                >
                  {departments.map((department, index) => (
                    <MenuItem key={index} value={department.name}>
                      {department.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors["departmentId"] && (
                  <FormHelperText>{errors["departmentId"]}</FormHelperText>
                )}
              </FormControl>
            </Grid>
          )}

          <Grid item xs={6}>
            <FormControl
              fullWidth
              error={errors && "birthDate" in errors ? true : false}
            >
              <TextField
                label="Date of Birth"
                type={"date"}
                variant="outlined"
                required
                InputLabelProps={{ shrink: true }}
                name="birthDate"
                onChange={handleChange}
                value={
                  props.editMode && formData.birthDate
                    ? formatDateToPanamaDateHTML(formData.birthDate)
                    : formData.birthDate ?? ""
                }
              />
              {errors["birthDate"] && (
                <FormHelperText>{errors["birthDate"]}</FormHelperText>
              )}
            </FormControl>
          </Grid>

          {isAdminUser && (
            <Grid item xs={6}>
              <FormControl
                fullWidth
                error={errors && "positionCodeId" in errors ? true : false}
              >
                <InputLabel>Position Code</InputLabel>
                <Select
                  variant="outlined"
                  required
                  name="positionCodeId"
                  placeholder="Position Code"
                  value={selectedPositionCode ?? ""}
                  defaultValue=""
                  onChange={(e) => {
                    const index = positionCodes.findIndex(
                      (pc) => pc.name === e.target.value
                    );
                    setSelectedPositionCode(e.target.value);
                    setSelectedPositionCodeId(
                      positionCodes[index].positionCodeId
                    );
                  }}
                  inputProps={{ maxLength: 50 }}
                >
                  {positionCodes.map((positionCode) => (
                    <MenuItem
                      key={positionCode.positionCodeId}
                      value={positionCode.name}
                    >
                      {positionCode.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors["positionCodeId"] && (
                  <FormHelperText>{errors["positionCodeId"]}</FormHelperText>
                )}
              </FormControl>
            </Grid>
          )}

          <Grid item xs={6}>
            <FormControl
              fullWidth
              error={errors && "genderId" in errors ? true : false}
            >
              <InputLabel>Gender</InputLabel>
              <Select
                variant="outlined"
                required
                name="selectedGender"
                placeholder="Gender"
                value={selectedGender ?? ""}
                defaultValue=""
                onChange={(e) => {
                  const name = e.target.value;
                  setSelectedGender(name);
                  const gender = genders.find((g) => g.name === name);
                  setSelectedGenderId(gender ? gender.genderId : "");
                }}
              >
                {genders.map((gender) => (
                  <MenuItem key={gender.genderId} value={gender.name}>
                    {gender.name}
                  </MenuItem>
                ))}
              </Select>
              {errors["genderId"] && (
                <FormHelperText>{errors["genderId"]}</FormHelperText>
              )}
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <FormControl
              fullWidth
              error={errors && "maritalStatusId" in errors ? true : false}
            >
              <InputLabel>Marital Status</InputLabel>
              <Select
                name="selectedMaritalStatus"
                variant="outlined"
                placeholder="Marital Status"
                value={selectedMaritalStatus ?? ""}
                defaultValue=""
                onChange={(e) => {
                  const name = e.target.value;
                  setSelectedMaritalStatus(name);
                  const status = maritalStatuses.find((ms) => ms.name === name);
                  setSelectedMaritalStatusId(
                    status ? status.maritalStatusId : ""
                  );
                }}
              >
                {maritalStatuses.map((status) => (
                  <MenuItem key={status.maritalStatusId} value={status.name}>
                    {status.name}
                  </MenuItem>
                ))}
              </Select>
              {errors["maritalStatusId"] && (
                <FormHelperText>{errors["maritalStatusId"]}</FormHelperText>
              )}
            </FormControl>
          </Grid>

          {isAdminUser && (
            <Grid item xs={6}>
              <FormControl
                fullWidth
                error={errors && "employeeStatusId" in errors ? true : false}
              >
                <InputLabel>Employee Status</InputLabel>
                <Select
                  name="selectedEmployeeStatus"
                  label="Employee Status"
                  variant="outlined"
                  required
                  placeholder="Employee Status"
                  value={selectedEmployeeStatus ?? ""}
                  onChange={(e) => {
                    const name = e.target.value;
                    setSelectedEmployeeStatus(name);
                    const status = employeeStatuses.find(
                      (es) => es.name === name
                    );
                    setSelectedEmployeeStatusId(
                      status ? status.employeeStatusId : ""
                    );
                  }}
                >
                  {employeeStatuses.map((status) => (
                    <MenuItem key={status.employeeStatusId} value={status.name}>
                      {status.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors["employeeStatusId"] && (
                  <FormHelperText>{errors["employeeStatusId"]}</FormHelperText>
                )}
              </FormControl>
            </Grid>
          )}

          {isAdminUser && (
            <Grid item xs={6}>
              <FormControl
                fullWidth
                error={errors && "teamId" in errors ? true : false}
              >
                <InputLabel>Select Team</InputLabel>
                <Select
                  name="selectedTeam"
                  value={selectedTeam ?? ""}
                  placeholder="Select Team"
                  label="Team"
                  defaultValue=""
                  onChange={(e) => {
                    const name = e.target.value;
                    setSelectedTeam(name);
                    const team = teams.find((t) => t.name === name);
                    console.log(team);
                    setSelectedTeamId(team ? team.teamId : "");
                  }}
                >
                  {teams.map((team) => (
                    <MenuItem key={team.teamId} value={team.name}>
                      {team.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors["teamId"] && (
                  <FormHelperText>{errors["teamId"]}</FormHelperText>
                )}
              </FormControl>
            </Grid>
          )}

          {isAdminUser && (
            <Grid item xs={6}>
              <FormControl
                fullWidth
                error={errors && "employmentTypeId" in errors ? true : false}
              >
                <InputLabel>Employment Type</InputLabel>
                <Select
                  name="selectedEmploymentType"
                  value={selectedEmploymentType ?? ""}
                  placeholder="Employment Type"
                  onChange={(e) => {
                    const name = e.target.value;
                    setSelectedEmploymentType(name);
                    const type = employmentTypes.find((et) => et.name === name);
                    setSelectedEmploymentTypeId(
                      type ? type.employmentTypeId : ""
                    );
                  }}
                >
                  {employmentTypes.map((type) => (
                    <MenuItem key={type.employmentTypeId} value={type.name}>
                      {type.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors["employmentTypeId"] && (
                  <FormHelperText>{errors["employmentTypeId"]}</FormHelperText>
                )}
              </FormControl>
            </Grid>
          )}

          <Grid item xs={6}>
            <TextField
              name="addressForeign"
              id="addressForeign"
              label="Address Foreign"
              variant="outlined"
              required
              fullWidth
              value={formData.addressForeign ?? ""}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth>
              <TextField
                name="dateHired"
                variant="outlined"
                label="Date Hired"
                error={errors && "dateHired" in errors ? true : false}
                type="date"
                id="dateHired"
                InputLabelProps={{ shrink: true }}
                placeholder="Date Hired"
                onChange={handleChange}
                value={
                  props.editMode && formData.dateHired
                    ? moment(formData.dateHired).format("YYYY-MM-DD")
                    : formData.dateHired ?? ""
                }
              />
              {errors["dateHired"] && (
                <FormHelperText>{errors["dateHired"]}</FormHelperText>
              )}
            </FormControl>
          </Grid>

          {isAdminUser && (
            <Grid item xs={6}>
              <FormControl
                fullWidth
                error={errors && "immediateSuperior" in errors ? true : false}
              >
                <InputLabel>Immediate Superior</InputLabel>
                <Select
                  name="immediateSuperior"
                  value={selectedSuperior?.employeeCode ?? ""}
                  onChange={(e) => {
                    const code = e.target.value;
                    const superior = superiors.find(
                      (s) => s.employeeCode === code
                    );
                    setSelectedSuperior(superior);
                  }}
                >
                  {superiors.map((employee) => (
                    <MenuItem
                      key={employee.employeeCode}
                      value={employee.employeeCode}
                    >
                      {employee.firstName + " " + employee.lastName}
                    </MenuItem>
                  ))}
                </Select>
                {errors["immediateSuperior"] && (
                  <FormHelperText>{errors["immediateSuperior"]}</FormHelperText>
                )}
              </FormControl>
            </Grid>
          )}
          
          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel>Name Suffix</InputLabel>
              <Select
                name="nameSuffix"
                id="nameSuffix"
                value={formData.nameSuffix ?? ""}
                label="Name Suffix"
                placeholder="Name Suffix"
                variant="outlined"
                onChange={(e) => {
                  const target = e.target as HTMLInputElement; // Cast to HTMLInputElement to access 'checked'
                  let value =
                    target.type === "checkbox" ? target.checked : target.value;
                  const name = target.name;
                  setFormData({ ...formData, [name]: value });
                }}
                // Make sure your handleChange can handle select elements
              >
                <MenuItem key="" value="">
                  None
                </MenuItem>
                <MenuItem value="Jr.">Jr.</MenuItem>
                <MenuItem value="Sr.">Sr.</MenuItem>
                <MenuItem value="III">III</MenuItem>
                <MenuItem value="IV">IV</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid
            display="flex"
            justifyContent="flex-end"
            xs={12}
            item
            container
            spacing={1}
          >
            <Grid item>
              <Button
                variant="outlined"
                color="primary"
                onClick={props.onClose}
              >
                Cancel
              </Button>
            </Grid>
            <Grid item>
              <Button type="submit" variant="contained" color="primary">
                {!props.editMode ? "Submit" : "Update"}
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </form>
    </div>
  );
}

export default Register;
