import React from "react";

interface MDXContentProps {
  content?: React.ReactElement;
}

const MDXContent: React.FC<MDXContentProps> = ({ content }) => {
  if (content) {
    // Render content (both MD and MDX are processed through the same pipeline)
    return <>{content}</>;
  }

  // Fallback for when no content is provided
  return <div>No content available</div>;
};

export { MDXContent };
