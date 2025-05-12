import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ChatIcon from "@mui/icons-material/Chat";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsIcon from "@mui/icons-material/Notifications";
import {
  AppBar,
  Autocomplete,
  Avatar,
  Badge,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  Icon,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  Select,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import { Theme } from "@mui/material/styles";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "../app/hooks";
import { RootState } from "../app/store";
import { toast } from "react-toastify";
import {
  cleanUpSessionStorage,
  filterObjects,
  filterRoutes,
} from "../app/utils";
import { fetchWithAuth } from "../app/fetchWrapper";
import Search from "@mui/icons-material/Search";
import { RoutesConfig } from "../app/RoutesConfig";
import PermissionManager from "../app/PermissionManager ";
import { Employee } from "../interfaces/Employee";

interface HeaderProps {
  handleDrawerToggle: () => void; // Prop for handling the drawer toggle
  open: boolean; // Indicates if the sidebar is open
}

const Header: React.FC<HeaderProps> = ({ handleDrawerToggle, open }) => {
  const employee: Employee = PermissionManager.EmployeeObj();

  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const isMenuOpen = Boolean(anchorEl);
  const [filteredData, setFilteredData] = useState([]);
  const employeeObj = PermissionManager.EmployeeObj();
  const routes = RoutesConfig(employeeObj);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    navigate(`/employeeProfile/${employee?.employeeCode}`);
  };
  const handleMenuSettings = () => {
    setAnchorEl(null);
    navigate(`/settings`);
  };

  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const API_URL = import.meta.env.VITE_TMS_PROD;

  const [notiMenu, setNotiMenu] = useState(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setNotiMenu(event.currentTarget);
  };
  const handleNotiClose = () => {
    setNotiMenu(null);
  };

  const handleNotiMenuItem = () => {
    setNotiMenu(null);
  };

  const openLogoutModal = () => {
    setIsLogoutModalOpen(true);
    setAnchorEl(null);
  };

  const handleClose = () => {
    setIsLogoutModalOpen(false);
  };

  const handleSearch = (value: string) => {
    setFilteredData(filterRoutes(value, routes));
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

  // Utility function to get initials from the employee's name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const menuId = "primary-search-account-menu";
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      id={menuId}
      keepMounted
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      open={isMenuOpen}
      onClose={handleMenuClose}
    >
      <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
      {(employee?.role?.toLowerCase().includes("super admin") ||
        /executive|director/i.test(
          employee?.positionCode?.name?.toLowerCase()
        )) && <MenuItem onClick={handleMenuSettings}>Settings</MenuItem>}
      <MenuItem onClick={openLogoutModal}>Logout</MenuItem>
    </Menu>
  );

  // Dynamically adjust the margin based on the sidebar's state
  const appBarStyle = {
    transition: (theme: Theme) =>
      theme.transitions.create(["margin", "width"], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
    ...(open && {
      width: `calc(100% - 240px)`, // Adjust width based on the sidebar's width
      marginLeft: "240px",
      transition: (theme: Theme) =>
        theme.transitions.create(["margin", "width"], {
          easing: theme.transitions.easing.easeOut,
          duration: theme.transitions.duration.enteringScreen,
        }),
    }),
  };

  return (
    <div className="fixed inset-x-0 top-0 z-30 bg-white shadow ">
      <AppBar
        position="static"
        sx={{ ...appBarStyle, backgroundColor: "#ffffff", color: "black" }}
      >
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="open drawer"
            sx={{ mr: 2 }}
            onClick={handleDrawerToggle}
          >
            <MenuIcon />
          </IconButton>
          {/* <FormControl>
          <TextField InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search/>
                  </InputAdornment>
                ),
              }}
              onChange={(e) => handleSearch(e.target.value)} 
              />
          </FormControl>
          <Select>
            {filteredData.map((item, index) => 
            <MenuItem key={index}>
              <Link to={item.path}>
              <div>
              {item.title}
              <p className=" text-gray-400">{item.description}</p>
              </div>
              </Link>
            </MenuItem>
            )}
          </Select> */}
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {/* This space is intentionally left blank to push everything to the right */}
          </Typography>
          <Autocomplete
            sx={{ width: 300, flexGrow: 1, padding: "4px" }}
            id="search-autocomplete"
            freeSolo
            options={routes}
            getOptionLabel={(option) =>
              typeof option !== "string" && "title" in option
                ? option.title
                : option
            } // Assuming 'title' can represent the option
            renderOption={(props, option) => {
              // Ensure permissions is always an array
              const permissions = Array.isArray(option.permissions)
                ? option.permissions
                : [option.permissions];
              // Check if any of the permissions in permissions array is included in employeeObj.permissions (also ensure it's an array)
              const employeePermissions = Array.isArray(
                employeeObj.employeePermissions
              )
                ? employeeObj.employeePermissions
                : [employeeObj.employeePermissions];
              const isPermissionAllowed = permissions.some((permission) =>
                employeePermissions.includes(permission)
              );

              return isPermissionAllowed ? (
                <Link to={option.path} style={{ textDecoration: "none" }}>
                  <Box
                    component="li"
                    sx={{ "& > img": { mr: 2, flexShrink: 0 } }}
                    {...props}
                  >
                    <div>
                      {option.title}
                      <p className="text-gray-400">{option.description}</p>
                    </div>
                  </Box>
                </Link>
              ) : null;
            }}
            renderInput={(params) => (
              <TextField {...params} label="Search..." />
            )}
          />

          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {/* This space is intentionally left blank to push everything to the right */}
            {/* <IconButton
              sx={{
                width: 50,
                height: 50,
                borderRadius: "50%", // Makes the box circular
                backgroundColor: '#f0f0f0', // Light grey background color
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Badge badgeContent={4} color="secondary">
              <NotificationsIcon />
              </Badge>
            </IconButton> */}

            {/* TODO Notification System */}
            {/* <Button onClick={handleClick} >
            <Badge badgeContent={4} color="secondary" sx={{
                width: 20,
                height: 20,}}>
              <NotificationsIcon  />
              </Badge>
            </Button>
            <Menu
              anchorEl={notiMenu}
              open={Boolean(notiMenu)}
              onClose={handleNotiClose}
            >
              <Box
                sx={{
                  width: 180,
                  height: 150,
                }}
              >
                <Typography sx={{ fontWeight: "bold", padding: "0.5rem"}}>Notifications</Typography>
                <MenuItem onClick={handleNotiMenuItem}>Message 1  Unread</MenuItem>
        <MenuItem onClick={handleNotiMenuItem}>Message 2  Read</MenuItem>
        <MenuItem onClick={handleNotiMenuItem}>Message 3  Read</MenuItem>
              </Box>
            </Menu> */}
          </Typography>

          <Avatar sx={{ width: 40, height: 40 }}>
            {employee
              ? getInitials(`${employee.firstName} ${employee.lastName}`)
              : "A"}
          </Avatar>
          <Box sx={{ display: "flex", alignItems: "center", ml: 1 }}>
            {/* Display the person's name next to the profile icon with lighter font */}
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{ fontWeight: "light", display: { xs: "none", sm: "block" } }}
            >
              {employee?.firstName} {employee?.lastName}
            </Typography>
            <IconButton
              size="small"
              edge="end"
              onClick={handleProfileMenuOpen}
              color="inherit"
            >
              <ArrowDropDownIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {renderMenu}

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
    </div>
  );
};

export default Header;
