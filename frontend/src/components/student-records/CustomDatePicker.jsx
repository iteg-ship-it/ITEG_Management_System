import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// eslint-disable-next-line react/prop-types
const CustomDatePicker = ({ name, value, onChange }) => {
  return (
    <DatePicker
      selected={value ? new Date(value) : new Date()}
      onChange={(date) => {
        onChange({ name, value: date });
      }}
      maxDate={new Date()} // Prevents selecting future dates
      dateFormat="dd/MM/yyyy"
      className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
    />
  );
};

export default CustomDatePicker;