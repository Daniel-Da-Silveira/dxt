//--------------------------------------
// Join conditions
//--------------------------------------
router.post("/form-editor/conditions-manager/join", function (req, res) {
  const formData = req.session.data || {};
  const formPages = req.session.data.formPages || [];
  const conditionIds = JSON.parse(req.body.conditionIds);
  const operator = req.body.operator;
  const newConditionName = req.body.newConditionName;

  // Initialize form-level conditions array if it doesn't exist
  if (!formData.conditions) {
    formData.conditions = [];
  }

  // Find all the conditions to be joined
  const conditionsToJoin = [];

  // First check form-level conditions
  if (formData.conditions) {
    formData.conditions.forEach((condition) => {
      if (
        conditionIds.includes(condition.id.toString()) &&
        !conditionsToJoin.some((c) => c.id === condition.id)
      ) {
        conditionsToJoin.push(condition);
      }
    });
  }

  // Then check page-level conditions
  formPages.forEach((page) => {
    if (page.conditions) {
      page.conditions.forEach((condition) => {
        if (
          conditionIds.includes(condition.id.toString()) &&
          !conditionsToJoin.some((c) => c.id === condition.id)
        ) {
          conditionsToJoin.push(condition);
        }
      });
    }
  });

  // Sort conditions to match the order of conditionIds
  conditionsToJoin.sort((a, b) => {
    return (
      conditionIds.indexOf(a.id.toString()) -
      conditionIds.indexOf(b.id.toString())
    );
  });

  // Create the new joined condition
  const newCondition = {
    id: Date.now(),
    conditionName: newConditionName,
    rules: [],
  };

  // Add rules from all conditions with the specified operator
  conditionsToJoin.forEach((condition, conditionIndex) => {
    condition.rules.forEach((rule, ruleIndex) => {
      // Only add logical operator if:
      // 1. This is not the first rule of the first condition
      // 2. The rule doesn't already have a logical operator
      const shouldAddOperator =
        (conditionIndex > 0 || ruleIndex > 0) && !rule.logicalOperator;

      newCondition.rules.push({
        ...rule,
        logicalOperator: shouldAddOperator ? operator : rule.logicalOperator,
      });
    });
  });

  // Create the text representation of the joined condition
  newCondition.text = newCondition.rules
    .map((rule, index) => {
      const valueText = Array.isArray(rule.value)
        ? rule.value.map((v) => `'${v}'`).join(" or ")
        : `'${rule.value}'`;

      // Only include the logical operator if it exists
      return index === 0
        ? `${rule.questionText} ${rule.operator} ${valueText}`
        : `${rule.logicalOperator || ""} ${rule.questionText} ${
            rule.operator
          } ${valueText}`;
    })
    .join(" ")
    .trim(); // Trim to remove any extra spaces

  // Check if a condition with this name already exists at form level
  const existingConditionIndex = formData.conditions.findIndex(
    (c) => c.conditionName === newConditionName
  );

  if (existingConditionIndex !== -1) {
    // Replace the existing condition
    formData.conditions[existingConditionIndex] = newCondition;
  } else {
    // Add the new condition to form-level conditions
    formData.conditions.push(newCondition);
  }

  // Remove any duplicate conditions from pages
  formPages.forEach((page) => {
    if (page.conditions) {
      // Remove any conditions that were used in the join
      page.conditions = page.conditions.filter(
        (c) => !conditionIds.includes(c.id.toString())
      );
    }
  });

  // Save back to session
  req.session.data = formData;

  res.redirect("/form-editor/conditions/manager");
});
