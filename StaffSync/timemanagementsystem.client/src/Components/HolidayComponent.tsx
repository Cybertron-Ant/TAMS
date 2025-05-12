import React, { useEffect, useState } from "react";
import { fetchWithAuth } from "../app/fetchWrapper";
import { shortFormattedDate } from "../app/utils";
import { Accordion, AccordionDetails, AccordionSummary } from "@mui/material";
import { ExpandCircleDown } from "@mui/icons-material";

const API_URL = import.meta.env.VITE_TMS_PROD;

const HolidayComponent = () => {
  const [holidays, setHolidays] = useState([]);

  useEffect(() => {
    fetchWithAuth(`${API_URL}/Holiday`)
      .then((response) => response.json())
      .then((data) => setHolidays(data))
      .catch((error) => console.error("Error fetching data: ", error));
  }, []);

  return (
    <Accordion sx={{borderRadius: "10px", backgroundColor: "white", alignItems: "center", padding: "1rem", marginTop: "1rem", overflow: "hidden"}}>
        {/* className="bg-white rounded-lg items-center p-4 mt-4" */}
          <AccordionSummary
              expandIcon={<ExpandCircleDown />}
              aria-controls="panel1-content"
              id="panel1-header"
          >
             <h1 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 ">
                      Upcoming Holidays
                  </h1>
          </AccordionSummary>
          <AccordionDetails>
          <div className="p-4 overflow-y-scroll h-80 w-full">
                  
                  {holidays.length > 0 ? (
                      <ul className="grid grid-cols-3">
                          {holidays.map((holiday, index) => (
                              <div className="flex" key={index}>
                                  <div className="flex justify-center items-center">
                                      <div className="bg-blue-200 text-sm font-bold text-center h-[50px] w-[50px] p-2 rounded-lg">
                                          {shortFormattedDate(holiday.endDate)}
                                      </div>
                                  </div>
                                  <a
                                      href={holiday.htmlLink}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="block max-w-sm p-3 bg-white text-gray-900 "

                                  >
                                      <li key={holiday.id}>
                                          <p className="mb-2 text-md font-bold tracking-tight text-gray-900 ">
                                              {holiday.summary}
                                          </p>
                                          <p className="font-normal text-sm text-gray-700 dark:text-gray-400">
                                              {holiday.description}
                                          </p>
                                      </li>
                                  </a>
                              </div>
                          ))}
                      </ul>
                  ) : (
                      <p>No holidays found.</p>
                  )}
              </div>
          </AccordionDetails>
      </Accordion>
  );
};

export default HolidayComponent;
