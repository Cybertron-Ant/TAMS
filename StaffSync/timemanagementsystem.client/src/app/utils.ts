import { addDays, format, parseISO } from "date-fns";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import moment from "moment";
import { AnySchema } from "yup";

/**
 * Options for formatting date strings.
 */
type DateFormatOptions = {
  /**
   * Whether to include time information in the formatted date string. Defaults to false.
   */
  includeTime?: boolean;
  /**
   * The format string to use for formatting the date. Defaults to "MMM do, yyyy".
   */
  formatString?: string;
};

/**
 * Formats a date string into a specific format.
 * @param inputDateStr - The input date string to format.
 * @param options - Optional. An object containing formatting options.
 * @returns The formatted date string based on the provided options.
 */
const formatDate = (inputDateStr: string, options: DateFormatOptions = {}) => {
  const { includeTime = false, formatString = "MMM D, YYYY" } = options;
  const dateFormat = includeTime ? "MMM D, YYYY - hh:mm a" : formatString;
  return moment.tz(inputDateStr,"America/Panama").format(dateFormat);
};

const shortFormattedDate = (date: string) => {
  const dateObj = new Date(date);

  const formattedDate = dateObj.toLocaleDateString("en-US", {
    month: "short", // abbreviated month name
    day: "2-digit", // two-digit day
  });

  return formattedDate;
};
// this function is build for the search feature in the sibebar where it takes an array of objects and
// uses the first field in the array's object to filter
const filterObjects = (array, searchString) => {
  return array.filter((obj) => {
    const firstKey = Object.keys(obj)[0]; // Get the first key of the object
    if (firstKey && typeof obj[firstKey] === "string") {
      return obj[firstKey].toLowerCase().includes(searchString.toLowerCase());
    }
    return false;
  });
};

const filterRoutes = (searchString, routes) => {
  return routes.filter(
    (route) =>
      route.path.includes(searchString) ||
      route.title.includes(searchString) ||
      route.description.includes(searchString)
  );
};
/**
 * Calculates the duration in days between two date strings.
 * @param startDateString - The start date string in the format "yyyy-MM-dd'T'HH:mm:ss".
 * @param endDateString - The end date string in the format "yyyy-MM-dd'T'HH:mm:ss".
 * @returns The duration in days between the start and end dates.
 */
function calculateDurationInDays(startDateString, endDateString) {
  // Parse the input date strings into moment objects
  let startDate = moment(startDateString, "YYYY-MM-DD");
  let endDate = moment(endDateString, "YYYY-MM-DD");

  // Ensure that the end date is after the start date
  if (endDate.isBefore(startDate)) {
      return 0; // or handle as needed
  }

  // Initialize the duration counter
  let totalDays = 0;

  // Iterate over the dates
  while (startDate.isBefore(endDate)) {
      // If the day is not Sunday (0), count it
      if (startDate.day() !== 0) {
          totalDays++;
      }
      // Move to the next day
      startDate.add(1, 'day');
  }

  return totalDays;
}
/**
 * 
 * @param punchIn - Punch in time that will be used to calculate the elapse time for a timesheet.
 * @returns 
 */
const calculateElapsedTime = (punchIn: string, punchOut?:string): string => {
  if (!punchIn) return "--:--:--";

  // Convert to Philippines timezone
  const punchInDate = moment.tz(punchIn, "America/Panama");
  const punchOutDate = (punchOut) ? moment.tz(punchOut,"America/Panama") : moment.tz("America/Panama");;

  const elapsedTime = punchOutDate.diff(punchInDate, "seconds");

  const hours = Math.floor(elapsedTime / 3600);
  const minutes = Math.floor((elapsedTime % 3600) / 60);
  const seconds = elapsedTime % 60;

  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
};

/**
 * Formats a universal date string to HTML date using the Panama timezone unless the localTime flag is passed format (YYYY-MM-DD).
 * @param universalDate - The universal date string in UTC format (e.g., "2024-04-18T00:00:00.000Z").
 * @param localTime  - This is the ZoneID for the timezone you wish to convert this time to.
 * @returns The formatted date in HTML date format (YYYY-MM-DD).
 */
const formatDateToPanamaDateHTML = (universalDate: string, localTime=false) => {
    if(localTime){
      return moment.tz(universalDate).format("YYYY-MM-DD")
    }
    return moment.tz(universalDate, "America/Panama").format("YYYY-MM-DD");
  
};
/**
 * Formats a universal date string to HTML dateusing the Panama timezone unless the localTime flag is passed format (hh:mm A).
 * @param universalDate - The universal date string in UTC format (e.g., "2024-04-18T00:00:00.000Z").
 * @param localTime  - This is the ZoneID for the timezone you wish to convert this time to.
 * @returns The formatted date in HTML date format (hh:mm A).
 */
