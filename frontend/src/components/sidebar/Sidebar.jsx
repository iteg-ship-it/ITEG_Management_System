




const Sidebar = () => {
  return (
   <>
      
      <div className="w-64 h-screen bg-white shadow-lg flex flex-col">
      <div className="flex items-center p-4">
        <img
          src="D:\ITEG_Management_System\frontend\src\assets\images\logo.png"
          alt="Logo"
          className="w-12 h-12 rounded-full"
        />
        <span className="ml-2 text-xl font-bold">SANT SINGAJI EDUCATIONAL SOCIETY</span>
      </div>
      <div className="flex-grow mt-4">
        <ul className="space-y-2">
          <li>
            <button className="flex items-center w-full px-4 py-2 text-left hover:bg-gray-100">
              <span className="material-icons text-lg mr-4">description</span>
              Admission Process
            </button>
          </li>
          <li>
            <button className="flex items-center w-full px-4 py-2 text-left hover:bg-gray-100">
              <span className="material-icons text-lg mr-4">school</span>
              Student Record
            </button>
          </li>
          <li>
            <button className="flex items-center w-full px-4 py-2 text-left hover:bg-gray-100">
              <span className="material-icons text-lg mr-4">info</span>
              Placement Information
            </button>
          </li>
        </ul>
      </div>
    </div>
   </>
  )
}

export default Sidebar
