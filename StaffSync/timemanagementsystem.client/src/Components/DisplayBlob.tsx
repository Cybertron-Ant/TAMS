import { Box, Typography } from "@mui/material";

const DisplayBlob = ({ blob, width = "100%", height = "auto" }) => {
  if (!blob) return null;

  const blobUrl = URL.createObjectURL(blob);

  // Extract the Blob size and type
  const size = blob.size;
  const type = blob.type || "application/octet-stream"; // Default type if not available

  // Determine the type of Blob and render accordingly
  if (type.startsWith("image/")) {
    return (
      <img
        src={blobUrl}
        alt="Image"
        style={{ width, height, marginInline: "auto" }}
      />
    );
  } else if (type === "application/pdf") {
    return (
      <embed
        src={blobUrl}
        type="application/pdf"
        width={"100%"}
        height={"500px"}
        style={{ marginInline: "auto" }}
      />
    );
  } else {
    return (
      <Box textAlign="center" my={2}>
        <Typography variant="body1" color="error">
          We currently do not support displaying this type of content.
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Size: {size} bytes
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Type: {type}
        </Typography>
      </Box>
    );
  }
};

export default DisplayBlob;
