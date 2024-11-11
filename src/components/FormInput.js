import { INPUT_STYLES } from '../constants/colors';

const FormInput = ({ label, error, ...props }) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="form-label">
          {label}
        </label>
      )}
      <input
        className={`${INPUT_STYLES.base} ${
          error ? 'border-red-500 focus:ring-red-500' : ''
        }`}
        {...props}
      />
      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
    </div>
  );
}; 