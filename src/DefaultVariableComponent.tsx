import React, { useState } from 'react';
import { uniqueId } from 'lodash';
import { VariableRenderProps } from "./MarkWahlberg";

export const DefaultVariableComponent: React.FC<VariableRenderProps> = ({ name, value, defaultValue }) => {
    const [id] = useState<string>(uniqueId());
    const displayValue = value || defaultValue;

    return (
        <span id={`markvariable-${name}-${id}`}>
            {displayValue}
        </span>
    );
};

export default DefaultVariableComponent;
