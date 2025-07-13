// components/student/StudentLevelData.jsx
import { useParams } from "react-router-dom";
import { useGetLevelInterviewQuery } from "../../redux/api/authApi";
import Loader from "../common-components/loader/Loader";

const StudentLevelData = () => {
  const { id } = useParams(); // assuming route is /student/leveldata/:id
  const { data, isLoading, error } = useGetLevelInterviewQuery(id);

  {isLoading && (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <Loader />
    </div>
  )}

  if (error) {
    return (
      <p className="p-4 text-red-500">Error fetching data: {error.message}</p>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-2xl font-bold mb-4">Student Level Interview Data</h2>
      {data?.length > 0 ? (
        <div className="grid gap-4">
          {data.map((level, index) => (
            <div
              key={index}
              className="bg-white p-4 rounded-lg shadow-md border border-gray-200"
            >
              <p>
                <strong>Level:</strong> {level.levelNo}
              </p>
              <p>
                <strong>Status:</strong> {level.result}
              </p>
              <p>
                <strong>Remark:</strong> {level.remark || "N/A"}
              </p>
              <p>
                <strong>Date:</strong>{" "}
                {new Date(level.date).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p>No level interview data found.</p>
      )}
    </div>
  );
};

export default StudentLevelData;
