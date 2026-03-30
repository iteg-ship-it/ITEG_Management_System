/* eslint-disable react/prop-types */
import { useRef, useState } from "react";

const ImageUploadField = ({ label, preview: externalPreview, onChange, className = "" }) => {
  const inputRef = useRef(null);
  const [internalPreview, setInternalPreview] = useState(externalPreview || null);

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setInternalPreview(URL.createObjectURL(file));
    onChange?.(e);
  };

  const preview = externalPreview !== undefined ? externalPreview : internalPreview;

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}
      <div
        onClick={() => inputRef.current.click()}
        className="w-full h-11 px-3 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-700 focus:outline-none focus:border-orange-400 focus:bg-white transition cursor-pointer flex items-center gap-3"
      >
        {preview ? (
          <img src={preview} alt="preview" className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
        ) : (
          <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 text-gray-400 text-xs">
            IMG
          </div>
        )}
        <span className="text-gray-400 truncate">
          {preview ? "Change image" : "Click to upload image"}
        </span>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />
    </div>
  );
};

export default ImageUploadField;
