<<<<<<< HEAD
=======
import { useState, useEffect } from "react";
import { MdAccountTree, MdLayers, MdAdd, MdEdit, MdDelete, MdBusiness, MdExpandMore, MdExpandLess } from "react-icons/md";
import PageNavbar from "../../common-components/navbar/PageNavbar";
import Header from "../../common-components/sidebar/Header";
>>>>>>> e6ed6725dca0feb3e819c6f44212330195120b3f
import { useLocation, useNavigate } from "react-router-dom";
import { useGetSubdepartmentByIdQuery, useGetLevelsBySubdepartmentQuery, useGetSubLevelsByLevelQuery, useAddLevelMutation, useUpdateLevelMutation } from "../../../redux/api/authApi";
import { toast } from "react-toastify";
import Header from "../../common-components/sidebar/Header";
import CommonCard from "../CommonCard";
import OrangeButton from "../../common-components/sidebar/OrangeButton";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import InputField from "../../common-components/common-feild/InputField";
import RadioGroup from "../../common-components/common-feild/RadioGroup";
<<<<<<< HEAD
import { MdLayers } from "react-icons/md";
import Loader from "../../common-components/loader/Loader";

const SubLevelCount = ({ levelId, render }) => {
  const { data } = useGetSubLevelsByLevelQuery(levelId, { skip: !levelId });
  return render(data?.data?.length || 0);
};

const validationSchema = Yup.object({
  name: Yup.string().required("Level name is required"),
  order: Yup.number().required("Order is required").positive("Must be positive"),
  isActive: Yup.boolean(),
});
=======
>>>>>>> e6ed6725dca0feb3e819c6f44212330195120b3f

const SubdepartmentDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const subdepartmentId = location.state?.subdepartment?._id;

  const { data: subdepartmentData } = useGetSubdepartmentByIdQuery(subdepartmentId, { skip: !subdepartmentId });
  const { data: levelsData, isLoading, refetch } = useGetLevelsBySubdepartmentQuery(subdepartmentId, { skip: !subdepartmentId });
  const [addLevel] = useAddLevelMutation();
  const [updateLevel] = useUpdateLevelMutation();

  const subdepartment = subdepartmentData?.data || location.state?.subdepartment;
  const departmentId = location.state?.departmentId || subdepartment?.departmentId?._id;
  const departmentName = location.state?.departmentName || subdepartment?.departmentId?.name;
  const levels = [...(levelsData?.data || [])].sort((a, b) => b.isActive - a.isActive);

  if (!subdepartment) return <div className="p-6">No subdepartment data found</div>;
  if (isLoading) return <Loader />;

  return (
    <>
<<<<<<< HEAD
      <Header
        title={subdepartment.name}
        showBack={true}
        breadcrumbs={[
          { label: "Departments", path: "/department-management" },
          { label: departmentName, path: "/department-details", state: { department: subdepartment?.departmentId } },
          { label: subdepartment.name },
        ]}
      />

      <div className="px-6">
        <div className="flex items-end justify-between py-5">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{subdepartment.name}</h1>
            <p className="text-sm text-gray-500 mt-0.5">Manage levels</p>
=======
      <Header title={subdepartment.name} showBack={true} breadcrumbs={[
        { label: 'Department', path: '/department-management' },
        { label: departmentName, path: -1 },
        { label: subdepartment.name }
      ]} />
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Subdepartment Header */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 px-6 py-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                <MdAccountTree size={28} className="text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900">{subdepartment.name}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`inline-block px-3 py-1 text-xs rounded-full ${
                    subdepartment.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}>
                    {subdepartment.isActive ? "Active" : "Inactive"}
                  </span>
                  <span className="text-xs text-gray-500">•</span>
                  <div className="flex items-center gap-1 text-xs text-gray-600">
                    <MdBusiness size={14} />
                    <span>{departmentName || "Unknown Department"}</span>
                  </div>
                </div>
              </div>
            </div>
>>>>>>> e6ed6725dca0feb3e819c6f44212330195120b3f
          </div>
          <Formik
            initialValues={{ name: "", order: "", isActive: true }}
            validationSchema={validationSchema}
            onSubmit={async (values, { setSubmitting, resetForm }) => {
              try {
                await addLevel({ name: values.name, order: Number(values.order), subDepartmentId: subdepartmentId, isActive: values.isActive }).unwrap();
                toast.success("Level added successfully!");
                resetForm();
                refetch();
              } catch (error) {
                toast.error(error?.data?.message || "Error adding level");
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {({ isSubmitting, submitForm, resetForm }) => (
              <OrangeButton
                buttonTitle="+ Add Level"
                panelTitle="Add New Level"
                drawerContent={
                  <Form className="space-y-4">
                    <InputField label="Level Name" name="name" placeholder="Enter level name" />
                    <InputField label="Order" name="order" type="number" placeholder="Enter order number" />
                    <RadioGroup label="Status" name="isActive" required={false} />
                  </Form>
                }
                leftBtnText="Cancel"
                rightBtnText={isSubmitting ? "Adding..." : "Add Level"}
                onLeftClick={resetForm}
                onRightClick={submitForm}
              />
            )}
          </Formik>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {levels.length === 0 ? (
            <div className="col-span-full text-center py-16">
              <MdLayers size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">No levels found</p>
            </div>
          ) : (
            levels.map((level) => (
              <SubLevelCount
                key={level._id}
                levelId={level._id}
                render={(subLevelCount) => (
                  <CommonCard
                    variant="card1"
                    icon={MdLayers}
                    title={level.name}
                    status={level.isActive}
                    infoItems={[
                      { icon: <MdLayers size={14} className="text-orange-400" />, label: "SubLevels", value: subLevelCount },
                      { icon: <MdLayers size={14} className="text-orange-400" />, label: "Order", value: level.order },
                    ]}
                    onView={() => navigate("/show-sublevel-tables", { state: { level, subdepartment, departmentId, departmentName } })}
                    onEdit={
                      <Formik
                        key={level._id}
                        initialValues={{ name: level.name, order: level.order, isActive: level.isActive }}
                        validationSchema={validationSchema}
                        onSubmit={async (values, { setSubmitting, resetForm }) => {
                          try {
                            await updateLevel({ levelId: level._id, name: values.name, order: Number(values.order), subDepartmentId: subdepartmentId, isActive: values.isActive }).unwrap();
                            toast.success("Level updated successfully!");
                            resetForm();
                            refetch();
                          } catch (error) {
                            toast.error(error?.data?.message || "Error updating level");
                          } finally {
                            setSubmitting(false);
                          }
                        }}
                      >
                        {({ isSubmitting, submitForm, resetForm }) => (
                          <OrangeButton
                            buttonTitle="Edit"
                            panelTitle="Edit Level"
                            customButtonClass="w-full bg-orange-500 text-white rounded-lg py-2 text-sm font-semibold hover:bg-orange-600 transition"
                            drawerContent={
                              <Form className="space-y-4">
                                <InputField label="Level Name" name="name" placeholder="Enter level name" />
                                <InputField label="Order" name="order" type="number" placeholder="Enter order number" />
                                <RadioGroup label="Status" name="isActive" required={false} />
                              </Form>
                            }
                            leftBtnText="Cancel"
                            rightBtnText={isSubmitting ? "Updating..." : "Update Level"}
                            onLeftClick={resetForm}
                            onRightClick={submitForm}
                          />
                        )}
                      </Formik>
                    }
                  />
                )}
              />
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default SubdepartmentDetails;
