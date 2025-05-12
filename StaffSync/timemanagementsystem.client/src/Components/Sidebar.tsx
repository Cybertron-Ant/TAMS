import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AccountBoxIcon from "@mui/icons-material/AccountBox";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import AlarmIcon from "@mui/icons-material/Alarm";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import CloudIcon from "@mui/icons-material/Cloud";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import EqualizerOutlinedIcon from "@mui/icons-material/EqualizerOutlined";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import GavelOutlinedIcon from "@mui/icons-material/GavelOutlined";
import GroupIcon from "@mui/icons-material/Group";
import MenuIcon from "@mui/icons-material/Menu";
import MiscellaneousServicesIcon from "@mui/icons-material/MiscellaneousServices";
import MoveUpOutlinedIcon from "@mui/icons-material/MoveUpOutlined";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import PostAddOutlinedIcon from "@mui/icons-material/PostAddOutlined";
import PowerSettingsNewIcon from "@mui/icons-material/PowerSettingsNew";
import SecurityIcon from "@mui/icons-material/Security";
import WorkIcon from "@mui/icons-material/Work";

import { Search } from "@mui/icons-material";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Drawer,
  FormControl,
  InputAdornment,
  ListItemButton,
  SvgIconTypeMap,
  TextField,
  styled,
  useTheme,
} from "@mui/material";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { OverridableComponent } from "@mui/material/OverridableComponent";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import PermissionManager from "../app/PermissionManager ";
import { fetchWithAuth } from "../app/fetchWrapper";
import { cleanUpSessionStorage, filterObjects } from "../app/utils";
import { hasRoles } from "../app/roleManager";
import Roles from "../enums/Roles";

// Define the interface for the component props
interface SidebarProps {
  open: boolean;
  handleDrawerToggle: () => void;
}
interface SidebarItem {
  title: string;
  navigate: string;
  icon: OverridableComponent<SvgIconTypeMap<{}, "svg">> & { muiName: string };
  permission?: string; // Optional if not all items need it
}

