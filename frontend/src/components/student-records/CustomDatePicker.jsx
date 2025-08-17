import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// eslint-disable-next-line react/prop-types
const CustomDatePicker = ({ name, value, onChange, allowFuture = false }) => {
  return (
    <DatePicker
      selected={value ? new Date(value) : null}
      onChange={(date) => {
        onChange({ name, value: date });
      }}
      maxDate={allowFuture ? null : new Date()}
      dateFormat="dd/MM/yyyy"
      className="h-12 w-full border border-gray-300 px-3 rounded-md focus:outline-none focus:border-[#FDA92D]"
      placeholderText="Select date"
    />
  );
};

export default CustomDatePicker;