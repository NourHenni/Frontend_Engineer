import FormModal from "../../../components/modals/FormModal";

function AddPfa({ isModalOpen, setIsModalOpen, title }) {
  const formFields = [
    {
      label: "Titre du sujet",
      name: "title",
      type: "input",
      rules: [
        { required: true, message: "Veuillez entrer le titre du sujet  !" },
      ],
    },

    {
      label: "Technologies",
      name: "technologies",
      type: "input",
      rules: [
        {
          required: true,
          message: "Veuillez entrer au moins une technologie !",
        },
      ],
    },
    {
      label: "En Binome ? ", // Empty label for alignment
      name: "estBinome",
      type: "checkbox",
      valuePropName: "checked",
      rules: [{ required: true, message: "Veuillez indiquer le type !" }],
      style: { marginBottom: 0 },
      wrapperCol: { span: 16, offset: 6 }, // Align with input fields
    },
    {
      label: "Etudiants",
      name: "etudiants",
      type: "input",
      rules: [{ required: false }],
      style: { marginTop: 0 }, // Remove top margin
    },
  ];

  return (
    <div>
      <FormModal
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        formFields={formFields}
        title={title}
      />
    </div>
  );
}

export default AddPfa;
