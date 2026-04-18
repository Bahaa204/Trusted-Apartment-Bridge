import { useEffect } from "react";
import { titleCase } from "title-case";

/**
 * Sets the document title and restores the original title when the component unmounts.
 * @param title The title to set for the document. The original title will be preserved and restored when the component unmounts.
 * Sets the title to the format of:  title | original title
 */
export function useDocumentTitle(title: string) {
  useEffect(() => {
    const original_title = document.title;

    document.title = ` ${titleCase(title)} | ${original_title}`;

    return () => {
      document.title = original_title;
    };
  }, [title]);
}
