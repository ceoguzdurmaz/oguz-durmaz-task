export const generateSlug = (title: string) => {
  return title.replace(/\s+/g, "-").toLowerCase();
};

export const cleanAndLowercaseString = (inputString: string) => {
  let cleanedString = inputString.replace(/\s+/g, "");
  cleanedString = cleanedString.toLowerCase();
  return cleanedString;
};

export const convertSlugToTitle = (slug: string) => {
  let title = slug.replace(/-/g, " ");
  title = title.replace(/\w\S*/g, (word) => {
    return word.replace(/^\w/, (firstChar) => firstChar.toUpperCase());
  });
  return title;
};