const Sidebar: React.FC<SidebarProps> = ({ open, handleDrawerToggle }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [permissionNames, setPermissionNames] = useState([]);
  const employee = PermissionManager.EmployeeObj();
  const drawerWidth = 240;
  const closedDrawerWidth = theme.spacing(7);
  const API_URL = import.meta.env.VITE_TMS_PROD;

  const DrawerHeader = styled("div")(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: theme.spacing(0, 1),
    ...theme.mixins.toolbar,
  }));

  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [filteredSidebarItems, setFilteredSidebarItems] = useState([]);

  const openLogoutModal = () => {
    setIsLogoutModalOpen(true);
  };

  const handleClose = () => {
    setIsLogoutModalOpen(false);
  };

  const handleSearch = (value: string) => {
    setFilteredSidebarItems(filterObjects(sidebarItems, value));
  };

  const handleLogout = async () => {
    try {
      const response = await fetchWithAuth(`${API_URL}/Account/logout`, {
        method: "POST",
      });
      if (response.ok) {
        // Client side logout
        cleanUpSessionStorage();

        // Logout successful, navigate to login page
        toast.success("Logged out successfully");
        navigate("/login");
      } else {
        toast.error("Logout failed");
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const userPermissions = PermissionManager.PermissionManager();

  useEffect(() => {
    fetchEmployeePermissions(employee?.userId);
  }, [filteredSidebarItems]);

  useEffect(() => {
    if (open == false) {
      handleSearch("");
    }
  }, [open]);

  const fetchEmployeePermissions = async (userId) => {
    try {
      const permissionResponse = await fetchWithAuth(`${API_URL}/Permissions`);
      if (!permissionResponse.ok) {
        throw new Error("Failed to fetch permissions");
      }
      const permissionData = await permissionResponse.json();

      const employeePermissionsResponse = await fetchWithAuth(
        `${API_URL}/EmployeePermissions/${userId}`
      );
      if (!employeePermissionsResponse.ok) {
        throw new Error("Failed to fetch employee permissions");
      }
      const employeePermissionsData = await employeePermissionsResponse.json();

      const permissionFiltered = employeePermissionsData
        .map((permissionDataEntry) => {
          const permission = permissionData.find(
            (permission) =>
              permission.permissionId === permissionDataEntry.permissionId
          );
          return permission?.permissionName?.toLowerCase(); // Convert to lowercase
        })
        .filter((permissionName) => permissionName);
      // setPermissionNames(permissionFiltered);

      return permissionFiltered;
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error(error);
      // throw error; // Re-throw the error to handle it outside this function if needed
    }
  };

  // console.log(userPermissions)

  const employeeSidebarItems: SidebarItem[] = [
    {
      title: "Dashboard",
      navigate: "/dashboard",
      icon: DashboardOutlinedIcon,
      permission: "Employees",
    },
    {
      title: "Profile",
      navigate: `/employeeProfile/${employee?.employeeCode}`,
      icon: AccountBoxIcon,
      permission: "Employees",
    },
    {
      title: "Leave Forms",
      navigate: "/sickcallout",
      icon: FolderOpenIcon,
      permission: "LeaveTrackers",
    },
    {
      title: "Punch Timesheet",
      navigate: "/punchtimesheetform",
      icon: AlarmIcon,
      permission: "TimeSheet",
    },
    {
      title: "My TimeSheets",
      navigate: "/managetimesheet",
      icon: AccessTimeIcon,
      permission: "TimeSheet",
    },
    {
      title: "My Leaves",
      navigate: "/manageleave",
      icon: FolderOpenIcon,
      permission: "LeaveTrackers",
    },
    {
      title: "My Disciplinary Actions",
      navigate: "/managedisciplinary",
      icon: GavelOutlinedIcon,
      permission: "DisciplinaryTrackers",
    },
    {
      title: "My History",
      navigate: "/managemoves",
      icon: MoveUpOutlinedIcon,
      permission: "SuspendedPullOutFloating",
    },
  ];

  const adminSidebarItems: SidebarItem[] = [
    {
      title: "Dashboard",
      navigate: "/dashboard",
      icon: DashboardOutlinedIcon,
      permission: "Employees",
    },
    {
      title: "Register",
      navigate: "/register",
      icon: PersonAddIcon,
      permission: "Account",
    },
    {
      title: "Employees",
      navigate: "/manageemployee",
      icon: GroupIcon,
      permission: "Employees",
    },
    {
      title: "Profile",
      navigate: `/employeeProfile/${employee?.employeeCode}`,
      icon: AccountBoxIcon,
      permission: "Employees",
    },
    {
      title: "Leave Management",
      navigate: "/manageleave",
      icon: FolderOpenIcon,
      permission: "LeaveTrackers",
    },
    {
      title: "Manage Disciplinary",
      navigate: "/managedisciplinary",
      icon: GavelOutlinedIcon,
      permission: "DisciplinaryTrackers",
    },
    {
      title: "Manage Moved Employees",
      navigate: "/managemoves",
      icon: MoveUpOutlinedIcon,
      permission: "SuspendedPullOutFloating",
    },
    {
      title: "Punch Timesheet",
      navigate: "/punchtimesheetform",
      icon: AlarmIcon,
      permission: "TimeSheet",
    },
    {
      title: "TimeSheet",
      navigate: "/managetimesheet",
      icon: AccessTimeIcon,
      permission: "TimeSheet",
    },
    {
      title: "Manage Requests",
      navigate: "/managerequests",
      icon: PostAddOutlinedIcon,
      permission: "HRRequest",
    },
    // {
    //   title: "Work Resumption",
    //   navigate: "/WorkResumptionTracterList",
    //   icon: RestartAltIcon,
    //   permission: "WorkResumptionTrackers",
    // },
    {
      title: "Misc Management",
      navigate: "/miscmanagement",
      icon: MiscellaneousServicesIcon,
      permission: "Employees",
    },

    {
      title: "Recruitment",
      navigate: "/recruitment",
      icon: WorkIcon,
      permission: "RecruitmentTrackers",
    },
    // {
    //   title: "Job Offer Tracker",
    //   navigate: "/joboffertracker",
    //   icon: CasesOutlined,
    //   permission: "JobOfferTrackers",
    // },
    {
      title: "Permissions",
      navigate: "/Permissions",
      icon: SecurityIcon,
      permission: "Permissions",
    },

    {
      title: "AWS S3",
      navigate: "/aws-s3",
      icon: CloudIcon,
      permission: "S3",
    },
    {
      title: "Role Permissions",
      navigate: "/rolepermissions",
      icon: AdminPanelSettingsIcon,
      permission: "Permissions",
    },

    // Add more items as needed
  ];

  const itemployeeSidebarItems: SidebarItem[] = [
    {
      title: "Dashboard",
      navigate: "/dashboard",
      icon: DashboardOutlinedIcon,
      permission: "Employees",
    },
    {
      title: "Register",
      navigate: "/register",
      icon: PersonAddIcon,
      permission: "Account",
    },
    {
      title: "Employees",
      navigate: "/manageemployee",
      icon: GroupIcon,
      permission: "Employees",
    },
    {
      title: "Misc Management",
      navigate: "/miscmanagement",
      icon: MiscellaneousServicesIcon,
      permission: "Employees",
    },
    {
      title: "Profile",
      navigate: `/employeeProfile/${employee?.employeeCode}`,
      icon: AccountBoxIcon,
      permission: "Employees",
    },
    {
      title: "Leave Forms",
      navigate: "/sickcallout",
      icon: FolderOpenIcon,
      permission: "LeaveTrackers",
    },
    {
      title: "Requests Forms",
      navigate: "/hrrequests",
      icon: PostAddOutlinedIcon,
      permission: "HRRequest",
    },
    {
      title: "Punch Timesheet",
      navigate: "/punchtimesheetform",
      icon: AlarmIcon,
      permission: "TimeSheet",
    },
    {
      title: "My TimeSheets",
      navigate: "/managetimesheet",
      icon: AccessTimeIcon,
      permission: "TimeSheet",
    },
    {
      title: "My Requests",
      navigate: "/managerequests",
      icon: PostAddOutlinedIcon,
      permission: "HRRequest",
    },
    {
      title: "My Leaves",
      navigate: "/manageleave",
      icon: FolderOpenIcon,
      permission: "LeaveTrackers",
    },
    {
      title: "My Disciplinary Actions",
      navigate: "/managedisciplinary",
      icon: GavelOutlinedIcon,
      permission: "DisciplinaryTrackers",
    },
    {
      title: "My History",
      navigate: "/managemoves",
      icon: MoveUpOutlinedIcon,
      permission: "SuspendedPullOutFloating",
    },
    {
      title: "AWS S3",
      navigate: "/aws-s3",
      icon: CloudIcon,
      permission: "S3",
    },
    {
      title: "Permissions",
      navigate: "/Permissions",
      icon: SecurityIcon,
      permission: "Permissions",
    },
  ];

  // const sidebarItems =
  //   employee.role === "Employee" ? employeeSidebarItems : adminSidebarItems;
  const sidebarItems = !hasRoles([
    Roles.SuperAdmin,
    Roles.HRMSAdmin,
    Roles.HRManagerAdmin,
    Roles.SrOperationsManager,
  ])
    ? employeeSidebarItems
    : hasRoles([Roles.ItManagerAdmin])
    ? itemployeeSidebarItems
    : adminSidebarItems;
  // const sidebarItems = adminSidebarItems;

  return (
    <>
      <Drawer
        variant="permanent"
        className="app-sidebar"
        sx={{
          width: open ? drawerWidth : closedDrawerWidth,
          "& .MuiDrawer-paper": {
            width: open ? drawerWidth : closedDrawerWidth,
            backgroundColor:
              employee &&
              hasRoles([
                Roles.SuperAdmin,
                Roles.HRMSAdmin,
                Roles.SrOperationsManager,
              ])

                ? "#e76818"
                : employee &&
                  hasRoles([
                    Roles.Employee,
                    Roles.Manager,
                    Roles.SrManager,
                    Roles.Supervisor,
                    Roles.SrSupervisor,
                    Roles.OPSTeamLeader,
                    Roles.OPSSrTeamLeader,
                  ])

                ? "#249ca7"
                : employee &&
                  hasRoles([Roles.HRManagerAdmin, Roles.ItManagerAdmin])
                ? "#249ca7"
                : "#249ca7",
            // Your desired blue background color
            color: "#fff", // Adjust text color as needed
            transition: theme.transitions.create("width", {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          },
        }}
      >
        <DrawerHeader>
          <div className="image-wrapper">
          <img
            src={"/assets/logo.svg"}
            alt="Logo"
            style={{ maxWidth: "100%", height: "auto" }}
          />
          </div>
          <IconButton onClick={handleDrawerToggle}>
            {open ? <ChevronLeftIcon /> : <MenuIcon />}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List>
          {/* SearchBar */}
          {open ? (
            <FormControl className="flex">
              <TextField
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
                onChange={(e) => handleSearch(e.target.value)}
                className="bg-white bg-opacity-50 h-1/2"
              />
            </FormControl>
          ) : (
            <ListItemButton onClick={handleDrawerToggle}>
              <Search />
            </ListItemButton>
          )}
          {/* Navigation items */}
          {filteredSidebarItems.map(
            (item, index) =>
              userPermissions.includes(item.permission) && (
                <ListItemButton
                  key={index}
                  onClick={() => navigate(`${item.navigate}`)}
                  sx={{
                    backgroundColor:
                      location.pathname === `${item.navigate}`
                        ? "#5bc0de"
                        : "inherit", // Light blue for active
                    "&:hover": {
                      backgroundColor: "#5bc0de", // Lighter blue on hover
                    },
                    ...(location.pathname === `${item.navigate}` && {
                      borderLeft: "4px solid #FFCD29", // Vertical line as accent for active
                    }),
                  }}
                >
                  <ListItemIcon>
                    <item.icon
                      sx={{
                        color:
                          location.pathname === `${item.navigate}`
                            ? "white"
                            : "inherit",
                      }}
                    />
                  </ListItemIcon>
                  <ListItemText primary={item.title} />
                </ListItemButton>
              )
          )}

          <ListItemButton
            onClick={openLogoutModal}
            sx={{
              "&:hover": {
                backgroundColor: "#5bc0de", // Lighter blue on hover
              },
            }}
          >
            <ListItemIcon>
              <PowerSettingsNewIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </List>
      </Drawer>

      {/* Login Confirmation Dialog */}
      <Dialog open={isLogoutModalOpen} onClose={handleClose}>
        <DialogTitle>Logout Confirmation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to logout?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            sx={{ textTransform: "capitalize" }}
            variant="outlined"
            onClick={handleClose}
            color="primary"
          >
            Cancel
          </Button>
          <Button
            sx={{ textTransform: "capitalize" }}
            variant="contained"
            onClick={handleLogout}
            color="error"
          >
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Sidebar;
