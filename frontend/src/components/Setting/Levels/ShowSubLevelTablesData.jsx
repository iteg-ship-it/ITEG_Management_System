import { useState } from "react";
import { useLocation } from "react-router-dom";
import Header from "../../common-components/sidebar/Header";
import OrangeButton from "../../common-components/sidebar/OrangeButton";
import TabsCommon from "../../common-components/table/TabsCommon";
import { useGetSubLevelsByLevelQuery } from "../../../redux/api/authApi";
import SearchBox from "../../common-components/seach-export/SearchBox";
import ExportDropdown from "../../common-components/seach-export/ExportDropdown";
import CommonTable from "../../common-components/table/CommonTable";

const columns = [
    { label: "S.No", key: "sno" },
    { label: "Full Name", key: "fullName" },
    { label: "Father Name", key: "fatherName" },
    { label: "Mobile No.", key: "mobile" },
    { label: "Course", key: "course" },
    { label: "Bus Route", key: "busRoute" },
    { label: "Attempts", key: "attempts" },
];

const dummyData = [
    { sno: 1, fullName: "Rahul Sharma", fatherName: "Ramesh Sharma", mobile: "9876543210", course: "B.Tech", busRoute: "Route 1", attempts: 2 },
    { sno: 2, fullName: "Priya Verma", fatherName: "Suresh Verma", mobile: "9812345678", course: "MCA", busRoute: "Route 3", attempts: 1 },
    { sno: 3, fullName: "Amit Patel", fatherName: "Dinesh Patel", mobile: "9898765432", course: "BCA", busRoute: "Route 2", attempts: 3 },
    { sno: 4, fullName: "Sneha Joshi", fatherName: "Mahesh Joshi", mobile: "9765432109", course: "B.Tech", busRoute: "Route 5", attempts: 1 },
    { sno: 5, fullName: "Vikram Singh", fatherName: "Rajendra Singh", mobile: "9654321098", course: "MBA", busRoute: "Route 4", attempts: 2 },
];

const ShowSubLevelTablesData = () => {
    const location = useLocation();
    const level = location.state?.level;
    const subdepartment = location.state?.subdepartment;
    const departmentId = location.state?.departmentId;
    const departmentName = location.state?.departmentName;
    const tabs = ["Students", "Tasks", "Syllabus", "Progress"];
    const [activeDataTab, setActiveDataTab] = useState("Students");

    const { data: subLevelsData } = useGetSubLevelsByLevelQuery(level?._id, {
        skip: !level?._id,
    });

    const subLevels = subLevelsData?.data || [];
    const levelTabs = subLevels.map((sl) => sl.name);

    const [activeTab, setActiveTab] = useState("");

    const handleTabClick = (tab) => setActiveTab(tab);

    const breadcrumbs = [
        { label: "Departments", path: "/department-management" },
        { label: departmentName || "Department", path: `/department-details/${departmentId}`, state: { department: subdepartment?.departmentId } },
        { label: subdepartment?.name || "Subdepartment", path: "/subdepartment-details", state: { subdepartment, departmentId, departmentName } },
        { label: level?.name || "Level" },
    ];

    return (
        <>
            <Header
                title={level?.name || "SubLevel Tables"}
                showBack={true}
                breadcrumbs={breadcrumbs}
            >
                <OrangeButton buttonTitle="+ Add Sub Level" />
            </Header>
            <TabsCommon tabs={levelTabs} activeTab={activeDataTab} onTabChange={handleTabClick} />
            <div className="flex flex-col  justify-start p-6">
                <div className="flex gap-2 w-[34%] bg-gray-200 p-2 rounded-xl shadow-inner">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveDataTab(tab)}
                            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeDataTab === tab
                                ? "bg-white text-orange-500 shadow"
                                : "text-gray-600 hover:bg-gray-300"
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
                <div className="bg-white my-5 border justify-between rounded-xl p-6 flex">
                    <div className="w-96">
                        <SearchBox />
                    </div>
                    <ExportDropdown />
                </div>

                <CommonTable
                    columns={columns}
                    data={dummyData}
                    editable={false}
                    pagination={true}
                    rowsPerPage={10}
                    searchTerm={""}
                    actionButton={null}
                    extraColumn={null}
                    onRowClick={null}
                />
            </div>




        </>
    );
};

export default ShowSubLevelTablesData;
