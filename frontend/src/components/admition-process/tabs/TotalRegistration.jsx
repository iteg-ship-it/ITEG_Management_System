const TotalRegistration = ({ data, toTitleCase }) => {
  const columns = [
    {
      key: "firstName",
      label: "Full Name",
      render: (row) => toTitleCase(`${row.firstName} ${row.lastName}`),
    },
    {
      key: "fatherName",
      label: "Father's Name",
      render: (row) => toTitleCase(row.fatherName),
    },
    { key: "studentMobile", label: "Mobile No.", align: "center" },
    {
      key: "subject12",
      label: "12th Subject",
      render: (row) => toTitleCase(row.stream),
    },
    {
      key: "course",
      label: "Course",
      render: (row) => toTitleCase(row.course),
    },
    {
      key: "village",
      label: "Village",
      render: (row) => toTitleCase(row.village),
    },
    {
      key: "track",
      label: "Bus Route",
      render: (row) => toTitleCase(row.track),
    },
  ];

  return { columns, actionButton: null };
};

export default TotalRegistration;
