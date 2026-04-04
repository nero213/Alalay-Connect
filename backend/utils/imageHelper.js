export const formatImagePath = (imagePath) => {
  if (!imagePath) return null;

  // Replace backslashes with forward slashes
  let formattedPath = imagePath.replace(/\\/g, "/");

  // If it already starts with /uploads/, return as is
  if (formattedPath.startsWith("/uploads/")) {
    return formattedPath;
  }

  // If it's just a filename (no slashes)
  if (!formattedPath.includes("/")) {
    return `/uploads/${formattedPath}`;
  }

  // Extract just the filename and add /uploads/
  const filename = formattedPath.split("/").pop();
  return `/uploads/${filename}`;
};
