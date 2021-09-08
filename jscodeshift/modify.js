const jf = require("jscodeshift");
const fs = require('fs')

const value = `
import React from 'react';
import { Button, Input } from 'antd';
`;

const root = jf(value);
root
  .find(jf.ImportDeclaration, { source: { value: "antd" } })
  .forEach((path) => {
    const { specifiers } = path.node;
    specifiers.forEach((spec) => {
      if (spec.imported.name === "Button") {
        spec.imported.name = "Select";
      }
    });
  });

fs.writeFileSync('./jscodeshift/modified.js', root.toSource())

//  node jscodeshift/modify.js