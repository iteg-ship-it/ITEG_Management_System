/* eslint-disable react/prop-types */
import { useState } from "react";
import { X } from "lucide-react";

const OrangeButton = ({
  buttonTitle,
  drawerContent,
  panelTitle,
  panelSubtitle = "Fill in the details to create a new division.",
  customButtonClass,
  leftBtnText = "Cancel",
  rightBtnText = "Save",
  onLeftClick,
  onRightClick,
}) => {
  const [isMounted, setIsMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const openDrawer = () => {
    setIsMounted(true);
    setTimeout(() => setIsOpen(true), 10);
  };

  const closeDrawer = () => {
    setIsOpen(false);
    setTimeout(() => setIsMounted(false), 300);
  };

  return (
    <>
      <button
        onClick={openDrawer}
        className={customButtonClass || "rounded-md bg-orange-500 px-3 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-orange-600 hover:shadow-md hover:scale-[1.03] active:scale-[0.97]"}
      >
        {buttonTitle}
      </button>

      {isMounted && (
        <div className="fixed inset-0 z-[60] flex justify-end">

          {/* BACKDROP with blur */}
          <div
            onClick={closeDrawer}
            className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
              isOpen ? "opacity-100" : "opacity-0"
            }`}
          />

          {/* PANEL */}
          <div
            className={`relative w-full sm:max-w-md h-full bg-white shadow-xl flex flex-col
            transform transition-transform duration-300 ease-in-out
            ${isOpen ? "translate-x-0" : "translate-x-full"}`}
          >
            {/* HEADER */}
            <div className="flex items-start justify-between px-6 py-5 border-b">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{panelTitle}</h2>
                {panelSubtitle && (
                  <p className="text-sm text-gray-500 mt-1">{panelSubtitle}</p>
                )}
              </div>
              <button onClick={closeDrawer} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            {/* CONTENT */}
            <div className="flex-1 overflow-y-auto p-6">
              {drawerContent}
            </div>

            {/* FOOTER */}
            <div className="px-6 py-5 border-t bg-white">
              <div className="flex gap-4">
                <button
                  onClick={onLeftClick ? onLeftClick : closeDrawer}
                  className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold transition-all duration-200 hover:bg-gray-200 hover:scale-[1.02] active:scale-[0.98] shadow-sm"
                >
                  {leftBtnText}
                </button>
                <button
                  onClick={onRightClick}
                  className="flex-1 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold shadow-md transition-all duration-200 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                >
                  {rightBtnText}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OrangeButton;