const formatTimeToPanamaTime = (universalDate: string, localTime=false) => {
    if(localTime){
      return moment.tz(universalDate).format("hh:mm A");
    }
    return moment.tz(universalDate, "America/Panama").format("hh:mm A");
  
};

/**
 * Formats a phone number into a specific format.
 * @param {string} phoneNumber - The phone number to format.
 * @returns {string} The formatted phone number.
 */
const formatPhoneNumber = (phoneNumber: string): string => {
  // Remove all non-numeric characters from the phone number
  const cleanedPhoneNumber = phoneNumber.replace(/\D/g, "");

  // Check if the cleaned phone number is empty or starts with a non-digit character
  if (!cleanedPhoneNumber || /\D/.test(cleanedPhoneNumber.charAt(0))) {
    return cleanedPhoneNumber; // Return as is if invalid format
  }

  // Format the phone number based on the desired format
  let formattedPhoneNumber = `(${cleanedPhoneNumber.slice(0, 3)}`;
  if (cleanedPhoneNumber.length > 3) {
    formattedPhoneNumber += `) ${cleanedPhoneNumber.slice(3, 6)}`;
  }
  if (cleanedPhoneNumber.length > 6) {
    formattedPhoneNumber += `-${cleanedPhoneNumber.slice(6)}`;
  }

  return formattedPhoneNumber;
};

/**
 * Trims the string values of an object.
 * @param data - The input object whose string values need to be trimmed.
 * @returns A new object with trimmed string values.
 */
const trimStringValues = (data: Record<string, any>): Record<string, any> => {
  const trimmedData: Record<string, any> = { ...data }; // Create a copy of the object

  // Loop through each property of the object
  Object.keys(trimmedData).forEach((key) => {
    // Check if the property value is a string
    if (typeof trimmedData[key] === "string") {
      // Trim the string value
      trimmedData[key] = trimmedData[key].trim();
    }
  });

  return trimmedData;
};

/**
 * Clean up all items in the Session Storage of the browser
 */
const cleanUpSessionStorage = (): void => {
  sessionStorage.clear();
};

/**
 * Converts a size in bytes to a human-readable format (KB, MB, GB, TB).
 * @param bytes - The size in bytes to convert.
 * @returns The size in a human-readable format with the appropriate unit (KB, MB, GB, TB).
 */
