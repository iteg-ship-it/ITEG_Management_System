import { useState } from "react";
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


const SubdepartmentDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const subdepartmentId = location.state?.subdepartment?._id;
  const departmentId = location.state?.departmentId || location.state?.subdepartment?.departmentId?._id;

  const { data: subdepartmentData } = useGetSubdepartmentByIdQuery(subdepartmentId, { skip: !subdepartmentId });
  const { data: levelsData, isLoading, refetch } = useGetLevelsBySubdepartmentQuery(subdepartmentId, { skip: !subdepartmentId });
  const [addLevel] = useAddLevelMutation();
  const [updateLevel] = useUpdateLevelMutation();

  const [editingLevel,        setEditingLevel]        = useState(null);
  const [isEditDrawerOpen,    setIsEditDrawerOpen]    = useState(false);
  const [isSubLevelDrawerOpen,setIsSubLevelDrawerOpen]= useState(false);
  const [editingSubLevel,     setEditingSubLevel]     = useState(null);
  const [selectedLevel,       setSelectedLevel]       = useState(null);

  const subdepartment  = subdepartmentData?.data || location.state?.subdepartment;
  const departmentName = location.state?.departmentName || subdepartment?.departmentId?.name;
  const levels = [...(levelsData?.data || [])].sort((a, b) => b.isActive - a.isActive);

  if (!subdepartment) return <div className="p-6">No subdepartment data found</div>;
  if (isLoading) return <Loader />;

  /* ════════════════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════════════════ */
  return (
    <>
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
          <Header
            title={subdepartment.name}
            showBack={true}
            breadcrumbs={[
              { label: "Departments", path: "/department-management" },
              { label: departmentName || "Department", path: `/department-details/${departmentId}`, state: { department: subdepartment?.departmentId } },
              { label: subdepartment.name },
            ]}
          >
            <OrangeButton
              buttonTitle="+ New Level"
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
          </Header>
        )}
      </Formik>

      <div className="px-6">
        <div className="flex items-end justify-between py-5">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{subdepartment.name}</h1>
            <p className="text-sm text-gray-500 mt-0.5">Manage levels</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 mt-6">
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
