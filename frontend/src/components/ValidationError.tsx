import type { ValidationError } from "../../@types/form";

const ValidationError = ({
  validationError,
  field,
}: {
  validationError: ValidationError[];
  field: string;
}) => {
  const fieldValidationError = validationError.filter(
    (error: ValidationError) => error.field === field
  );

  return (
    <ul>
      {fieldValidationError.map((error: ValidationError) => {
        return (
          <li key={error.field} className="text-invalid">
            {error.msg}
          </li>
        );
      })}
    </ul>
  );
};

export default ValidationError;
