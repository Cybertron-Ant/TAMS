import { Card, CardContent, Typography } from "@mui/material";
import React from "react";

/**
 * DataCard component displays general data with a title and content.
 *
 * @param {string} title - The title of the data.
 * @param {string | number} content - The content of the data.
 * @returns {React.ReactNode} The JSX element representing the DataCard component.
 */
const DataCard: React.FC<{ title: string; content: string | number }> = ({
  title,
  content,
}) => {
  return (
    <Card variant="outlined">
      <CardContent>
        <Typography sx={{ fontSize: 16 }} color="text.secondary" gutterBottom>
          {title}
        </Typography>
        <Typography variant="h5" component="div">
          {content}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default DataCard;