function formatBytes(bytes: number): string {
  const sizes: string[] = ["Bytes", "KB", "MB", "GB", "TB"];
  if (bytes === 0) return "0 Byte";
  const i: number = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${Math.round((bytes / Math.pow(1024, i)) * 100) / 100} ${sizes[i]}`;
}

const generateUsername = (firstName: string, lastName: string, format: number) => {
  const cleanFirstName = firstName.replace(/\s+/g, '.');
  const cleanLastName = lastName.replace(/\s+/g, '.');
  const firstInitial = cleanFirstName.charAt(0);
  const lastInitial = cleanLastName.charAt(0);

  switch (format) {
    case 0:
      return `${cleanFirstName}.${cleanLastName}`.toLowerCase();
    case 1:   
      return  `${firstInitial}.${cleanLastName}`.toLowerCase();
    case 2:
      return `${cleanFirstName}.${lastInitial}`.toLowerCase();
    default:
      return `${cleanFirstName}.${cleanLastName}`.toLowerCase();
  }
};

class ExportData {
  static toJson = (rows) => {
    const json = JSON.stringify(rows);
    const blob = new Blob([json], { type: "application/json" });
    saveAs(blob, "data.json");
  };

  static toCsv = async (rows) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("My Sheet");

    // Assuming 'rows' is an array of objects where each object has consistent keys
    // Define columns based on the keys of the first object (assuming all objects have the same structure)
    if (rows.length > 0) {
      worksheet.columns = Object.keys(rows[0]).map((key) => ({
        header: key,
        key: key,
        width: 20,
      }));
    }

    // Add rows directly without changing indexes or keys
    rows.forEach((row) => {
      worksheet.addRow(row);
    });

    // Write to buffer
    const buffer = await workbook.csv.writeBuffer();
    const blob = new Blob([buffer], { type: "text/csv;charset=utf-8;" });

    // Use file-saver to save the file on the client side
    saveAs(blob, "sheet.csv");
  };

  static toExcel = async (rows) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("My Sheet");

    // Create columns based on data keys
    worksheet.columns = rows.map((column) => ({
      header: column.name,
      key: column.name,
      width: 20,
    }));

    // Add a single row with values
    const rowValues = {};
    rows.forEach((item) => {
      rowValues[item.name] = item.value;
    });
    worksheet.addRow(rowValues);

    // Create a buffer and a blob for the workbook
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    // Trigger file download
    saveAs(blob, "ExportedData.xlsx");
  };
  static toPDF = (rows) => {
    const doc = new jsPDF("landscape");

    // Ensure there are rows and get headers from the keys of the first row object
    const headers =
      rows.length > 0
        ? [Object.keys(rows[0]).map((key) => ({ title: key, dataKey: key }))]
        : [];

    // Create the body data by mapping over rows and for each row, map over headers to get corresponding values
    const body = rows.map((row) => {
      return headers[0].map((header) => row[header.dataKey]);
    });

    autoTable(doc, {
      head: headers,
      body: body,
      theme: "striped",
    });

    doc.save("data.pdf");
  };
}

/**
 * Asynchronously validates the form data using a Yup validation schema.
 * @param formData - The form data to validate.
 * @param validationSchema - The Yup validation schema to use for validation.
 * @param setErrors - The function to update the errors state in the component.
 * @returns A promise that resolves to true if validation passes, or false if validation fails.
 */
const validateForm = async (
  formData: any,
  validationSchema: AnySchema,
  setErrors: (errors: Record<string, string>) => void
): Promise<boolean> => {
  try {
    // Attempt to validate the form data using the validation schema
    await validationSchema.validate(formData, { abortEarly: false });
    return true; // Validation passed
  } catch (validationErrors) {
    // Validation failed, format the errors and update the errors state
    const formattedErrors: Record<string, string> = {};
    validationErrors.inner.forEach((error) => {
      if (error.path) {
        formattedErrors[error.path] = error.message;
      }
    });
    setErrors(formattedErrors); // Update errors state with formatted errors
    return false; // Validation failed
  }
};

// function flattenObject(item) {
//   if (typeof item === 'object' && item !== null) {
//     return JSON.stringify(item.name, null, 2); // Converts objects to formatted string
//   }
//   return item;
// }

/**
 * Removes empty properties (undefined, null, empty string, or empty array values) from an object,
 * excluding properties specified in the ignoreList array.
 * @param obj - The object from which to remove empty properties.
 * @param ignoreList - An array of property names to ignore during removal.
 * @returns The cleaned object with empty properties removed.
 */
function removeEmptyProperties(
  obj: { [key: string]: any },
  ignoreList: string[] = []
): { [key: string]: any } {
  const cleanedObj = { ...obj }; // Create a copy of the object

  // Iterate through each key in the object
  for (const key in cleanedObj) {
    // Skip properties specified in the ignoreList
    if (ignoreList.includes(key)) {
      continue;
    }

    // Check if the value is undefined, null, empty string, or empty array
    if (
      cleanedObj[key] === undefined ||
      cleanedObj[key] === null ||
      cleanedObj[key] === "" ||
      (Array.isArray(cleanedObj[key]) && cleanedObj[key].length === 0)
    ) {
      // If the value is empty, delete the key from the object
      delete cleanedObj[key];
    } else if (typeof cleanedObj[key] === "object") {
      // If the value is an object, recursively call removeEmptyProperties
      cleanedObj[key] = removeEmptyProperties(cleanedObj[key], ignoreList);
      // Check if the object is now empty after removing empty properties
      if (
        Object.keys(cleanedObj[key]).length === 0 &&
        cleanedObj[key].constructor === Object
      ) {
        // If the object is empty, delete the key from the parent object
        delete cleanedObj[key];
      }
    }
  }
  // Return the cleaned object with empty properties removed
  return cleanedObj;
}


function toTitleCase(inputString: string) {
  return inputString
    .replace(/([A-Z])/g, " $1")  // Insert space before uppercase letters
    .trim()  // Remove leading and trailing whitespace
    .split(' ')  // Split the string into an array of words
    .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())  // Capitalize the first letter of each word
    .join(' ');  // Join the array back into a string with spaces
}

const parseResponse = async (response: Response) => {
  const contentType = response.headers.get("Content-Type");
  if (contentType && contentType.includes("application/json")) {
    return response.json();
  }
  const text = await response.text();
  return text.includes("success")
    ? { success: true, message: text }
    : { success: false, message: text };
};



export {
  ExportData,
  calculateDurationInDays,
  calculateElapsedTime,
  cleanUpSessionStorage,
  filterObjects,
  filterRoutes,
  formatBytes,
  formatDate,
  formatPhoneNumber,
  formatTimeToPanamaTime,
  formatDateToPanamaDateHTML,
  shortFormattedDate,
  trimStringValues,
  validateForm,
  removeEmptyProperties,
  generateUsername,
  toTitleCase,
  parseResponse
};
