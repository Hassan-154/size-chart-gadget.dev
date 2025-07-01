import { Modal, TextField, Text, Button, FormLayout } from "@shopify/polaris";
import { useCallback, useState, useEffect, useMemo } from "react";
import measurementFields from "../constants/measurementFields.json";

function MeasurementModal({ open, onClose, lineItem, onUpdate }) {
  const [fields, setFields] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open && lineItem) {
      setFields(lineItem);
      setErrors({});  
    }
  }, [open, lineItem]);

  const handleChange = useCallback((value, key) => {
    const fieldDef = measurementFields.find(f => f.key === key);
    let filteredValue = value;
    if (fieldDef?.type === "number") {
      filteredValue = value.replace(/[^\d.]/g, "");
      filteredValue = filteredValue === "" ? undefined : Number(filteredValue);
    }
    setFields((prev) => ({ ...prev, [key]: filteredValue }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }, []);

  const handleUpdate = () => {
    const newErrors = {};
    measurementFields.forEach((field) => {
      if (
        (field.type === "number" && (fields[field.key] === undefined || fields[field.key] === null || isNaN(fields[field.key]))) ||
        (field.type !== "number" && (!fields[field.key] || String(fields[field.key]).trim() === ""))
      ) {
        newErrors[field.key] = field.errorMessage;
      }
    });
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      return;
    }
    if (onUpdate) onUpdate(fields);
    onClose();
  };

  const groupedFields = useMemo(() => {
    const groups = [];
    for (let i = 0; i < measurementFields.length; i += 4) {
      groups.push(measurementFields.slice(i, i + 4));
    }
    return groups;
  }, []);

  return (
    <Modal size="large" open={open} onClose={onClose} title={lineItem ? `Size title: ${lineItem.name}` : "Edit Size"}>
      <Modal.Section size="large">
        <Text variant="headingMd" as="h2">Measurement Details</Text>
        {lineItem ? (
          <FormLayout>
            {groupedFields.map((group) => (
              <FormLayout.Group key={group[0].key}>
                {group.map((field) => {
                  const isNumber = field.type === "number";
                  return (
                    <TextField
                      key={field.key}
                      label={field.label}
                      value={fields[field.key] ?? ""}
                      onChange={(value) => handleChange(value, field.key)}
                      autoComplete="off"
                      type={isNumber ? "text" : field.type}
                      inputMode={isNumber ? "numeric" : undefined}
                      error={errors[field.key]}
                    />
                  );
                })}
              </FormLayout.Group>
            ))}
          </FormLayout>
        ) : (
          <Text variant="bodyMd" as="p">This product was purchased with standard sizes.</Text>
        )}
        <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <Button onClick={onClose}>Close</Button>
          <Button onClick={handleUpdate} variant="primary">Update</Button>
        </div>
      </Modal.Section>
    </Modal>
  );
}

export default MeasurementModal;
