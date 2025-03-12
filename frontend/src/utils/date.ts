import { format } from "date-fns";

const formatDateString = (dateString: string) => {
  const date = new Date(dateString);

  return format(date, "MMMM d y");
};

export { formatDateString };
